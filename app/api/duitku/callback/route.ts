import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE || 'DS28455'
const API_KEY = process.env.DUITKU_API_KEY || '8195f167e35529df708dcdc23af509c3'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { merchantCode, amount, merchantOrderId, productDetail, additionalParam, resultCode, merchantUserId, reference, signature: callbackSignature } = body

    // Verify signature: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const expectedSignature = crypto
      .createHash('md5')
      .update(MERCHANT_CODE + amount + merchantOrderId + API_KEY)
      .digest('hex')

    if (callbackSignature !== expectedSignature) {
      console.error('Invalid callback signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    if (resultCode === '00') {
      // Payment successful
      const { data: topup, error: findError } = await supabase
        .from('topup_requests')
        .select('*')
        .eq('id', merchantOrderId)
        .single()

      if (findError || !topup) {
        console.error('Topup request not found:', merchantOrderId)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('topup_requests')
        .update({
          status: 'approved',
          payment_proof_url: `duitku:${reference}`,
        })
        .eq('id', merchantOrderId)

      if (updateError) {
        console.error('Failed to update topup:', updateError)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
      }

      // Add credits to user
      const { data: existingCredits } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', topup.user_id)
        .single()

      if (existingCredits) {
        await supabase
          .from('credits')
          .update({ balance: existingCredits.balance + topup.amount_credits })
          .eq('user_id', topup.user_id)
      } else {
        await supabase
          .from('credits')
          .insert({ user_id: topup.user_id, balance: topup.amount_credits })
      }

      console.log(`Payment success: Order ${merchantOrderId}, Credits: ${topup.amount_credits}`)
    } else {
      await supabase
        .from('topup_requests')
        .update({ status: resultCode === '01' ? 'pending' : 'rejected' })
        .eq('id', merchantOrderId)

      console.log(`Payment ${resultCode === '01' ? 'pending' : 'failed'}: Order ${merchantOrderId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Duitku callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
