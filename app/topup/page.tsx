'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'

const TOPUP_OPTIONS = [
  { credits: 5, price: 50000 },
  { credits: 10, price: 100000 },
  { credits: 25, price: 250000 },
  { credits: 50, price: 500000 },
  { credits: 100, price: 1000000 },
]

const KREDIT_TO_IDR = 10000

export default function TopupPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [topupHistory, setTopupHistory] = useState<any[]>([])
  
  // Form state
  const [step, setStep] = useState<'select' | 'payment' | 'upload' | 'done'>('select')
  const [selectedOption, setSelectedOption] = useState<typeof TOPUP_OPTIONS[0] | null>(null)
  const [uniqueAmount, setUniqueAmount] = useState<number>(0)
  const [currentTopup, setCurrentTopup] = useState<any>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

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

  // Generate 3 digit random number for unique amount
  const generateUniqueAmount = (basePrice: number) => {
    const randomDigits = Math.floor(Math.random() * 900) + 100 // 100-999
    return basePrice + randomDigits
  }

  const handleSelectOption = (option: typeof TOPUP_OPTIONS[0]) => {
    setSelectedOption(option)
    const unique = generateUniqueAmount(option.price)
    setUniqueAmount(unique)
    setStep('payment')
  }

  const handleCreateTopup = async () => {
    if (!selectedOption || !user) return
    
    setProcessing(true)

    const { data, error } = await supabase
      .from('topup_requests')
      .insert({
        user_id: user.id,
        amount_rupiah: uniqueAmount,
        amount_credits: selectedOption.credits,
        payment_code: 'QRIS',
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      alert('Gagal membuat request topup: ' + error.message)
      setProcessing(false)
      return
    }

    setCurrentTopup(data)
    setStep('upload')
    setProcessing(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async () => {
    if (!proofFile || !currentTopup) return

    setUploading(true)

    // Upload file to Supabase Storage
    const fileExt = proofFile.name.split('.').pop()
    const fileName = `${user.id}_${currentTopup.id}_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, proofFile)

    if (uploadError) {
      alert('Gagal upload bukti: ' + uploadError.message)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName)

    // Update topup request with proof URL and status
    const { error: updateError } = await supabase
      .from('topup_requests')
      .update({ 
        payment_proof_url: publicUrl,
        status: 'waiting_verification'
      })
      .eq('id', currentTopup.id)

    if (updateError) {
      alert('Gagal update status: ' + updateError.message)
      setUploading(false)
      return
    }

    setStep('done')
    setUploading(false)
    
    // Refresh history
    const { data: historyData } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTopupHistory(historyData || [])
  }

  const handleReset = () => {
    setStep('select')
    setSelectedOption(null)
    setUniqueAmount(0)
    setCurrentTopup(null)
    setProofFile(null)
    setProofPreview('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Menunggu Pembayaran</span>
      case 'waiting_verification':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Menunggu Verifikasi</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Disetujui ✓</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Ditolak</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>
    }
  }

  const dashboardUrl = profile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'

  if (loading) {
    return <FanonymLoader text="Memuat halaman..." />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative page-transition">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-purple-500/20 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href={dashboardUrl} className="text-2xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(103,0,232,0.5)]">
            fanonym
          </Link>
          <Link href={dashboardUrl} className="text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">💎 Top Up Kredit</h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-xl px-4 py-2">
              <span className="text-gray-400 text-sm">Saldo saat ini: </span>
              <span className="text-purple-400 font-bold text-lg">{credits} Kredit</span>
              <span className="text-gray-500 text-sm ml-2">≈ Rp {(credits * KREDIT_TO_IDR).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Amount */}
        {step === 'select' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Pilih Jumlah Kredit</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TOPUP_OPTIONS.map((option) => (
                  <button
                    key={option.credits}
                    onClick={() => handleSelectOption(option)}
                    className="p-4 bg-zinc-800/50 border border-zinc-700 hover:border-purple-500 rounded-xl transition-all hover:bg-zinc-800 group"
                  >
                    <p className="text-2xl font-bold text-purple-400 group-hover:text-purple-300">{option.credits}</p>
                    <p className="text-zinc-400 text-sm">Kredit</p>
                    <p className="text-white font-medium mt-2">Rp {option.price.toLocaleString('id-ID')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topup History */}
            {topupHistory.length > 0 && (
              <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Riwayat Top Up</h2>
                <div className="space-y-3">
                  {topupHistory.slice(0, 5).map((topup) => (
                    <div key={topup.id} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl">
                      <div>
                        <p className="font-semibold">{topup.amount_credits} Kredit</p>
                        <p className="text-zinc-500 text-sm">
                          Rp {topup.amount_rupiah?.toLocaleString('id-ID')} • {new Date(topup.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {getStatusBadge(topup.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment Info */}
        {step === 'payment' && selectedOption && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-6">Scan QRIS untuk Pembayaran</h2>
              
              {/* QRIS Image */}
              <div className="bg-white rounded-2xl p-4 mb-6 inline-block">
                <img 
                  src="/qris-fanonym.jpg" 
                  alt="QRIS Fanonym" 
                  className="w-64 h-auto mx-auto"
                />
              </div>

              {/* Payment Details */}
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                <p className="text-zinc-400 text-sm mb-2">Nominal yang harus dibayar:</p>
                <p className="text-3xl font-bold text-green-400">
                  Rp {uniqueAmount.toLocaleString('id-ID')}
                </p>
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Transfer dengan nominal EXACT untuk verifikasi otomatis
                </p>
              </div>

              <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-purple-300 text-sm mb-2">Detail Transaksi:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Kredit</span>
                    <span className="text-white font-medium">{selectedOption.credits} Kredit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Harga dasar</span>
                    <span className="text-white">Rp {selectedOption.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Kode unik</span>
                    <span className="text-yellow-400">+ Rp {(uniqueAmount - selectedOption.price).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-700">
                    <span className="text-zinc-400 font-medium">Total Bayar</span>
                    <span className="text-green-400 font-bold">Rp {uniqueAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium transition-colors"
                >
                  ← Kembali
                </button>
                <button
                  onClick={handleCreateTopup}
                  disabled={processing}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 rounded-xl font-medium transition-colors"
                >
                  {processing ? 'Memproses...' : 'Sudah Transfer →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Upload Proof */}
        {step === 'upload' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="bg-gray-800/30 border border-purple-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-2">Upload Bukti Pembayaran</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Upload screenshot bukti transfer untuk mempercepat proses verifikasi
              </p>

              {/* Reminder */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                <p className="text-green-400 text-sm">
                  ✓ Nominal yang ditransfer: <span className="font-bold">Rp {uniqueAmount.toLocaleString('id-ID')}</span>
                </p>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                {proofPreview ? (
                  <div className="relative">
                    <img 
                      src={proofPreview} 
                      alt="Bukti Transfer" 
                      className="w-full rounded-xl border border-zinc-700"
                    />
                    <button
                      onClick={() => {
                        setProofFile(null)
                        setProofPreview('')
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-zinc-700 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition-colors">
                    <svg className="w-12 h-12 text-zinc-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-400">Klik untuk upload bukti transfer</p>
                    <p className="text-zinc-500 text-sm mt-1">PNG, JPG, atau JPEG</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                onClick={handleUploadProof}
                disabled={!proofFile || uploading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-medium transition-colors"
              >
                {uploading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-gray-800/30 border border-green-500/30 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Bukti Terkirim!</h2>
              <p className="text-zinc-400 mb-6">
                Tim kami akan memverifikasi pembayaran kamu dalam waktu 1x24 jam. 
                Kredit akan otomatis ditambahkan setelah disetujui.
              </p>
              
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-blue-400">Menunggu Verifikasi</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Estimasi</span>
                  <span className="text-white">1x24 jam</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium transition-colors"
                >
                  Top Up Lagi
                </button>
                <Link
                  href={dashboardUrl}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors text-center"
                >
                  Ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
