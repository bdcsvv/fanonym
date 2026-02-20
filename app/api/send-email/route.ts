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

// ─── BASE LAYOUT ─────────────────────────────────────────────────────────────
const html = (body: string) => `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fanonym</title>
</head>
<body style="margin:0;padding:0;background:#0b0b12;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b12;padding:48px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

  <!-- LOGO -->
  <tr><td align="center" style="padding-bottom:28px;">
    <span style="font-size:26px;font-weight:900;font-style:italic;letter-spacing:-1px;background:linear-gradient(135deg,#6700e8,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#9333ea;">fanonym</span>
  </td></tr>

  <!-- CARD -->
  <tr><td style="background:#13131f;border-radius:20px;border:1px solid #1e1e32;overflow:hidden;">
    ${body}
  </td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="padding-top:24px;">
    <p style="margin:0;font-size:11px;color:#2e2e48;">
      © 2025 Fanonym · <a href="https://fanonym.id" style="color:#6700e8;text-decoration:none;">fanonym.id</a>
    </p>
    <p style="margin:6px 0 0;font-size:11px;color:#1e1e35;">Abaikan email ini jika kamu tidak merasa melakukan aksi ini.</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const topBar = (color: string) =>
  `<div style="height:3px;background:linear-gradient(90deg,${color},${color}88,${color});"></div>`

const iconCircle = (emoji: string, bgColor: string) =>
  `<div style="width:64px;height:64px;border-radius:50%;background:${bgColor};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;text-align:center;line-height:64px;">${emoji}</div>`

const cardTitle = (text: string, color: string) =>
  `<h1 style="margin:0 0 6px;text-align:center;font-size:22px;font-weight:800;color:${color};letter-spacing:-0.5px;">${text}</h1>`

const cardSubtitle = (text: string) =>
  `<p style="margin:0 0 24px;text-align:center;font-size:13px;color:#4a4a68;">${text}</p>`

const divider = () =>
  `<div style="height:1px;background:#1a1a2e;margin:20px 0;"></div>`

const greeting = (name: string) =>
  `<p style="margin:0 0 10px;font-size:15px;color:#8080a8;">Hai, <strong style="color:#d4d4f0;">${name}</strong> 👋</p>`

const bodyText = (text: string) =>
  `<p style="margin:0 0 20px;font-size:14px;color:#5a5a7a;line-height:1.7;">${text}</p>`

const infoTable = (rows: {label: string; value: string; valueColor?: string}[]) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;border:1px solid #16162a;border-radius:14px;overflow:hidden;margin:16px 0;">
  ${rows.map((r, i) => `
  <tr>
    <td style="padding:${i===0?'14px 18px 10px':'10px 18px'};font-size:11px;font-weight:700;letter-spacing:0.8px;color:#32324a;text-transform:uppercase;">${r.label}</td>
    <td style="padding:${i===0?'14px 18px 10px':'10px 18px'};font-size:14px;font-weight:700;color:${r.valueColor||'#c0c0e0'};text-align:right;">${r.value}</td>
  </tr>
  ${i < rows.length-1 ? '<tr><td colspan="2"><div style="height:1px;background:#111124;margin:0 18px;"></div></td></tr>' : ''}
  `).join('')}
</table>`

const warningBox = (text: string) =>
  `<div style="background:#160808;border:1px solid #2a1010;border-radius:12px;padding:14px 18px;margin:16px 0;">
    <p style="margin:0;font-size:13px;color:#cc6666;line-height:1.6;">⚠️ ${text}</p>
  </div>`

const ctaBtn = (text: string, url: string, color: string) =>
  `<div style="text-align:center;margin-top:24px;">
    <a href="${url}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:0.3px;">${text}</a>
  </div>`

// ─── TEMPLATES ───────────────────────────────────────────────────────────────
const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: (data: any) => string }> = {

  topup_approved: {
    subject: 'Topup Berhasil ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#22c55e')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('✓', '#0a1f0c')}
        ${cardTitle('Topup Berhasil!', '#4ade80')}
        ${cardSubtitle('Kredit kamu sudah ditambahkan')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Pembayaran kamu telah dikonfirmasi. Kredit sudah masuk dan siap digunakan untuk chat dengan creator favoritmu.')}
        ${infoTable([
          { label: 'Jumlah Kredit', value: `+${d.amount} Kredit`, valueColor: '#4ade80' },
          { label: 'Status', value: '✓ Berhasil', valueColor: '#4ade80' },
        ])}
        ${ctaBtn('Lihat Saldo', d.dashboardUrl || 'https://fanonym.id/dashboard/sender', 'linear-gradient(135deg,#16a34a,#22c55e)')}
      </div>
    `),
  },

  topup_rejected: {
    subject: 'Topup Ditolak — Fanonym',
    body: (d) => html(`
      ${topBar('#ef4444')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('✕', '#1f0a0a')}
        ${cardTitle('Topup Ditolak', '#f87171')}
        ${cardSubtitle('Ada masalah dengan bukti pembayaran')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Maaf, kami tidak bisa memproses topup kamu kali ini. Silakan coba lagi dengan bukti pembayaran yang lebih jelas.')}
        ${infoTable([
          { label: 'Penyebab Umum', value: 'Bukti tidak valid' },
          { label: 'Solusi', value: 'Upload ulang' },
        ])}
        ${warningBox('Pastikan foto bukti transfer jelas, tidak terpotong, dan nominalnya sesuai.')}
        ${ctaBtn('Topup Ulang', d.topupUrl || 'https://fanonym.id/topup', 'linear-gradient(135deg,#dc2626,#ef4444)')}
      </div>
    `),
  },

  withdraw_success: {
    subject: 'Withdraw Berhasil ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#22c55e')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('💸', '#0a1f0c')}
        ${cardTitle('Withdraw Berhasil!', '#4ade80')}
        ${cardSubtitle('Dana sedang dalam proses pencairan')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Request withdraw kamu telah diproses. Dana akan masuk ke rekening dalam <strong style="color:#c0c0e0;">1–3 hari kerja</strong>.')}
        ${infoTable([
          { label: 'Jumlah', value: `${d.amount} Kredit`, valueColor: '#4ade80' },
          { label: 'Bank', value: d.bank || '-' },
          { label: 'No. Rekening', value: d.account_number || '-' },
          { label: 'Status', value: '✓ Diproses', valueColor: '#4ade80' },
        ])}
      </div>
    `),
  },

  verification_approved: {
    subject: 'Selamat! Kamu Sudah Verified ✓ — Fanonym',
    body: (d) => html(`
      ${topBar('#6700e8')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('🎉', '#100a1f')}
        ${cardTitle('Kamu Sudah Verified!', '#a78bfa')}
        ${cardSubtitle('Identitas kamu berhasil diverifikasi')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Selamat! Akun creator kamu kini memiliki status <strong style="color:#c0c0e0;">Verified</strong>. Kamu bisa menikmati semua fitur creator secara penuh.')}
        ${infoTable([
          { label: 'Badge', value: '✓ Verified Creator', valueColor: '#a78bfa' },
          { label: 'Fitur Withdraw', value: 'Aktif', valueColor: '#4ade80' },
          { label: 'Status', value: 'Terpercaya', valueColor: '#4ade80' },
        ])}
        ${ctaBtn('Buka Dashboard', d.dashboardUrl || 'https://fanonym.id/dashboard/creator', 'linear-gradient(135deg,#6700e8,#9333ea)')}
      </div>
    `),
  },

  verification_rejected: {
    subject: 'Verifikasi Belum Berhasil — Fanonym',
    body: (d) => html(`
      ${topBar('#ef4444')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('😔', '#1f0a0a')}
        ${cardTitle('Verifikasi Ditolak', '#f87171')}
        ${cardSubtitle('Dokumen belum memenuhi syarat')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Maaf, kami belum bisa memverifikasi identitasmu. Silakan upload ulang dengan dokumen yang lebih jelas.')}
        ${warningBox('Pastikan foto KTP tidak terpotong, selfie sesuai KTP, dan semua teks terbaca jelas.')}
        ${ctaBtn('Upload Ulang', d.settingsUrl || 'https://fanonym.id/settings', 'linear-gradient(135deg,#dc2626,#ef4444)')}
      </div>
    `),
  },

  reset_password: {
    subject: 'Password Berhasil Diubah — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('🔐', '#1a1208')}
        ${cardTitle('Password Diubah', '#fbbf24')}
        ${cardSubtitle('Perubahan keamanan akun')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Password akun Fanonym kamu telah berhasil diperbarui.')}
        ${warningBox('Jika kamu tidak merasa mengubah password, segera amankan akunmu dengan menghubungi kami di fanonym.id')}
      </div>
    `),
  },

  data_changed: {
    subject: 'Data Akun Diubah — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('🔔', '#1a1208')}
        ${cardTitle('Data Akun Diubah', '#fbbf24')}
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
      ${topBar('#6700e8')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('💬', '#0d0a1f')}
        ${cardTitle('Chat Request Baru!', '#c4b5fd')}
        ${cardSubtitle('Seseorang ingin chat secara anonim')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText('Kamu mendapat chat request baru! Segera buka dashboard dan terima sebelum expired.')}
        ${infoTable([
          { label: 'Durasi Chat', value: `${d.duration} jam`, valueColor: '#a78bfa' },
          { label: 'Nilai', value: `${d.credits} Kredit`, valueColor: '#a78bfa' },
        ])}
        ${ctaBtn('Lihat Request', d.dashboardUrl || 'https://fanonym.id/dashboard/creator', 'linear-gradient(135deg,#6700e8,#9333ea)')}
      </div>
    `),
  },

  chat_accepted: {
    subject: 'Chat Kamu Diterima! — Fanonym',
    body: (d) => html(`
      ${topBar('#22c55e')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('✓', '#0a1f0c')}
        ${cardTitle('Chat Diterima!', '#4ade80')}
        ${cardSubtitle('Creator sudah siap chat denganmu')}
        ${divider()}
        ${greeting(d.name)}
        ${bodyText(`<strong style="color:#d4d4f0;">${d.creatorName || 'Creator'}</strong> telah menerima chat request kamu. Yuk mulai ngobrol sekarang sebelum waktu habis!`)}
        ${ctaBtn('Mulai Chat', d.chatUrl || 'https://fanonym.id/dashboard/sender', 'linear-gradient(135deg,#16a34a,#22c55e)')}
      </div>
    `),
  },

  admin_topup_alert: {
    subject: '[ADMIN] Topup Request Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('🔔', '#1a1208')}
        ${cardTitle('Topup Request Baru', '#fbbf24')}
        ${cardSubtitle('Perlu review dan approval')}
        ${divider()}
        ${bodyText('Ada topup request baru yang menunggu konfirmasi.')}
        ${infoTable([
          { label: 'User', value: d.username, valueColor: '#fbbf24' },
          { label: 'Jumlah', value: `${d.amount} Kredit` },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2', 'linear-gradient(135deg,#d97706,#f59e0b)')}
      </div>
    `),
  },

  admin_withdraw_alert: {
    subject: '[ADMIN] Withdraw Request Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('💸', '#1a1208')}
        ${cardTitle('Withdraw Request Baru', '#fbbf24')}
        ${cardSubtitle('Perlu diproses segera')}
        ${divider()}
        ${bodyText('Ada withdraw request dari creator yang menunggu diproses.')}
        ${infoTable([
          { label: 'Creator', value: d.username, valueColor: '#fbbf24' },
          { label: 'Jumlah', value: `${d.amount} Kredit` },
          { label: 'Bank', value: d.bank || '-' },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2', 'linear-gradient(135deg,#d97706,#f59e0b)')}
      </div>
    `),
  },

  admin_verify_alert: {
    subject: '[ADMIN] Verifikasi Creator Baru — Fanonym',
    body: (d) => html(`
      ${topBar('#f59e0b')}
      <div style="padding:32px 32px 28px;">
        ${iconCircle('🪪', '#1a1208')}
        ${cardTitle('Verifikasi Creator Baru', '#fbbf24')}
        ${cardSubtitle('Ada dokumen yang perlu direview')}
        ${divider()}
        ${bodyText('Ada creator baru yang mengajukan verifikasi identitas.')}
        ${infoTable([
          { label: 'Creator', value: d.username, valueColor: '#fbbf24' },
          { label: 'Waktu', value: d.time },
        ])}
        ${ctaBtn('Review Sekarang', 'https://fanonym.id/fyn-secure-panel-x7k2', 'linear-gradient(135deg,#d97706,#f59e0b)')}
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
