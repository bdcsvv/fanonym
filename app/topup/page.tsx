'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TOPUP_OPTIONS = [
  { credits: 5, price: 50000 },
  { credits: 10, price: 95000 },
  { credits: 25, price: 225000 },
  { credits: 50, price: 425000 },
]

export default function TopupPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data: creditsData } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      setCredits(creditsData?.balance || 0)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleTopup = async (option: typeof TOPUP_OPTIONS[0]) => {
    setProcessing(true)

    const { error } = await supabase
      .from('topup_requests')
      .insert({
        user_id: user.id,
        amount: option.credits,
        price_idr: option.price,
        status: 'pending'
      })

    if (error) {
      alert('Gagal membuat request topup')
      setProcessing(false)
      return
    }

    alert(`Request topup berhasil!\n\nTransfer Rp ${option.price.toLocaleString('id-ID')} ke:\nBank: BCA\nNo Rek: 1234567890\na.n. Fanonym\n\nKirim bukti transfer ke admin untuk konfirmasi.`)
    
    setProcessing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-teal-400">Fanonym</Link>
          <Link href="/dashboard/sender" className="text-gray-400 hover:text-white">Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Top Up Kredit</h1>
        <p className="text-gray-400 mb-6">Saldo saat ini: <span className="text-teal-400 font-bold">{credits} Kredit</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPUP_OPTIONS.map((option) => (
            <div
              key={option.credits}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-teal-400">{option.credits} Kredit</span>
                {option.credits >= 10 && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Hemat!</span>
                )}
              </div>
              <p className="text-gray-400 mb-4">Rp {option.price.toLocaleString('id-ID')}</p>
              <button
                onClick={() => handleTopup(option)}
                disabled={processing}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Beli Sekarang'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}