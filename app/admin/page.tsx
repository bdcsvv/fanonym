'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import FanonymLoader from '@/app/components/FanonymLoader'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'revenue' | 'topup' | 'withdraw' | 'verify' | 'users' | 'reports'>('revenue')
  
  const [pendingTopups, setPendingTopups] = useState<any[]>([])
  const [pendingWithdraws, setPendingWithdraws] = useState<any[]>([])
  const [pendingVerify, setPendingVerify] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userChats, setUserChats] = useState<any[]>([])
  const [userTopups, setUserTopups] = useState<any[]>([])
  const [userWithdraws, setUserWithdraws] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any>({
    totalCreditsCirculating: 0,
    totalEarnings: 0,
    platformFees: 0,
    totalWithdrawn: 0
  })

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

    // Reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id(id, username, full_name, avatar_url),
        reported_user:reported_user_id(id, username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    // Revenue data
    const { data: allCredits } = await supabase
      .from('credits')
      .select('balance')
    const totalCreditsCirculating = (allCredits || []).reduce((sum, c) => sum + (c.balance || 0), 0)

    const { data: allEarnings } = await supabase
      .from('earnings')
      .select('total_earned, available_balance')
    const totalEarnings = (allEarnings || []).reduce((sum, e) => sum + (e.total_earned || 0), 0)

    const { data: completedWithdraws } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('status', 'completed')
    const totalWithdrawn = (completedWithdraws || []).reduce((sum, w) => sum + (w.amount || 0), 0)

    // Platform fees (20% of total earnings)
    const platformFees = Math.round(totalEarnings * 0.2)

    setRevenue({
      totalCreditsCirculating,
      totalEarnings,
      platformFees,
      totalWithdrawn
    })

    setPendingTopups(topups || [])
    setPendingWithdraws(withdraws || [])
    setPendingVerify(pendingVerification || [])
    setUsers(usersData || [])
    setReports(reportsData || [])
    setStats({
      totalUsers,
      totalCreators,
      totalSenders,
      totalChats,
      verifiedCreators,
      pendingTopups: topups?.length || 0,
      pendingWithdraws: withdraws?.length || 0,
      pendingVerify: pendingVerification?.length || 0,
      pendingReports: reportsData?.filter((r: any) => r.status === 'pending').length || 0
    })
  }

  const approveTopup = async (topupId: string, userId: string, amount: number) => {
    console.log('Approving topup:', { topupId, userId, amount })
    
    if (!userId) {
      alert('Error: User ID tidak ditemukan!')
      return
    }
    
    if (!amount || amount <= 0) {
      alert('Error: Amount tidak valid!')
      return
    }

    const { error: updateError } = await supabase
      .from('topup_requests')
      .update({ status: 'approved', verified_at: new Date().toISOString() })
      .eq('id', topupId)

    if (updateError) {
      alert('Error update status: ' + updateError.message)
      return
    }

    // Check if user has credits record
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    console.log('Current credits:', credits, 'Error:', creditsError)

    if (credits) {
      // Update existing credits
      const newBalance = (credits.balance || 0) + amount
      console.log('Updating balance to:', newBalance)
      
      const { error: updateCreditsError } = await supabase
        .from('credits')
        .update({ balance: newBalance })
        .eq('user_id', userId)
      
      if (updateCreditsError) {
        alert('Error updating credits: ' + updateCreditsError.message)
        return
      }
    } else {
      // Insert new credits record
      console.log('Inserting new credits record for user:', userId, 'amount:', amount)
      
      const { error: insertError } = await supabase
        .from('credits')
        .insert({ user_id: userId, balance: amount })
      
      if (insertError) {
        alert('Error inserting credits: ' + insertError.message)
        return
      }
    }

    alert(`Topup approved! ${amount} kredit telah ditambahkan ke user.`)
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

  // Report handling functions
  const updateReportStatus = async (reportId: string, newStatus: string) => {
    await supabase
      .from('reports')
      .update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId)
    
    alert(`Report ${newStatus}!`)
    loadData()
  }

  const banUser = async (userId: string, reportId: string) => {
    if (!confirm('Yakin ingin ban pengguna ini?')) return
    
    await supabase
      .from('profiles')
      .update({ is_banned: true, banned_at: new Date().toISOString() })
      .eq('id', userId)
    
    await updateReportStatus(reportId, 'resolved')
  }

  // Load user detail
  const loadUserDetail = async (user: any) => {
    setSelectedUser(user)
    
    // Get user's chats
    const { data: chats } = await supabase
      .from('chat_sessions')
      .select('*, creator:creator_id(username, full_name), sender:sender_id(username, full_name)')
      .or(`creator_id.eq.${user.id},sender_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20)
    setUserChats(chats || [])
    
    // Get user's topups
    const { data: topups } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setUserTopups(topups || [])
    
    // Get user's withdrawals (if creator)
    if (user.user_type === 'creator') {
      const { data: withdraws } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setUserWithdraws(withdraws || [])
    } else {
      setUserWithdraws([])
    }
  }

  // Filter users by search
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.username?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    )
  })

  const REPORT_REASONS: Record<string, { label: string; icon: string }> = {
    harassment: { label: 'Harassment', icon: '😤' },
    spam: { label: 'Spam', icon: '📧' },
    inappropriate: { label: 'Konten tidak pantas', icon: '🚫' },
    impersonation: { label: 'Impersonation', icon: '🎭' },
    scam: { label: 'Scam', icon: '💰' },
    threats: { label: 'Ancaman', icon: '⚠️' },
    underage: { label: 'Underage', icon: '👶' },
    other: { label: 'Lainnya', icon: '📝' },
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
    return <FanonymLoader text="Memuat admin panel..." />
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white page-transition">
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
          {stats.pendingReports > 0 && (
            <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              🚩 {stats.pendingReports} Report pending
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'revenue' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            💰 Revenue
          </button>
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
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'reports' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            🚩 Reports ({reports.filter(r => r.status === 'pending').length})
          </button>
        </div>

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">💰 Revenue Dashboard</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-5">
                  <p className="text-green-400 text-sm mb-1">Total Kredit Beredar</p>
                  <p className="text-3xl font-bold text-white">{revenue.totalCreditsCirculating}</p>
                  <p className="text-green-400/70 text-sm">≈ Rp {(revenue.totalCreditsCirculating * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-5">
                  <p className="text-purple-400 text-sm mb-1">Total Earnings Creator</p>
                  <p className="text-3xl font-bold text-white">{revenue.totalEarnings}</p>
                  <p className="text-purple-400/70 text-sm">≈ Rp {(revenue.totalEarnings * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-5">
                  <p className="text-yellow-400 text-sm mb-1">Platform Fee (20%)</p>
                  <p className="text-3xl font-bold text-white">{revenue.platformFees}</p>
                  <p className="text-yellow-400/70 text-sm">≈ Rp {(revenue.platformFees * KREDIT_TO_IDR).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5">
                  <p className="text-blue-400 text-sm mb-1">Total Withdrawn</p>
                  <p className="text-3xl font-bold text-white">{revenue.totalWithdrawn}</p>
                  <p className="text-blue-400/70 text-sm">kredit sudah dicairkan</p>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <h4 className="font-semibold mb-3">📊 Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Net Revenue (Platform Fee - Ops)</span>
                    <span className="text-green-400 font-semibold">Rp {(revenue.platformFees * KREDIT_TO_IDR).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Creator Payout Pending</span>
                    <span className="text-yellow-400 font-semibold">{revenue.totalEarnings - revenue.totalWithdrawn} kredit</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Conversion Rate (1 Kredit)</span>
                    <span className="text-white font-semibold">Rp {KREDIT_TO_IDR.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Users</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari username, nama, atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:border-purple-500 outline-none"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">Menampilkan {filteredUsers.length} dari {users.length} users. Klik untuk lihat detail.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => loadUserDetail(user)}>
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
                        {user.is_banned ? (
                          <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">🚫 Banned</span>
                        ) : user.is_verified ? (
                          <span className="px-2 py-1 rounded text-xs bg-[#1da1f2]/20 text-[#1da1f2]">✓ Verified</span>
                        ) : user.status === 'pending_verification' ? (
                          <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">⏳ Pending</span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">Unverified</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); loadUserDetail(user); }}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover"/>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
                      {selectedUser.full_name?.[0] || selectedUser.username?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.full_name || selectedUser.username}</h3>
                    <p className="text-gray-400">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        selectedUser.user_type === 'creator' ? 'bg-teal-500/20 text-teal-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>{selectedUser.user_type}</span>
                      {selectedUser.is_banned && <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">BANNED</span>}
                      {selectedUser.is_verified && <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">VERIFIED</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs">User ID</p>
                  <p className="text-sm font-mono text-gray-300 truncate">{selectedUser.id}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-500 text-xs">Joined</p>
                  <p className="text-sm text-gray-300">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-gray-500 text-xs mb-1">Bio</p>
                  <p className="text-sm text-gray-300">{selectedUser.bio}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-400">Chat Sessions ({userChats.length})</h4>
                  {userChats.length === 0 ? (
                    <p className="text-gray-500 text-sm">Tidak ada chat.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userChats.map(chat => (
                        <div key={chat.id} className="bg-gray-800 rounded-lg p-3 text-sm flex justify-between">
                          <div>
                            <p className="text-gray-300">
                              {selectedUser.user_type === 'creator' 
                                ? `Sender: ${chat.sender?.full_name || chat.sender?.username}`
                                : `Creator: ${chat.creator?.full_name || chat.creator?.username}`
                              }
                            </p>
                            <p className="text-gray-500 text-xs">{new Date(chat.created_at).toLocaleString('id-ID')}</p>
                          </div>
                          <span className={`px-2 py-0.5 h-fit rounded text-xs ${chat.is_accepted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {chat.is_accepted ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-400">Topup History ({userTopups.length})</h4>
                  {userTopups.length === 0 ? (
                    <p className="text-gray-500 text-sm">Tidak ada topup.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userTopups.map(topup => (
                        <div key={topup.id} className="bg-gray-800 rounded-lg p-3 text-sm flex justify-between">
                          <div>
                            <p className="text-gray-300">{topup.amount_credits} Kredit</p>
                            <p className="text-gray-500 text-xs">{new Date(topup.created_at).toLocaleString('id-ID')}</p>
                          </div>
                          <span className={`px-2 py-0.5 h-fit rounded text-xs ${
                            topup.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                            topup.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>{topup.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUser.user_type === 'creator' && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-400">Withdraw History ({userWithdraws.length})</h4>
                    {userWithdraws.length === 0 ? (
                      <p className="text-gray-500 text-sm">Tidak ada withdraw.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {userWithdraws.map(wd => (
                          <div key={wd.id} className="bg-gray-800 rounded-lg p-3 text-sm flex justify-between">
                            <div>
                              <p className="text-gray-300">{wd.amount} Kredit → {wd.bank_name}</p>
                              <p className="text-gray-500 text-xs">{new Date(wd.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <span className={`px-2 py-0.5 h-fit rounded text-xs ${
                              wd.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              wd.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>{wd.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">🚩 User Reports</h3>
            
            {reports.length === 0 ? (
              <p className="text-gray-400">Tidak ada report.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const reasonInfo = REPORT_REASONS[report.reason] || REPORT_REASONS.other
                  return (
                    <div key={report.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{reasonInfo.icon}</span>
                          <div>
                            <p className="font-semibold text-red-400">{reasonInfo.label}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(report.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          report.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                          report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {report.status}
                        </span>
                      </div>

                      {/* Users */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">Pelapor</p>
                          <div className="flex items-center gap-2">
                            {report.reporter?.avatar_url ? (
                              <img src={report.reporter.avatar_url} alt="" className="w-8 h-8 rounded-full"/>
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {report.reporter?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm">{report.reporter?.full_name || report.reporter?.username}</p>
                              <p className="text-gray-500 text-xs">@{report.reporter?.username}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400 mb-2">Dilaporkan</p>
                          <div className="flex items-center gap-2">
                            {report.reported_user?.avatar_url ? (
                              <img src={report.reported_user.avatar_url} alt="" className="w-8 h-8 rounded-full"/>
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {report.reported_user?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-sm">{report.reported_user?.full_name || report.reported_user?.username}</p>
                              <p className="text-gray-500 text-xs">@{report.reported_user?.username}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {report.description && (
                        <div className="p-3 bg-gray-800 rounded-lg mb-4">
                          <p className="text-xs text-gray-500 mb-1">Detail:</p>
                          <p className="text-gray-300 text-sm">{report.description}</p>
                        </div>
                      )}

                      {/* Session Link */}
                      {report.session_id && (
                        <a 
                          href={`/chat/${report.session_id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mb-4 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm hover:bg-purple-500/30"
                        >
                          💬 Lihat Chat Session →
                        </a>
                      )}

                      {/* Actions */}
                      {report.status === 'pending' && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => updateReportStatus(report.id, 'reviewed')}
                            className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm"
                          >
                            👁️ Tandai Ditinjau
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-semibold"
                          >
                            ✓ Selesaikan
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                          >
                            ✗ Tolak
                          </button>
                          <button
                            onClick={() => banUser(report.reported_user_id, report.id)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                          >
                            🚫 Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}