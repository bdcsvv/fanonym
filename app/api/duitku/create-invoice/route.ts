import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE || 'DS28455'
const API_KEY = process.env.DUITKU_API_KEY || '8195f167e35529df708dcdc23af509c3'
const DUITKU_BASE_URL = process.env.DUITKU_ENV === 'production' 
  ? 'https://api-prod.duitku.com' 
  : 'https://api-sandbox.duitku.com'
const CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL 
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/duitku/callback`
  : 'https://www.fanonym.id/api/duitku/callback'
const RETURN_URL = process.env.NEXT_PUBLIC_BASE_URL 
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/duitku/return`
  : 'https://www.fanonym.id/api/duitku/return'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { merchantOrderId, paymentAmount, productDetails, email, customerVaName } = body

    if (!merchantOrderId || !paymentAmount || !productDetails || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // POP API signature: SHA256(merchantCode + timestamp + apiKey)
    const timestamp = Math.round(new Date().getTime())
    const signature = crypto
      .createHash('sha256')
      .update(MERCHANT_CODE + timestamp + API_KEY)
      .digest('hex')

    const requestBody = {
      merchantCode: MERCHANT_CODE,
      paymentAmount: paymentAmount,
      merchantOrderId: String(merchantOrderId),
      productDetails: productDetails,
      additionalParam: '',
      merchantUserInfo: '',
      customerVaName: customerVaName || 'Fanonym User',
      email: email,
      phoneNumber: '081282955582',
      itemDetails: [
        {
          name: productDetails,
          price: paymentAmount,
          quantity: 1,
        },
      ],
      customerDetail: {
        firstName: customerVaName || 'Fanonym',
        lastName: 'User',
        email: email,
        phoneNumber: '081282955582',
      },
      callbackUrl: CALLBACK_URL,
      returnUrl: RETURN_URL,
      expiryPeriod: 60,
    }

    const apiUrl = `${DUITKU_BASE_URL}/api/merchant/createInvoice`
    console.log('Duitku POP request URL:', apiUrl)
    console.log('Duitku POP timestamp:', timestamp)
    console.log('Duitku POP signature:', signature)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-duitku-signature': signature,
        'x-duitku-timestamp': String(timestamp),
        'x-duitku-merchantcode': MERCHANT_CODE,
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('Duitku POP response status:', response.status)
    console.log('Duitku POP response body:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid response from Duitku',
        rawResponse: responseText.substring(0, 500),
      }, { status: 502 })
    }

    if (data.statusCode === '00' || data.paymentUrl) {
      return NextResponse.json({
        success: true,
        reference: data.reference,
        paymentUrl: data.paymentUrl,
        statusCode: data.statusCode,
        statusMessage: data.statusMessage,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.Message || data.statusMessage || 'Failed to create invoice',
        statusCode: data.statusCode,
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Duitku create invoice error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
