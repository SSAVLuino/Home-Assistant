import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    webpush.setVapidDetails(
      process.env.VAPID_EMAIL!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const today = new Date().toISOString().split('T')[0]
    const { data: deadlines, error } = await supabase.rpc('get_deadlines_to_notify', { check_date: today })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = { push: 0, email: 0, errors: 0 }

    for (const deadline of deadlines ?? []) {
      // Push
      if (deadline.notify_push) {
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth_key')
          .eq('user_id', deadline.user_id)

        for (const sub of subs ?? []) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
              JSON.stringify({
                title: `Scadenza: ${deadline.title}`,
                body: `Scade ${formatDaysLabel(deadline.notify_before_days)}`,
                url: `/deadlines/${deadline.id}`,
              })
            )
            results.push++
          } catch (e: any) {
            console.error('Push error:', e.message)
            if (e.statusCode === 410 || e.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
            }
            results.errors++
          }
        }
      }

      // Email
      if (deadline.notify_email && deadline.user_email) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? '587'),
            secure: parseInt(process.env.SMTP_PORT ?? '587') === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          })
          await transporter.sendMail({
            from: `Scadix <${process.env.SMTP_MAIL}>`,
            to: deadline.user_email,
            subject: `Promemoria: ${deadline.title}`,
            html: buildEmailHtml(deadline),
          })
          results.email++
        } catch (e: any) {
          console.error('Email error:', e.message)
          results.errors++
        }
      }

      await supabase.from('deadlines').update({ notify_sent_at: new Date().toISOString() }).eq('id', deadline.id)
    }

    return NextResponse.json({ ok: true, processed: deadlines?.length ?? 0, results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function formatDaysLabel(days: number): string {
  if (days === 1) return 'domani'
  if (days === 7) return 'tra 1 settimana'
  if (days === 14) return 'tra 2 settimane'
  if (days === 30) return 'tra 1 mese'
  return `tra ${days} giorni`
}

function buildEmailHtml(deadline: any): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="color:#ea580c">Promemoria Scadenza</h2>
    <h3>${deadline.title}</h3>
    <p><strong>Scade il:</strong> ${new Date(deadline.due_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    ${deadline.project_name ? `<p><strong>Progetto:</strong> ${deadline.project_name}</p>` : ''}
    ${deadline.asset_name ? `<p><strong>Asset:</strong> ${deadline.asset_name}</p>` : ''}
    <a href="https://scadix.cesena.biz/deadlines/${deadline.id}" style="display:inline-block;background:#ea580c;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Vedi scadenza</a>
  </div>`
}
