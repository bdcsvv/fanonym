export async function sendEmail({
  to,
  type,
  data,
}: {
  to: string
  type: string
  data?: Record<string, any>
}) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, type, data }),
    })

    if (!res.ok) {
      console.error('Email send failed:', await res.json())
    }
  } catch (err) {
    console.error('Email send error:', err)
  }
}
