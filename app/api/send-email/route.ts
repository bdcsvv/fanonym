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

const baseEmail = (content: string, accentFrom = '#6700e8', accentTo = '#9333ea') => `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fanonym</title>
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07070f;">
<tr><td align="center" style="padding:48px 16px 48px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

  <!-- LOGO -->
  <tr><td align="center" style="padding-bottom:36px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:linear-gradient(135deg,${accentFrom},${accentTo});border-radius:12px;padding:10px 20px;">
          <span style="font-size:20px;font-weight:900;font-style:italic;letter-spacing:-0.5px;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">fanonym</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- MAIN CARD -->
  <tr><td style="background:#0f0f1a;border-radius:24px;border:1px solid #1c1c30;overflow:hidden;">
    
    <!-- TOP GRADIENT LINE -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:linear-gradient(90deg,${accentFrom},${accentTo},${accentFrom});height:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- CONTENT -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:40px 36px 36px;">
        ${content}
      </td></tr>
    </table>

    <!-- BOTTOM SUBTLE LINE -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="background:linear-gradient(90deg,transparent,${accentFrom}40,transparent);height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>

    <!-- CARD FOOTER -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding:20px 36px;">
        <p style="margin:0;color:#2a2a45;font-size:11px;letter-spacing:0.5px;">FANONYM &bull; ANONYMOUS CREATOR PLATFORM</p>
      </td></tr>
    </table>

  </td></tr>

  <!-- EMAIL FOOTER -->
  <tr><td align="center" style="padding-top:32px;">
    <p style="margin:0 0 6px;color:#2d2d4a;font-size:12px;">
      Dikirim oleh <a href="https://fanonym.id" style="color:${accentTo};text-decoration:none;font-weight:600;">fanonym.id</a>
    </p>
    <p style="margin:0;color:#1e1e35;font-size:11px;">Jika kamu tidak merasa melakukan aksi ini, abaikan email ini.</p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`

const iconCircle = (emoji: string, bg: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px;">
    <tr><td align="center" style="background:${bg};border-radius:50%;width:72px;height:72px;text-align:center;vertical-align:middle;">
      <span style="font-size:32px;line-height:72px;">${emoji}</span>
    </td></tr>
  </table>`

const title = (text: string, color = '#ffffff') =>
  `<h1 style="margin:0 0 8px;text-align:center;font-size:24px;font-weight:800;color:${color};letter-spacing:-0.5px;">${text}</h1>`

const subtitle = (text: string) =>
  `<p style="margin:0 0 28px;text-align:center;font-size:14px;color:#4a4a6a;letter-spacing:0.3px;">${text}</p>`

const divider = () =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr><td style="background:#1a1a2e;height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`

const greeting = (name: string) =>
  `<p style="margin:0 0 12px;font-size:15px;color:#8888aa;">Hai, <strong style="color:#e0e0f0;">${name}</strong></p>`

const body = (text: string) =>
  `<p style="margin:0 0 20px;font-size:14px;color:#6666884;line-height:1.7;color:#666688;">${text}</p>`

const infoBox = (rows: { label: string; value: string; highlight?: boolean }[]) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#090912;border:1px solid #18182e;border-radius:14px;margin:20px 0;">
    ${rows.map((r, i) => `
    <tr>
      <td style="padding:${i === 0 ? '16px 20px 10px' : i === rows.length - 1 ? '10px 20px 16px' : '10px 20px'};border-bottom:${i < rows.length - 1 ? '1px solid #13132010' : 'none'};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:12px;color:#3a3a5a;text-transform:uppercase;letter-spacing:0.8px;">${r.label}</td>
            <td align="right" style="font-size:14px;font-weight:700;color:${r.highlight ? '#a78bfa' : '#c8c8e8'};">${r.value}</td>
          </tr>
        </table>
      </td>
    </tr>`).join('')}
  </table>`

const alertBox = (text: string, type: 'warning' | 'info' = 'warning') =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${type === 'warning' ? '#1a0808' : '#080d1a'};border:1px solid ${type === 'warning' ? '#3a1010' : '#101830'};border-radius:12px;margin:20px 0;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:${type === 'warning' ? '#ee8888' : '#8899cc'};line-height:1.6;">${text}</p>
    </td></tr>
  </table>`

const ctaButton = (text: string, url: string, from = '#6700e8', to = '#9333ea') =>
  `<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,${from},${to});border-radius:14px;">
        <a href="${url}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">${text}</a>
      </td>
    </tr>
  </table>`

const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: (data: any) => string }> = {

  topup_approved: {
    subject: 'Topup Berhasil ✓ — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('✓', '#0a2010')}
      ${title('Topup Berhasil!', '#4ade80')}
      ${subtitle('Kredit kamu sudah ditambahkan')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Pembayaran kamu telah dikonfirmasi. Kredit sudah masuk dan siap digunakan untuk mengirim pesan ke creator favoritmu.')}
      ${infoBox([
        { label: 'Jumlah Kredit', value: `+${data.amount} Kredit`, highlight: true },
        { label: 'Status', value: '✓ Berhasil' },
      ])}
      ${ctaButton('Lihat Saldo', data.dashboardUrl || 'https://fanonym.id/dashboard/sender', '#16a34a', '#22c55e')}
    `, '#16a34a', '#22c55e'),
  },

  topup_rejected: {
    subject: 'Topup Ditolak — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('✕', '#1a0808')}
      ${title('Topup Ditolak', '#f87171')}
      ${subtitle('Ada masalah dengan bukti pembayaran kamu')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Maaf, kami tidak bisa memproses topup kamu kali ini. Silakan coba lagi dengan bukti yang lebih jelas.')}
      ${infoBox([
        { label: 'Penyebab Umum', value: 'Bukti tidak valid' },
        { label: 'Solusi', value: 'Upload ulang' },
      ])}
      ${alertBox('Pastikan foto bukti pembayaran jelas, tidak terpotong, dan nominalnya sesuai.')}
      ${ctaButton('Topup Ulang', data.topupUrl || 'https://fanonym.id/topup', '#dc2626', '#ef4444')}
    `, '#dc2626', '#ef4444'),
  },

  withdraw_success: {
    subject: 'Withdraw Berhasil ✓ — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('💸', '#0a1a08')}
      ${title('Withdraw Berhasil!', '#4ade80')}
      ${subtitle('Dana sedang dalam proses pencairan')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Request withdraw kamu telah diproses. Dana akan masuk ke rekening kamu dalam 1–3 hari kerja.')}
      ${infoBox([
        { label: 'Jumlah', value: `${data.amount} Kredit`, highlight: true },
        { label: 'Bank', value: data.bank },
        { label: 'No. Rekening', value: data.account_number || '-' },
        { label: 'Status', value: '✓ Diproses' },
      ])}
    `, '#16a34a', '#22c55e'),
  },

  verification_approved: {
    subject: 'Akun Kamu Sudah Verified ✓ — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('🎉', '#0d0a1f')}
      ${title('Kamu Sudah Verified!', '#a78bfa')}
      ${subtitle('Identitas kamu telah berhasil diverifikasi')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Selamat! Akun creator kamu kini memiliki status Verified. Kamu bisa menikmati semua fitur creator secara penuh.')}
      ${infoBox([
        { label: 'Badge', value: '✓ Verified Creator', highlight: true },
        { label: 'Fitur Withdraw', value: 'Aktif' },
        { label: 'Status Akun', value: 'Terpercaya' },
      ])}
      ${ctaButton('Buka Dashboard', data.dashboardUrl || 'https://fanonym.id/dashboard/creator')}
    `),
  },

  verification_rejected: {
    subject: 'Verifikasi Belum Berhasil — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('😔', '#1a0808')}
      ${title('Verifikasi Ditolak', '#f87171')}
      ${subtitle('Dokumen kamu belum memenuhi syarat')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Maaf, kami belum bisa memverifikasi identitasmu. Silakan upload ulang dengan dokumen yang lebih jelas.')}
      ${infoBox([
        { label: 'Kemungkinan', value: 'Foto tidak jelas' },
        { label: 'Solusi', value: 'Upload ulang' },
      ])}
      ${alertBox('Pastikan foto KTP tidak terpotong, selfie sesuai KTP, dan semua teks terbaca jelas.')}
      ${ctaButton('Upload Ulang', data.settingsUrl || 'https://fanonym.id/settings', '#dc2626', '#ef4444')}
    `, '#dc2626', '#ef4444'),
  },

  reset_password: {
    subject: 'Password Berhasil Diubah — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('🔐', '#0d0d1f')}
      ${title('Password Diubah')}
      ${subtitle('Perubahan keamanan akun')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Password akun Fanonym kamu telah berhasil diperbarui.')}
      ${alertBox('⚠️ Jika kamu tidak merasa mengubah password, segera amankan akunmu dengan menghubungi kami di fanonym.id', 'warning')}
    `, '#f59e0b', '#fbbf24'),
  },

  data_changed: {
    subject: 'Data Akun Diubah — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('🔔', '#0d0d1f')}
      ${title('Data Akun Diubah')}
      ${subtitle('Ada perubahan pada akunmu')}
      ${divider()}
      ${greeting(data.name)}
      ${body(data.changeDescription)}
      ${alertBox('⚠️ Jika kamu tidak melakukan perubahan ini, segera ganti password dan hubungi kami.', 'warning')}
    `, '#f59e0b', '#fbbf24'),
  },

  chat_unlocked: {
    subject: 'Ada Chat Request Baru! — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('💬', '#0d0a1f')}
      ${title('Chat Request Baru!')}
      ${subtitle('Seseorang ingin chat denganmu secara anonim')}
      ${divider()}
      ${greeting(data.name)}
      ${body('Kamu mendapat chat request baru! Segera buka dashboard dan terima sebelum expired.')}
      ${infoBox([
        { label: 'Durasi Chat', value: `${data.duration} jam`, highlight: true },
        { label: 'Nilai', value: `${data.credits} Kredit` },
      ])}
      ${ctaButton('Lihat Request', data.dashboardUrl || 'https://fanonym.id/dashboard/creator')}
    `),
  },

  chat_accepted: {
    subject: 'Chat Kamu Diterima! — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('✓', '#0a1a08')}
      ${title('Chat Diterima!', '#4ade80')}
      ${subtitle('Creator sudah siap chat denganmu')}
      ${divider()}
      ${greeting(data.name)}
      ${body(`<strong style="color:#e0e0f0;">${data.creatorName}</strong> telah menerima chat request kamu. Yuk mulai ngobrol sekarang sebelum waktu habis!`)}
      ${ctaButton('Mulai Chat', data.chatUrl || 'https://fanonym.id/dashboard/sender', '#16a34a', '#22c55e')}
    `, '#16a34a', '#22c55e'),
  },

  admin_topup_alert: {
    subject: '[ADMIN] Topup Request Baru — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('🔔', '#1a1008')}
      ${title('Topup Request Baru', '#fbbf24')}
      ${subtitle('Perlu review dan approval')}
      ${divider()}
      ${body('Ada topup request baru yang menunggu konfirmasi kamu.')}
      ${infoBox([
        { label: 'User', value: data.username, highlight: true },
        { label: 'Jumlah', value: `${data.amount} Kredit` },
        { label: 'Waktu', value: data.time },
      ])}
      ${ctaButton('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2', '#d97706', '#f59e0b')}
    `, '#d97706', '#f59e0b'),
  },

  admin_withdraw_alert: {
    subject: '[ADMIN] Withdraw Request Baru — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('💸', '#1a1008')}
      ${title('Withdraw Request Baru', '#fbbf24')}
      ${subtitle('Perlu diproses segera')}
      ${divider()}
      ${body('Ada withdraw request dari creator yang menunggu diproses.')}
      ${infoBox([
        { label: 'Creator', value: data.username, highlight: true },
        { label: 'Jumlah', value: `${data.amount} Kredit` },
        { label: 'Bank', value: data.bank },
        { label: 'Waktu', value: data.time },
      ])}
      ${ctaButton('Buka Admin Panel', 'https://fanonym.id/fyn-secure-panel-x7k2', '#d97706', '#f59e0b')}
    `, '#d97706', '#f59e0b'),
  },

  admin_verify_alert: {
    subject: '[ADMIN] Verifikasi Creator Baru — Fanonym',
    body: (data) => baseEmail(`
      ${iconCircle('🪪', '#1a1008')}
      ${title('Verifikasi Creator Baru', '#fbbf24')}
      ${subtitle('Ada dokumen yang perlu direview')}
      ${divider()}
      ${body('Ada creator baru yang mengajukan verifikasi identitas.')}
      ${infoBox([
        { label: 'Creator', value: data.username, highlight: true },
        { label: 'Waktu', value: data.time },
      ])}
      ${ctaButton('Review Sekarang', 'https://fanonym.id/fyn-secure-panel-x7k2', '#d97706', '#f59e0b')}
    `, '#d97706', '#f59e0b'),
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
