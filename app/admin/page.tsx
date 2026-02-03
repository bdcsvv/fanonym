'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'topup' | 'withdraw' | 'verify' | 'users'>('topup')
  
  const [pendingTopups, setPendingTopups] = useState<any[]>([])
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([])
  const [pendingVerify, setPendingVerify] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})

  const ADMIN_EMAILS = ['rizkinurulloh1124@gmail.com']

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
        router.push('/')
        return
      }

      setIsAdmin(true)
      await loadData()
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  const loadData = async () => {
    // Pending topups
    const { data: topups } = await supabase
      .from('topup_requests')
      .select('*, user:user_id(id, username, full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Pending withdraws
    const { data: withdraws } = await supabase
      .from('withdrawals')
      .select('*, creator:creator_id(id, username, full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    // Pending verification (creators with KTP but not verified)
    const { data: pendingVerification } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'creator')
      .eq('status', 'pending_verification')
      .not('ktp_url', 'is', null)
      .order('updated_at', { ascending: false })

    // All users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Stats
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: totalCreators } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'creator')

    const { count: totalSenders } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'sender')

    const { count: totalChats } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })

    const { count: verifiedCreators } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'creator')
      .eq('is_verified', true)

    setPendingTopups(topups || [])
    setPendingWithdraws(withdraws || [])
    setPendingVerify(pendingVerification || [])
    setUsers(usersData || [])
    setStats({
      totalUsers,
      totalCreators,
      totalSenders,
      totalChats,
      verifiedCreators,
      pendingTopups: topups?.length || 0,
      pendingWithdraws: withdraws?.length || 0,
      pendingVerify: pendingVerification?.length || 0
    })
  }

  const approveTopup = async (topupId: string, userId: string, amount: number) => {
    const { error: updateError } = await supabase
      .from('topup_requests')
      .update({ status: 'approved', verified_at: new Date().toISOString() })
      .eq('id', topupId)

    if (updateError) {
      alert('Error update status: ' + updateError.message)
      return
    }

    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (credits) {
      await supabase
        .from('credits')
        .update({ balance: credits.balance + amount })
        .eq('user_id', userId)
    } else {
      await supabase
        .from('credits')
        .insert({ user_id: userId, balance: amount })
    }

    alert('Topup approved!')
    loadData()
  }

  const rejectTopup = async (topupId: string) => {
    await supabase
      .from('topup_requests')
      .update({ status: 'rejected' })
      .eq('id', topupId)

    alert('Topup rejected!')
    loadData()
  }

  const approveWithdraw = async (withdrawId: string) => {
    await supabase
      .from('withdrawals')
      .update({ status: 'completed', processed_at: new Date().toISOString() })
      .eq('id', withdrawId)

    alert('Withdraw approved!')
    loadData()
  }

  const rejectWithdraw = async (withdrawId: string, creatorId: string, amount: number) => {
    const { data: earnings } = await supabase
      .from('earnings')
      .select('available_balance')
      .eq('creator_id', creatorId)
      .single()

    if (earnings) {
      await supabase
        .from('earnings')
        .update({ available_balance: earnings.available_balance + amount })
        .eq('creator_id', creatorId)
    }

    await supabase
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawId)

    alert('Withdraw rejected & credits returned!')
    loadData()
  }

  const approveVerification = async (creatorId: string) => {
    await supabase
      .from('profiles')
      .update({ 
        is_verified: true, 
        status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', creatorId)

    alert('Creator verified!')
    loadData()
  }

  const rejectVerification = async (creatorId: string) => {
    await supabase
      .from('profiles')
      .update({ 
        status: 'verification_rejected',
        ktp_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', creatorId)

    alert('Verification rejected!')
    loadData()
  }

  const KREDIT_TO_IDR = 10000
  const PLATFORM_FEE = 0.2
  const TRANSFER_FEE = 30000
  const FREE_TRANSFER_MIN = 1000000

  const calculateWithdraw = (kredits: number) => {
    const grossAmount = kredits * KREDIT_TO_IDR * (1 - PLATFORM_FEE)
    const fee = grossAmount < FREE_TRANSFER_MIN ? TRANSFER_FEE : 0
    const netAmount = grossAmount - fee
    return { grossAmount, fee, netAmount }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-red-500">🔐 Admin Panel</h1>
          <button 
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white"
          >
            Back to Home
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Creators</p>
            <p className="text-2xl font-bold text-teal-400">{stats.totalCreators}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Verified</p>
            <p className="text-2xl font-bold text-green-400">{stats.verifiedCreators}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Senders</p>
            <p className="text-2xl font-bold text-purple-400">{stats.totalSenders}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Chats</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalChats}</p>
          </div>
        </div>

        {/* Alert Badges */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {stats.pendingTopups > 0 && (
            <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400">
              ⚠️ {stats.pendingTopups} Topup pending
            </div>
          )}
          {stats.pendingWithdraws > 0 && (
            <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg text-orange-400">
              ⚠️ {stats.pendingWithdraws} Withdraw pending
            </div>
          )}
          {stats.pendingVerify > 0 && (
            <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400">
              ⚠️ {stats.pendingVerify} Verifikasi pending
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('topup')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'topup' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Topup ({pendingTopups.length})
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'withdraw' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Withdraw ({pendingWithdraws.length})
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'verify' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            🔐 Verify ({pendingVerify.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'users' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Topup Tab */}
        {activeTab === 'topup' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Topup Requests</h3>
            {pendingTopups.length === 0 ? (
              <p className="text-gray-400">Tidak ada topup pending.</p>
            ) : (
              <div className="space-y-4">
                {pendingTopups.map((topup) => (
                  <div key={topup.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{topup.user?.full_name || topup.user?.username}</p>
                        <p className="text-gray-400 text-sm">@{topup.user?.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">{topup.amount_credits} Kredit</p>
                        <p className="text-gray-400 text-sm">Rp {topup.amount_rupiah?.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      <p>Payment: {topup.payment_code}</p>
                      <p>Bukti: {topup.payment_proof_url || 'No proof'}</p>
                      <p>Waktu: {new Date(topup.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveTopup(topup.id, topup.user_id, topup.amount_credits)}
                        className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 font-semibold"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => rejectTopup(topup.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Withdraw Requests</h3>
            {pendingWithdraws.length === 0 ? (
              <p className="text-gray-400">Tidak ada withdraw pending.</p>
            ) : (
              <div className="space-y-4">
                {pendingWithdraws.map((withdraw) => {
                  const calc = calculateWithdraw(withdraw.amount)
                  return (
                    <div key={withdraw.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">{withdraw.creator?.full_name || withdraw.creator?.username}</p>
                          <p className="text-gray-400 text-sm">@{withdraw.creator?.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-400">{withdraw.amount} Kredit</p>
                          <p className="text-green-400 font-semibold">→ Rp {calc.netAmount.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        <p>Bank: {withdraw.bank_name}</p>
                        <p>No. Rek: {withdraw.account_number}</p>
                        <p>Nama: {withdraw.account_name}</p>
                        <p>Waktu: {new Date(withdraw.created_at).toLocaleString('id-ID')}</p>
                        {calc.fee > 0 && (
                          <p className="text-yellow-400">Fee transfer: Rp {calc.fee.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveWithdraw(withdraw.id)}
                          className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 font-semibold"
                        >
                          ✓ Sudah Transfer
                        </button>
                        <button
                          onClick={() => rejectWithdraw(withdraw.id, withdraw.creator_id, withdraw.amount)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🔐 Pending Creator Verification</h3>
            {pendingVerify.length === 0 ? (
              <p className="text-gray-400">Tidak ada verifikasi pending.</p>
            ) : (
              <div className="space-y-4">
                {pendingVerify.map((creator) => (
                  <div key={creator.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="flex gap-4 mb-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover"/>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                            {creator.full_name?.[0] || creator.username?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{creator.full_name || creator.username}</p>
                        <p className="text-gray-400 text-sm">@{creator.username}</p>
                        {creator.bio && <p className="text-gray-500 text-sm mt-1">{creator.bio}</p>}
                        {creator.phone && <p className="text-gray-500 text-sm">📞 {creator.phone}</p>}
                      </div>
                    </div>
                    
                    {/* KTP Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Foto KTP:</p>
                      {creator.ktp_url ? (
                        <a href={creator.ktp_url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={creator.ktp_url} 
                            alt="KTP" 
                            className="max-w-md rounded-lg border border-gray-700 hover:border-teal-500 transition-colors"
                          />
                        </a>
                      ) : (
                        <p className="text-red-400">Tidak ada KTP</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => approveVerification(creator.id)}
                        className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 font-semibold"
                      >
                        ✓ Verify Creator
                      </button>
                      <button
                        onClick={() => rejectVerification(creator.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">All Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover"/>
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                              {user.full_name?.[0] || user.username?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{user.full_name || user.username}</p>
                            <p className="text-gray-500 text-xs">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.user_type === 'creator' 
                            ? 'bg-teal-500/20 text-teal-400' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.is_verified ? (
                          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">✓ Verified</span>
                        ) : user.status === 'pending_verification' ? (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">⏳ Pending</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">Unverified</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}