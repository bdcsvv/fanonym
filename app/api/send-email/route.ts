import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY

type EmailType = 
  | 'withdraw_success'
  | 'verification_approved'
  | 'verification_rejected'
  | 'reset_password'
  | 'data_changed'
  | 'chat_unlocked'
  | 'chat_accepted'
  | 'topup_approved'
  | 'topup_rejected'
  | 'admin_topup_alert'
  | 'admin_withdraw_alert'
  | 'admin_verify_alert'

// ─── BASE LAYOUT — Purple/Fanonym vibe, no green ─────────────────────────────
const html = (body: string) => `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0e0b1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#0e0b1a 0%,#130d24 50%,#0e0b1a 100%);padding:48px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

  <!-- LOGO -->
  <tr><td align="center" style="padding-bottom:24px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#6700e8,#9333ea);padding:10px 22px;border-radius:14px;">
      <span style="font-size:22px;font-weight:900;font-style:italic;letter-spacing:-1px;color:#ffffff;">fanonym</span>
    </div>
  </td></tr>

  <!-- CARD -->
  <tr><td style="background:rgba(255,255,255,0.04);border-radius:24px;border:1px solid rgba(147,51,234,0.2);overflow:hidden;backdrop-filter:blur(10px);">
    ${body}
  </td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="padding-top:24px;">
    <p style="margin:0;font-size:11px;color:#3a2f5a;">
      © 2025 Fanonym · <a href="https://fanonym.id" style="color:#7c3aed;text-decoration:none;">fanonym.id</a>
    </p>
    <p style="margin:6px 0 0;font-size:11px;color:#2a2040;">Abaikan email ini jika kamu tidak merasa melakukan aksi ini.</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const topBar = (color: string) =>
  `<div style="height:3px;background:linear-gradient(90deg,transparent,${color},transparent);"></div>`

const iconBubble = (emoji: string) =>
  `<div style="width:72px;height:72px;border-radius:50%;background:rgba(103,0,232,0.15);border:1px solid rgba(103,0,232,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px;text-align:center;line-height:72px;">${emoji}</div>`

const cardTitle = (text: string) =>
  `<h1 style="margin:0 0 6px;text-align:center;font-size:24px;font-weight:800;color:#e8e0ff;letter-spacing:-0.5px;">${text}</h1>`

const cardSubtitle = (text: string) =>
  `<p style="margin:0 0 28px;text-align:center;font-size:13px;color:#6b5a9e;">${text}</p>`

const divider = () =>
  `<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(147,51,234,0.3),transparent);margin:24px 0;"></div>`

const greeting = (name: string) =>
  `<p style="margin:0 0 12px;font-size:15px;color:#8b7ab8;">Hai, <strong style="color:#d4c8f0;">${name}</strong> 👋</p>`

const bodyText = (text: string) =>
  `<p style="margin:0 0 20px;font-size:14px;color:#6b5a9e;line-height:1.75;">${text}</p>`

const infoTable = (rows: {label: string; value: string; accent?: boolean}[]) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(103,0,232,0.08);border:1px solid rgba(103,0,232,0.2);border-radius:16px;overflow:hidden;margin:16px 0;">
  ${rows.map((r, i) => `
  <tr>
    <td style="padding:${i===0?'14px 20px 8px':'8px 20px'};font-size:11px;font-weight:700;letter-spacing:1px;color:#4a3870;text-transform:uppercase;">${r.label}</td>
    <td style="padding:${i===0?'14px 20px 8px':'8px 20px'};font-size:14px;font-weight:700;color:${r.accent?'#a78bfa':'#c4b5fd'};text-align:right;">${r.value}</td>
  </tr>
  ${i < rows.length-1 ? '<tr><td colspan="2"><div style="height:1px;background:rgba(103,0,232,0.12);margin:0 20px;"></div></td></tr>' : ''}
  `).join('')}
</table>`

const warningBox = (text: string) =>
  `<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px 18px;margin:16px 0;">
    <p style="margin:0;font-size:13px;color:#f87171;line-height:1.6;">⚠️ ${text}</p>
  </div>`

const ctaBtn = (text: string, url: string) =>
  `<div style="text-align:center;margin-top:28px;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#9333ea);color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:14px;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(103,0,232,0.4);">${text}</a>
  </div>`

// ─── TEMPLATES ───────────────────────────────────────────────────────────────
const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: (data: any) => string }> = {

  topup_approved: {
    subject: 'Topup Berhasil ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('💜')}
        ${cardTitle('Topup Berhasil!')}
        ${cardSubtitle('Kredit kamu sudah ditambahkan')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Pembayaran kamu telah dikonfirmasi. Kredit sudah masuk dan siap digunakan untuk chat dengan creator favoritmu.')}
        ${infoTable([
          { label: 'Jumlah Kredit', value: `+${d.amount} Kredit`, accent: true },
          { label: 'Status', value: '✓ Berhasil', accent: true },
        ])}
        ${ctaBtn('Lihat Saldo', d.dashboardUrl || 'https://fanonym.id/dashboard/sender')}
      </div>
    `),
  },

  topup_rejected: {
    subject: 'Topup Ditolak — Fanonym',
    body: (d) => html(`
      ${topBar('#dc2626')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('❌')}
        ${cardTitle('Topup Ditolak')}
        ${cardSubtitle('Ada masalah dengan bukti pembayaran')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Maaf, kami tidak bisa memproses topup kamu kali ini. Silakan coba lagi dengan bukti pembayaran yang lebih jelas.')}
        ${warningBox('Pastikan foto bukti transfer jelas, tidak terpotong, dan nominalnya sesuai.')}
        ${ctaBtn('Topup Ulang', d.topupUrl || 'https://fanonym.id/topup')}
      </div>
    `),
  },

  withdraw_success: {
    subject: 'Withdraw Berhasil ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('💸')}
        ${cardTitle('Withdraw Berhasil!')}
        ${cardSubtitle('Dana sedang dalam proses pencairan')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Request withdraw kamu telah diproses. Dana akan masuk ke rekening dalam <strong style="color:#c4b5fd;">1–3 hari kerja</strong>.')}
        ${infoTable([
          { label: 'Jumlah', value: `${d.amount} Kredit`, accent: true },
          { label: 'Status', value: '✓ Diproses', accent: true },
        ])}
      </div>
    `),
  },

  verification_approved: {
    subject: 'Selamat! Kamu Sudah Verified ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('🎉')}
        ${cardTitle('Kamu Sudah Verified!')}
        ${cardSubtitle('Identitas kamu berhasil diverifikasi')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Selamat! Akun creator kamu kini memiliki status <strong style="color:#c4b5fd;">Verified</strong>. Kamu bisa menikmati semua fitur creator secara penuh.')}
        ${infoTable([
          { label: 'Badge', value: '✓ Verified Creator', accent: true },
          { label: 'Fitur Withdraw', value: 'Aktif', accent: true },
        ])}
        ${ctaBtn('Buka Dashboard', d.dashboardUrl || 'https://fanonym.id/dashboard/creator')}
      </div>
    `),
  },

  verification_rejected: {
    subject: 'Verifikasi Belum Berhasil — Fanonym',
    body: (d) => html(`
      ${topBar('#dc2626')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('😔')}
        ${cardTitle('Verifikasi Ditolak')}
        ${cardSubtitle('Dokumen belum memenuhi syarat')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Maaf, kami belum bisa memverifikasi identitasmu. Silakan upload ulang dengan dokumen yang lebih jelas.')}
        ${warningBox('Pastikan foto KTP tidak terpotong, selfie sesuai KTP, dan semua teks terbaca jelas.')}
        ${ctaBtn('Upload Ulang', d.settingsUrl || 'https://fanonym.id/settings')}
      </div>
    `),
  },

  reset_password: {
    subject: 'Password Berhasil Diubah — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('🔐')}
        ${cardTitle('Password Diubah')}
        ${cardSubtitle('Perubahan keamanan akun')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Password akun Fanonym kamu telah berhasil diperbarui.')}
        ${warningBox('Jika kamu tidak merasa mengubah password, segera amankan akunmu di fanonym.id')}
      </div>
    `),
  },

  data_changed: {
    subject: 'Data Akun Diubah — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('🔔')}
        ${cardTitle('Data Akun Diubah')}
        ${cardSubtitle('Ada perubahan pada akunmu')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText(d.changeDescription)}
        ${warningBox('Jika kamu tidak melakukan perubahan ini, segera ganti password dan hubungi kami.')}
      </div>
    `),
  },

  chat_unlocked: {
    subject: 'Ada Chat Request Baru! — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('💬')}
        ${cardTitle('Chat Request Baru!')}
        ${cardSubtitle('Seseorang ingin chat denganmu secara anonim')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Kamu mendapat chat request baru! Segera buka dashboard dan terima sebelum expired.')}
        ${infoTable([
          { label: 'Durasi Chat', value: `${d.duration} jam`, accent: true },
          { label: 'Nilai', value: `${d.credits} Kredit`, accent: true },
        ])}
        ${ctaBtn('Lihat Request', d.dashboardUrl || 'https://fanonym.id/dashboard/creator')}
      </div>
    `),
  },

  chat_accepted: {
    subject: 'Chat Kamu Diterima! — Fanonym',
    body: (d) => html(`
      ${topBar('#9333ea')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('✨')}
        ${cardTitle('Chat Diterima!')}
        ${cardSubtitle('Creator sudah siap chat denganmu')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText(`<strong style="color:#d4c8f0;">${d.creatorName || 'Creator'}</strong> telah menerima chat request kamu. Yuk mulai ngobrol sekarang sebelum waktu habis!`)}
        ${ctaBtn('Mulai Chat', d.chatUrl || 'https://fanonym.id/dashboard/sender')}
      </div>
    `),
  },

  admin_topup_alert: {
    subject: '[ADMIN] Topup Request Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('🔔')}
        ${cardTitle('Topup Request Baru')}
        ${cardSubtitle('Perlu review dan approval')}
        ${divider()}
        ${bodyText('Ada topup request baru yang menunggu konfirmasi.')}
        ${infoTable([
          { label: 'User', value: d.username, accent: true },
          { label: 'Jumlah', value: `${d.amount} Kredit` },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2')}
      </div>
    `),
  },

  admin_withdraw_alert: {
    subject: '[ADMIN] Withdraw Request Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('💸')}
        ${cardTitle('Withdraw Request Baru')}
        ${cardSubtitle('Perlu diproses segera')}
        ${divider()}
        ${bodyText('Ada withdraw request dari creator yang menunggu diproses.')}
        ${infoTable([
          { label: 'Creator', value: d.username, accent: true },
          { label: 'Jumlah', value: `${d.amount} Kredit` },
          { label: 'Bank', value: d.bank || '-' },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2')}
      </div>
    `),
  },

  admin_verify_alert: {
    subject: '[ADMIN] Verifikasi Creator Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:36px 32px 32px;">
        ${iconBubble('🪪')}
        ${cardTitle('Verifikasi Creator Baru')}
        ${cardSubtitle('Ada dokumen yang perlu direview')}
        ${divider()}
        ${bodyText('Ada creator baru yang mengajukan verifikasi identitas.')}
        ${infoTable([
          { label: 'Creator', value: d.username, accent: true },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Review Sekarang', 'https://fanonym.id/fyn-secure-panel-x7k2')}
      </div>
    `),
  },
}

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }
  try {
    const { to, type, data } = await req.json()
    if (!to || !type || !EMAIL_TEMPLATES[type as EmailType]) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const template = EMAIL_TEMPLATES[type as EmailType]
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Fanonym <noreply@fanonym.id>',
        to: [to],
        subject: template.subject,
        html: template.body(data || {}),
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('Resend error:', result)
      return NextResponse.json({ error: result }, { status: 500 })
    }
    return NextResponse.json({ success: true, id: result.id })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
