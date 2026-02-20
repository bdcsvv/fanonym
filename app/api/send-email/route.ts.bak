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

const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: (data: any) => string }> = {
  withdraw_success: {
    subject: '🏦 Withdraw Berhasil - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">💸 Withdraw Berhasil!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Withdraw kamu telah diproses:</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">Jumlah: <strong style="color:#fff;">${data.amount} Kredit</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Bank: <strong style="color:#fff;">${data.bank}</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Status: <strong style="color:#4ade80;">✅ Berhasil</strong></p>
          </div>
          <p style="color:#71717a;font-size:13px;">Dana akan masuk ke rekening dalam 1-3 hari kerja.</p>
        </div>
      </div>
    `,
  },
  verification_approved: {
    subject: '🎉 Verifikasi Berhasil - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">🎉 Selamat, Kamu Verified!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Akun creator kamu telah diverifikasi. Sekarang kamu bisa:</p>
          <ul style="color:#a1a1aa;">
            <li>✅ Mendapatkan badge Verified Creator</li>
            <li>✅ Melakukan withdraw dana</li>
            <li>✅ Meningkatkan kepercayaan sender</li>
          </ul>
          <a href="${data.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Buka Dashboard</a>
        </div>
      </div>
    `,
  },
  verification_rejected: {
    subject: '😔 Verifikasi Ditolak - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">😔 Verifikasi Ditolak</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Maaf, verifikasi akun kamu ditolak. Kemungkinan penyebab:</p>
          <ul style="color:#a1a1aa;">
            <li>Foto KTP tidak jelas atau terpotong</li>
            <li>Foto selfie tidak sesuai dengan KTP</li>
            <li>Data tidak terbaca dengan baik</li>
          </ul>
          <p style="color:#a1a1aa;">Silakan upload ulang dokumen yang lebih jelas.</p>
          <a href="${data.settingsUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Upload Ulang</a>
        </div>
      </div>
    `,
  },
  reset_password: {
    subject: '🔐 Reset Password - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">🔐 Reset Password</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Password akun Fanonym kamu telah berhasil diubah.</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:0;color:#fbbf24;">⚠️ Jika kamu tidak merasa mengubah password, segera hubungi support.</p>
          </div>
        </div>
      </div>
    `,
  },
  data_changed: {
    subject: '🔔 Perubahan Data Akun - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">🔔 Data Akun Diubah</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">${data.changeDescription}</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:0;color:#fbbf24;">⚠️ Jika kamu tidak melakukan perubahan ini, segera ganti password.</p>
          </div>
        </div>
      </div>
    `,
  },
  chat_unlocked: {
    subject: '💬 Chat Request Baru! - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">💬 Ada Chat Request Baru!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Seseorang ingin chat dengan kamu!</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">Durasi: <strong style="color:#fff;">${data.duration} jam</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Kredit: <strong style="color:#fff;">${data.credits}</strong></p>
          </div>
          <a href="${data.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Buka Dashboard</a>
        </div>
      </div>
    `,
  },
  chat_accepted: {
    subject: '✅ Chat Diterima! - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">✅ Chat Kamu Diterima!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;"><strong style="color:#fff;">${data.creatorName}</strong> telah menerima chat request kamu. Mulai chat sekarang!</p>
          <a href="${data.chatUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Mulai Chat</a>
        </div>
      </div>
    `,
  },
  topup_approved: {
    subject: '✅ Topup Berhasil! - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">✅ Topup Berhasil!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Topup kamu telah dikonfirmasi:</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">Jumlah: <strong style="color:#fff;">${data.amount} Kredit</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Status: <strong style="color:#4ade80;">✅ Berhasil</strong></p>
          </div>
          <a href="${data.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Lihat Saldo</a>
        </div>
      </div>
    `,
  },
  topup_rejected: {
    subject: '❌ Topup Ditolak - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6700e8,#471c70);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">❌ Topup Ditolak</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Hai <strong style="color:#fff;">${data.name}</strong>,</p>
          <p style="color:#a1a1aa;">Request topup kamu ditolak. Kemungkinan penyebab:</p>
          <ul style="color:#a1a1aa;">
            <li>Bukti pembayaran tidak valid</li>
            <li>Nominal tidak sesuai</li>
            <li>Gambar tidak jelas</li>
          </ul>
          <p style="color:#a1a1aa;">Silakan coba topup ulang dengan bukti yang benar.</p>
          <a href="${data.topupUrl}" style="display:inline-block;background:linear-gradient(135deg,#6700e8,#7c3aed);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Topup Ulang</a>
        </div>
      </div>
    `,
  },
  admin_topup_alert: {
    subject: '🔔 [ADMIN] Topup Request Baru - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">🔔 Topup Request Baru!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Ada topup request baru yang perlu di-approve:</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">User: <strong style="color:#fff;">${data.username}</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Jumlah: <strong style="color:#fff;">${data.amount} Kredit</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Waktu: <strong style="color:#fff;">${data.time}</strong></p>
          </div>
          <a href="https://fanonym.id/fyn-secure-panel-x7k2" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Buka Admin Panel</a>
        </div>
      </div>
    `,
  },
  admin_withdraw_alert: {
    subject: '🔔 [ADMIN] Withdraw Request Baru - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">💸 Withdraw Request Baru!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Ada withdraw request baru yang perlu diproses:</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">Creator: <strong style="color:#fff;">${data.username}</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Jumlah: <strong style="color:#fff;">${data.amount} Kredit</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Bank: <strong style="color:#fff;">${data.bank}</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Waktu: <strong style="color:#fff;">${data.time}</strong></p>
          </div>
          <a href="https://fanonym.id/fyn-secure-panel-x7k2" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Buka Admin Panel</a>
        </div>
      </div>
    `,
  },
  admin_verify_alert: {
    subject: '🔔 [ADMIN] Verifikasi Creator Baru - Fanonym',
    body: (data) => `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0c0a14;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">✅ Verifikasi Creator Baru!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Ada creator baru yang minta diverifikasi:</p>
          <div style="background:#1a1625;border:1px solid #2d2640;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:4px 0;color:#a78bfa;">Creator: <strong style="color:#fff;">${data.username}</strong></p>
            <p style="margin:4px 0;color:#a78bfa;">Waktu: <strong style="color:#fff;">${data.time}</strong></p>
          </div>
          <a href="https://fanonym.id/fyn-secure-panel-x7k2" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">Review Sekarang</a>
        </div>
      </div>
    `,
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
