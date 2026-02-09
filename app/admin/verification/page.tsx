'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FanonymLoader from '@/app/components/FanonymLoader'
import Toast from '@/app/components/Toast'

export default function AdminVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadRequests()
    }
  }, [filter, loading])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      router.push('/dashboard/creator')
      return
    }

    setLoading(false)
  }

  const loadRequests = async () => {
    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        creator:creator_id (
          id,
          username,
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
      .order('submitted_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setRequests(data || [])
  }

  const handleApprove = async (requestId: string, creatorId: string) => {
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update verification request
      await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', requestId)

      // Update creator profile
      await supabase
        .from('profiles')
        .update({
          is_verified: true,
          status: 'active'
        })
        .eq('id', creatorId)

      setToast({ show: true, message: 'Verifikasi berhasil disetujui!', type: 'success' })
      setSelectedRequest(null)
      loadRequests()
    } catch (error) {
      setToast({ show: true, message: 'Gagal approve verifikasi', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (requestId: string, creatorId: string) => {
    if (!rejectionReason.trim()) {
      setToast({ show: true, message: 'Masukkan alasan penolakan!', type: 'error' })
      return
    }

    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update verification request
      await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', requestId)

      // Update creator profile
      await supabase
        .from('profiles')
        .update({
          status: 'active',
          ktp_url: null,
          selfie_ktp_url: null
        })
        .eq('id', creatorId)

      setToast({ show: true, message: 'Verifikasi ditolak', type: 'success' })
      setSelectedRequest(null)
      setRejectionReason('')
      loadRequests()
    } catch (error) {
      setToast({ show: true, message: 'Gagal reject verifikasi', type: 'error' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <FanonymLoader text="Loading admin panel..." />
  }

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#0c0a14]/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔐 Admin Verification
          </h1>
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white transition-all"
          >
            ← Back to Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex gap-3 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filter === status
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {status === 'all' && '📋 All'}
                {status === 'pending' && '⏳ Pending'}
                {status === 'approved' && '✅ Approved'}
                {status === 'rejected' && '❌ Rejected'}
                <span className="ml-2 text-sm opacity-75">
                  ({requests.filter(r => status === 'all' || r.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-zinc-400 text-lg">No verification requests</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Creator Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {request.creator?.avatar_url ? (
                        <img
                          src={request.creator.avatar_url}
                          alt=""
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-2xl font-bold">
                          {request.creator?.full_name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{request.creator?.full_name}</h3>
                        <p className="text-zinc-400">@{request.creator?.username}</p>
                        <p className="text-zinc-500 text-sm">{request.creator?.email}</p>
                        {request.creator?.phone && (
                          <p className="text-zinc-500 text-sm">📱 {request.creator.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {request.status === 'pending' && (
                        <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                          ⏳ Pending Review
                        </span>
                      )}
                      {request.status === 'approved' && (
                        <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                          ✅ Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                          ❌ Rejected
                        </span>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="text-sm text-zinc-500 space-y-1">
                      <p>Submitted: {new Date(request.submitted_at).toLocaleString('id-ID')}</p>
                      {request.reviewed_at && (
                        <p>Reviewed: {new Date(request.reviewed_at).toLocaleString('id-ID')}</p>
                      )}
                      {request.rejection_reason && (
                        <p className="text-red-400">Reason: {request.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/50"
                    >
                      Review →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Review Verification</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Creator Info */}
              <div className="bg-zinc-800/50 rounded-xl p-6">
                <h3 className="font-bold mb-4">Creator Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Full Name</p>
                    <p className="font-semibold">{selectedRequest.creator?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Username</p>
                    <p className="font-semibold">@{selectedRequest.creator?.username}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Email</p>
                    <p className="font-semibold">{selectedRequest.creator?.email}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Phone</p>
                    <p className="font-semibold">{selectedRequest.creator?.phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* KTP */}
                <div>
                  <h3 className="font-bold mb-3">📄 KTP</h3>
                  <img
                    src={selectedRequest.ktp_url}
                    alt="KTP"
                    className="w-full rounded-xl border border-zinc-700"
                  />
                  <a
                    href={selectedRequest.ktp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in new tab
                  </a>
                </div>

                {/* Selfie */}
                <div>
                  <h3 className="font-bold mb-3">🤳 Selfie with KTP</h3>
                  <img
                    src={selectedRequest.selfie_ktp_url}
                    alt="Selfie with KTP"
                    className="w-full rounded-xl border border-zinc-700"
                  />
                  <a
                    href={selectedRequest.selfie_ktp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in new tab
                  </a>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block mb-3 font-semibold">Rejection Reason (if rejecting)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Foto KTP blur, tidak sesuai dengan selfie, dll."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-purple-500 outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedRequest.id, selectedRequest.creator_id)}
                  disabled={processing}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/50"
                >
                  {processing ? 'Processing...' : '✅ Approve Verification'}
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id, selectedRequest.creator_id)}
                  disabled={processing}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-red-500/50"
                >
                  {processing ? 'Processing...' : '❌ Reject Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
