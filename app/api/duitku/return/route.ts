import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const resultCode = searchParams.get('resultCode')

  if (resultCode === '00') {
    return NextResponse.redirect(new URL('/topup?status=success', req.url))
  } else if (resultCode === '01') {
    return NextResponse.redirect(new URL('/topup?status=pending', req.url))
  } else {
    return NextResponse.redirect(new URL('/topup?status=failed', req.url))
  }
}
