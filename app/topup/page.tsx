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
  { credits: 100, price: 800000 },
]

const PAYMENT_METHODS = [
  { id: 'bca', name: 'BCA', number: '1234567890', holder: 'Fanonym Indonesia' },
  { id: 'mandiri', name: 'Mandiri', number: '0987654321', holder: 'Fanonym Indonesia' },
  { id: 'gopay', name: 'GoPay', number: '081234567890', holder: 'Fanonym' },
  { id: 'dana', name: 'DANA', number: '081234567890', holder: 'Fanonym' },
]

export default function TopupPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [topupHistory, setTopupHistory] = useState<any[]>([])
  
  // Form state
  const [selectedOption, setSelectedOption] = useState<typeof TOPUP_OPTIONS[0] | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [proofUrl, setProofUrl] = useState('')
  const [showForm, setShowForm] = useState(false)

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

      const { data: historyData } = await supabase
        .from('topup_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setCredits(creditsData?.balance || 0)
      setTopupHistory(historyData || [])
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSelectOption = (option: typeof TOPUP_OPTIONS[0]) => {
    setSelectedOption(option)
    setShowForm(true)
  }

  const handleSubmitTopup = async () => {
    if (!selectedOption || !selectedPayment) {
      alert('Pilih metode pembayaran!')
      return
    }

    setProcessing(true)

    const { data, error } = await supabase
  .from('topup_requests')
  .insert({
    user_id: user.id,
    amount_rupiah: selectedOption.price,
    amount_credits: selectedOption.credits,
    payment_code: selectedPayment,
    payment_proof_url: proofUrl || null,
    status: 'pending'
  })
  .select()
  .single()

    if (error) {
      alert('Gagal membuat request topup: ' + error.message)
      setProcessing(false)
      return
    }

    setTopupHistory([data, ...topupHistory])
    setShowForm(false)
    setSelectedOption(null)
    setSelectedPayment('')
    setProofUrl('')
    setProcessing(false)

    alert('Request topup berhasil dibuat!\n\nSilakan transfer dan tunggu konfirmasi admin (1x24 jam).')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>
    }
  }

  const selectedPaymentInfo = PAYMENT_METHODS.find(p => p.id === selectedPayment)

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

        {/* Topup Options */}
        {!showForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {TOPUP_OPTIONS.map((option) => (
                <div
                  key={option.credits}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-teal-500 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-teal-400">{option.credits} Kredit</span>
                    {option.credits >= 25 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Hemat!</span>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4">Rp {option.price.toLocaleString('id-ID')}</p>
                  <p className="text-gray-500 text-xs mb-4">Rp {(option.price / option.credits).toLocaleString('id-ID')}/kredit</p>
                  <button
                    onClick={() => handleSelectOption(option)}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all"
                  >
                    Pilih
                  </button>
                </div>
              ))}
            </div>

            {/* Topup History */}
            {topupHistory.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Riwayat Topup</h3>
                <div className="space-y-3">
                  {topupHistory.map((topup) => (
                    <div key={topup.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                      <div>
                        <p className="font-semibold">{topup.amount_credits} Kredit</p>
                        <p className="text-gray-400 text-sm">Rp {topup.amount_rupiah?.toLocaleString('id-ID')} • {topup.payment_code}</p>
                        <p className="text-gray-500 text-xs">{new Date(topup.created_at).toLocaleString('id-ID')}</p>
                      </div>
                      {getStatusBadge(topup.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Payment Form */}
        {showForm && selectedOption && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Konfirmasi Pembayaran</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ← Kembali
              </button>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4 mb-6">
              <p className="text-teal-400 text-sm">Paket dipilih:</p>
              <p className="text-2xl font-bold text-teal-400">{selectedOption.credits} Kredit</p>
              <p className="text-white">Rp {selectedOption.price.toLocaleString('id-ID')}</p>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-3">Pilih Metode Pembayaran:</label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedPayment === method.id
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-semibold">{method.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            {selectedPaymentInfo && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Transfer ke:</p>
                <p className="font-bold text-lg">{selectedPaymentInfo.name}</p>
                <p className="text-teal-400 font-mono text-lg">{selectedPaymentInfo.number}</p>
                <p className="text-gray-400">a.n. {selectedPaymentInfo.holder}</p>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400">Jumlah transfer:</p>
                  <p className="text-2xl font-bold text-white">Rp {selectedOption.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            )}

            {/* Proof URL */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-1">Link Bukti Transfer (opsional)</label>
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://drive.google.com/... atau link imgur"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-teal-500 outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">Upload screenshot bukti transfer ke Google Drive/Imgur dan paste linknya</p>
            </div>

            <button
              onClick={handleSubmitTopup}
              disabled={processing || !selectedPayment}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Saya Sudah Transfer'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}