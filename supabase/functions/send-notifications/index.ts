import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')!

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  // Protezione: solo chiamate autorizzate
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Cerca scadenze da notificare oggi:
  // due_date = TODAY + notify_before_days giorni
  // e notify_sent_at è null o è stato inviato più di 23 ore fa (evita duplicati)
  const { data: deadlines, error } = await supabase.rpc('get_deadlines_to_notify', {
    check_date: today,
  })

  if (error) {
    console.error('Errore query scadenze:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log(`Scadenze da notificare: ${deadlines?.length ?? 0}`)

  const results = { push: 0, email: 0, errors: 0 }

  for (const deadline of deadlines ?? []) {
    try {
      // ── Push notification ──────────────────────────────────
      if (deadline.notify_push) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth_key')
          .eq('user_id', deadline.user_id)

        const payload = JSON.stringify({
          title: `Scadenza: ${deadline.title}`,
          body: `Scade ${formatDaysLabel(deadline.notify_before_days)}`,
          url: `/deadlines/${deadline.id}`,
        })

        for (const sub of subs ?? []) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth_key },
              },
              payload
            )
            results.push++
          } catch (pushErr: any) {
            // Se la subscription è scaduta (410), la rimuoviamo
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint)
            }
            console.error('Push error:', pushErr.message)
          }
        }
      }

      // ── Email notification ─────────────────────────────────
      if (deadline.notify_email && deadline.user_email) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Scadix <notifiche@scadix.app>',
            to: [deadline.user_email],
            subject: `Promemoria: ${deadline.title}`,
            html: buildEmailHtml(deadline),
          }),
        })

        if (res.ok) {
          results.email++
        } else {
          const err = await res.text()
          console.error('Email error:', err)
          results.errors++
        }
      }

      // ── Aggiorna notify_sent_at ────────────────────────────
      await supabase
        .from('deadlines')
        .update({ notify_sent_at: new Date().toISOString() })
        .eq('id', deadline.id)

    } catch (err: any) {
      console.error(`Errore scadenza ${deadline.id}:`, err.message)
      results.errors++
    }
  }

  console.log('Risultati:', results)
  return new Response(JSON.stringify({ ok: true, processed: deadlines?.length ?? 0, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
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
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#ea580c;margin-bottom:8px">📅 Promemoria Scadenza</h2>
      <h3 style="margin:0 0 16px">${deadline.title}</h3>
      <p style="color:#6b7280;margin:0 0 8px">
        <strong>Scade il:</strong> ${new Date(deadline.due_date).toLocaleDateString('it-IT', { day:'numeric', month:'long', year:'numeric' })}
      </p>
      ${deadline.project_name ? `<p style="color:#6b7280;margin:0 0 8px"><strong>Progetto:</strong> ${deadline.project_name}</p>` : ''}
      ${deadline.asset_name ? `<p style="color:#6b7280;margin:0 0 16px"><strong>Asset:</strong> ${deadline.asset_name}</p>` : ''}
      <a href="https://scadix.app/deadlines/${deadline.id}"
         style="display:inline-block;background:#ea580c;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Vedi scadenza →
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">
        Scadix — Gestione Asset e Scadenze
      </p>
    </div>
  `
}
