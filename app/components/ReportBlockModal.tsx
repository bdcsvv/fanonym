'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface ReportBlockModalProps {
  isOpen: boolean
  onClose: () => void
  targetUserId: string
  targetUsername: string
  sessionId?: string
  currentUserId: string
  mode: 'report' | 'block' | 'both'
}

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment / Bullying', icon: '😤' },
  { id: 'spam', label: 'Spam / Iklan tidak diinginkan', icon: '📧' },
  { id: 'inappropriate', label: 'Konten tidak pantas', icon: '🚫' },
  { id: 'impersonation', label: 'Berpura-pura jadi orang lain', icon: '🎭' },
  { id: 'scam', label: 'Penipuan / Scam', icon: '💰' },
  { id: 'threats', label: 'Ancaman / Kekerasan', icon: '⚠️' },
  { id: 'underage', label: 'Melibatkan anak di bawah umur', icon: '👶' },
  { id: 'other', label: 'Lainnya', icon: '📝' },
]

export default function ReportBlockModal({
  isOpen,
  onClose,
  targetUserId,
  targetUsername,
  sessionId,
  currentUserId,
  mode,
}: ReportBlockModalProps) {
  const [step, setStep] = useState<'choose' | 'report' | 'block' | 'success'>('choose')
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [alsoBlock, setAlsoBlock] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successAction, setSuccessAction] = useState<'report' | 'block' | 'both'>('report')

  const handleReport = async () => {
    if (!selectedReason) return
    
    setLoading(true)
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: currentUserId,
        reported_user_id: targetUserId,
        session_id: sessionId || null,
        reason: selectedReason,
        description: additionalInfo || null,
        status: 'pending',
      })

      if (error) throw error

      if (alsoBlock) {
        await handleBlockUser(true)
        setSuccessAction('both')
      } else {
        setSuccessAction('report')
      }
      
      setStep('success')
    } catch (error) {
      console.error('Error reporting user:', error)
      alert('Gagal mengirim laporan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (skipSuccess = false) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('blocks').insert({
        blocker_id: currentUserId,
        blocked_id: targetUserId,
      })

      if (error && error.code !== '23505') throw error // Ignore duplicate

      if (!skipSuccess) {
        setSuccessAction('block')
        setStep('success')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      alert('Gagal memblokir pengguna. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setStep('choose')
    setSelectedReason('')
    setAdditionalInfo('')
    setAlsoBlock(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={resetAndClose}>
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="h-2 bg-gradient-to-r from-purple-500 to-teal-500" />
        
        <div className="p-6">
          {/* Choose Action Step */}
          {step === 'choose' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 flex items-center justify-center text-3xl">
                  🛡️
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Kelola @{targetUsername}
                </h2>
                <p className="text-gray-400 text-sm">
                  Pilih tindakan yang ingin kamu lakukan
                </p>
              </div>

              <div className="space-y-3">
                {(mode === 'report' || mode === 'both') && (
                  <button
                    onClick={() => setStep('report')}
                    className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                      🚩
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Laporkan</h3>
                      <p className="text-sm text-gray-400">Laporkan perilaku yang melanggar</p>
                    </div>
                  </button>
                )}

                {(mode === 'block' || mode === 'both') && (
                  <button
                    onClick={() => setStep('block')}
                    className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-2xl">
                      🚫
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Blokir</h3>
                      <p className="text-sm text-gray-400">Cegah pengguna ini menghubungimu</p>
                    </div>
                  </button>
                )}
              </div>

              <button
                onClick={resetAndClose}
                className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Batal
              </button>
            </div>
          )}

          {/* Report Step */}
          {step === 'report' && (
            <div>
              <button
                onClick={() => setStep('choose')}
                className="mb-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Kembali
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                  🚩
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Laporkan @{targetUsername}</h2>
                  <p className="text-sm text-gray-400">Pilih alasan pelaporan</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto mb-4">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                      selectedReason === reason.id
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                    } border`}
                  >
                    <span className="text-xl">{reason.icon}</span>
                    <span className={selectedReason === reason.id ? 'text-white' : 'text-gray-300'}>
                      {reason.label}
                    </span>
                    {selectedReason === reason.id && (
                      <span className="ml-auto text-purple-400">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {selectedReason && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Detail tambahan (opsional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Jelaskan lebih lanjut tentang masalah ini..."
                    className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 focus:border-purple-500 text-white placeholder-gray-500 resize-none h-24 outline-none"
                  />
                </div>
              )}

              {mode === 'both' && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={alsoBlock}
                    onChange={(e) => setAlsoBlock(e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Blokir pengguna ini juga</span>
                </label>
              )}

              <button
                onClick={handleReport}
                disabled={!selectedReason || loading}
                className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    ⚠️ Kirim Laporan
                  </>
                )}
              </button>
            </div>
          )}

          {/* Block Step */}
          {step === 'block' && (
            <div>
              <button
                onClick={() => setStep('choose')}
                className="mb-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Kembali
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center text-3xl">
                  🚫
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Blokir @{targetUsername}?
                </h2>
                <p className="text-gray-400 text-sm">
                  Pengguna ini tidak akan bisa:
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  'Mengirim pesan kepadamu',
                  'Melihat profilmu',
                  'Memulai chat baru denganmu',
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-800"
                  >
                    <span className="text-orange-400">✗</span>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleBlockUser(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Loading...' : '🚫 Blokir'}
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center text-4xl">
                ✅
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {successAction === 'both' && 'Dilaporkan & Diblokir!'}
                {successAction === 'report' && 'Laporan Terkirim!'}
                {successAction === 'block' && 'Pengguna Diblokir!'}
              </h2>
              <p className="text-gray-400 mb-6">
                {successAction === 'report' || successAction === 'both'
                  ? 'Tim kami akan meninjau laporan ini dalam 24 jam.'
                  : 'Pengguna ini tidak akan bisa menghubungimu lagi.'}
              </p>
              <button
                onClick={resetAndClose}
                className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-all"
              >
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
