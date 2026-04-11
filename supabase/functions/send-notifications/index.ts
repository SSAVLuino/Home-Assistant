import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Helpers base64url ──────────────────────────────────────────────────────
function b64urlToBytes(b64: string): Uint8Array {
  const padding = '='.repeat((4 - b64.length % 4) % 4)
  const b64std = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64std), c => c.charCodeAt(0))
}

function bytesToB64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { result.set(a, offset); offset += a.length }
  return result
}

// ── HKDF-SHA256 (usa Web Crypto nativo Deno) ──────────────────────────────
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8)
  return new Uint8Array(bits)
}

// ── VAPID JWT (ES256) ──────────────────────────────────────────────────────
async function createVapidJwt(
  endpoint: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  subject: string
): Promise<string> {
  const enc = new TextEncoder()
  const audience = new URL(endpoint).origin
  const exp = Math.floor(Date.now() / 1000) + 43200

  const headerB64 = bytesToB64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payloadB64 = bytesToB64url(enc.encode(JSON.stringify({ aud: audience, exp, sub: subject })))
  const signingInput = `${headerB64}.${payloadB64}`

  // Costruisce JWK dal public key (65 byte: 0x04 || x || y) e raw private key (32 byte)
  const pubBytes = b64urlToBytes(vapidPublicKeyB64)
  const jwk = {
    kty: 'EC', crv: 'P-256', ext: true,
    x: bytesToB64url(pubBytes.slice(1, 33)),
    y: bytesToB64url(pubBytes.slice(33, 65)),
    d: vapidPrivateKeyB64,
  }

  const signingKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    enc.encode(signingInput)
  )

  return `${signingInput}.${bytesToB64url(new Uint8Array(signature))}`
}

// ── Cifratura payload RFC 8291 (aes128gcm) ────────────────────────────────
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string
): Promise<{ body: Uint8Array }> {
  const enc = new TextEncoder()
  const payloadBytes = enc.encode(payload)
  const browserPubKeyBytes = b64urlToBytes(p256dhB64)
  const authBytes = b64urlToBytes(authB64)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Coppia di chiavi ECDH effimera del server
  const serverKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const serverPubKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeyPair.publicKey))

  // Import public key del browser
  const browserPubKey = await crypto.subtle.importKey(
    'raw', browserPubKeyBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )

  // ECDH: segreto condiviso
  const sharedSecretBits = await crypto.subtle.deriveBits({ name: 'ECDH', public: browserPubKey }, serverKeyPair.privateKey, 256)
  const sharedSecret = new Uint8Array(sharedSecretBits)

  // PRK
  const prkInfo = concat(enc.encode('WebPush: info\0'), browserPubKeyBytes, serverPubKeyRaw)
  const prk = await hkdf(authBytes, sharedSecret, prkInfo, 32)

  // CEK e Nonce
  const cek = await hkdf(salt, prk, concat(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])), 16)
  const nonce = await hkdf(salt, prk, concat(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])), 12)

  // Cifratura AES-128-GCM
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, concat(payloadBytes, new Uint8Array([2])))
  )

  // Header record: salt (16) + rs (4, big-endian) + idlen (1) + server public key (65)
  const rs = new Uint8Array(4)
  new DataView(rs.buffer).setUint32(0, 4096, false)
  const body = concat(salt, rs, new Uint8Array([65]), serverPubKeyRaw, ciphertext)

  return { body }
}

// ── Invio push ─────────────────────────────────────────────────────────────
async function sendWebPush(
  endpoint: string,
  p256dhB64: string,
  authB64: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
  payload: string
): Promise<void> {
  const jwt = await createVapidJwt(endpoint, vapidPublicKeyB64, vapidPrivateKeyB64, vapidEmail)
  const { body } = await encryptPayload(payload, p256dhB64, authB64)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization': `vapid t=${jwt},k=${vapidPublicKeyB64}`,
      'TTL': '86400',
    },
    body,
  })

  if (!res.ok && res.status !== 201) {
    const text = await res.text()
    throw new Error(`Push failed ${res.status}: ${text}`)
  }
}

// ── Handler principale ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    console.log('=== send-notifications avviata ===')

    const CRON_SECRET = Deno.env.get('CRON_SECRET')
    if (!CRON_SECRET) return new Response('Server misconfigured', { status: 500 })

    const cronHeader = req.headers.get('x-cron-secret')
    if (cronHeader !== CRON_SECRET) return new Response('Unauthorized', { status: 401 })

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
    const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    console.log('Env:', { vapidPublic: !!VAPID_PUBLIC_KEY, vapidPrivate: !!VAPID_PRIVATE_KEY, resend: !!RESEND_API_KEY })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const today = new Date().toISOString().split('T')[0]

    const { data: deadlines, error } = await supabase.rpc('get_deadlines_to_notify', { check_date: today })
    if (error) {
      console.error('RPC error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    console.log(`Scadenze trovate: ${deadlines?.length ?? 0}`)
    const results = { push: 0, email: 0, errors: 0 }

    for (const deadline of deadlines ?? []) {
      console.log(`Processo: ${deadline.title}`)

      // Push
      if (deadline.notify_push && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_EMAIL) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth_key')
          .eq('user_id', deadline.user_id)

        for (const sub of subs ?? []) {
          try {
            await sendWebPush(
              sub.endpoint, sub.p256dh, sub.auth_key,
              VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL,
              JSON.stringify({
                title: `Scadenza: ${deadline.title}`,
                body: `Scade ${formatDaysLabel(deadline.notify_before_days)}`,
                url: `/deadlines/${deadline.id}`,
              })
            )
            results.push++
            console.log('Push OK')
          } catch (e: any) {
            console.error('Push error:', e.message)
            if (e.message?.includes('410') || e.message?.includes('404')) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
            }
            results.errors++
          }
        }
      }

      // Email
      if (deadline.notify_email && deadline.user_email && RESEND_API_KEY) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: 'Scadix <onboarding@resend.dev>',
              to: [deadline.user_email],
              subject: `Promemoria: ${deadline.title}`,
              html: buildEmailHtml(deadline),
            }),
          })
          if (res.ok) { results.email++; console.log('Email OK') }
          else { console.error('Email error:', await res.text()); results.errors++ }
        } catch (e: any) { console.error('Email exception:', e.message); results.errors++ }
      }

      await supabase.from('deadlines').update({ notify_sent_at: new Date().toISOString() }).eq('id', deadline.id)
    }

    console.log('Risultati:', results)
    return new Response(JSON.stringify({ ok: true, processed: deadlines?.length ?? 0, results }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (e: any) {
    console.error('Errore non gestito:', e.message)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDaysLabel(days: number): string {
  if (days === 1) return 'domani'
  if (days === 7) return 'tra 1 settimana'
  if (days === 14) return 'tra 2 settimane'
  if (days === 30) return 'tra 1 mese'
  return `tra ${days} giorni`
}

function buildEmailHtml(deadline: any): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="color:#ea580c">📅 Promemoria Scadenza</h2>
    <h3>${deadline.title}</h3>
    <p><strong>Scade il:</strong> ${new Date(deadline.due_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    ${deadline.project_name ? `<p><strong>Progetto:</strong> ${deadline.project_name}</p>` : ''}
    ${deadline.asset_name ? `<p><strong>Asset:</strong> ${deadline.asset_name}</p>` : ''}
    <a href="https://scadix.app/deadlines/${deadline.id}" style="display:inline-block;background:#ea580c;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Vedi scadenza →</a>
  </div>`
}
