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

    // Generate signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const signature = crypto
      .createHash('md5')
      .update(MERCHANT_CODE + merchantOrderId + paymentAmount + API_KEY)
      .digest('hex')

    const requestBody = {
      merchantCode: MERCHANT_CODE,
      paymentAmount: paymentAmount,
      merchantOrderId: merchantOrderId,
      productDetails: productDetails,
      email: email,
      customerVaName: customerVaName || 'Fanonym User',
      callbackUrl: CALLBACK_URL,
      returnUrl: RETURN_URL,
      signature: signature,
      expiryPeriod: 60,
    }

    const response = await fetch(`${DUITKU_BASE_URL}/webapi/api/merchant/v2/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

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
        error: data.statusMessage || 'Failed to create invoice',
        statusCode: data.statusCode,
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Duitku create invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
