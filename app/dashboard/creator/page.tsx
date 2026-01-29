'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [earnings, setEarnings] = useState<any>(null)
  const [pricing, setPricing] = useState<any[]>([])
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [spamMessages, setSpamMessages] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inbox' | 'spam' | 'pricing' | 'withdraw'>('inbox')
  const [newDuration, setNewDuration] = useState('')
  const [newPrice, setNewPrice] = useState('')
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const KREDIT_TO_IDR = 10000
  const PLATFORM_FEE = 0.2
  const TRANSFER_FEE = 30000
  const FREE_TRANSFER_MIN = 1000000
  const MIN_WITHDRAW = 10

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: earningsData } = await supabase
        .from('earnings')
        .select('*')
        .eq('creator_id', profileData?.id)
        .single()

      const { data: pricingData } = await supabase
        .from('creator_pricing')
        .select('*')
        .eq('creator_id', profileData?.id)
        .order('duration_hours', { ascending: true })

      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name)')
        .eq('creator_id', profileData?.id)
        .order('started_at', { ascending: false })

      const { data: spamData } = await supabase
        .from('spam_messages')
        .select('*, sender:sender_id(id, username, full_name)')
        .eq('creator_id', profileData?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('creator_id', profileData?.id)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setEarnings(earningsData)
      setPricing(pricingData || [])
      setActiveChats(chatsData || [])
      setSpamMessages(spamData || [])
      setWithdrawals(withdrawalsData || [])
      setLoading(false)
    }

    getData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const diff = expires - now
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}j ${minutes}m`
  }

  const updatePricing = async (id: string, newPriceValue: number) => {
    await supabase
      .from('creator_pricing')
      .update({ price_credits: newPriceValue })
      .eq('id', id)
    
    setPricing(pricing.map(p => p.id === id ? { ...p, price_credits: newPriceValue } : p))
  }

  const addPricing = async () => {
    const duration = parseInt(newDuration)
    const price = parseInt(newPrice)
    
    if (!duration || !price) {
      alert('Isi durasi dan harga!')
      return
    }

    const { data, error } = await supabase
      .from('creator_pricing')
      .insert({
        creator_id: profile?.id,
        duration_hours: duration,
        price_credits: price,
        is_active: true
      })
      .select()
      .single()
    
    if (!error && data) {
      setPricing([...pricing, data])
      setNewDuration('')
      setNewPrice('')
    }
  }

  const deletePricing = async (id: string) => {
    await supabase.from('creator_pricing').delete().eq('id', id)
    setPricing(pricing.filter(p => p.id !== id))
  }

  const handleSpamAction = async (messageId: string, senderId: string, action: 'accept' | 'reject') => {
    if (action === 'accept') {
      // Bikin chat session 10 menit gratis
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          sender_id: senderId,
          creator_id: profile?.id,
          duration_hours: 0,
          credits_paid: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (!error && session) {
        // Copy pesan spam ke chat room
        const spamMsg = spamMessages.find(m => m.id === messageId)
        if (spamMsg) {
          await supabase.from('messages').insert({
            session_id: session.id,
            sender_id: senderId,
            content: spamMsg.content,
            is_read: false
          })
        }
      }
    }

    // Update status spam message
    await supabase
      .from('spam_messages')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', messageId)

    setSpamMessages(spamMessages.filter(m => m.id !== messageId))

    if (action === 'accept') {
      alert('Pesan diterima! Chat 10 menit telah dibuat.')
      // Refresh active chats
      const { data: chatsData } = await supabase
        .from('chat_sessions')
        .select('*, sender:sender_id(id, username, full_name)')
        .eq('creator_id', profile?.id)
        .order('started_at', { ascending: false })
      setActiveChats(chatsData || [])
    }
  }

  const calculateWithdraw = (kredits: number) => {
    const grossAmount = kredits * KREDIT_TO_IDR * (1 - PLATFORM_FEE)
    const fee = grossAmount < FREE_TRANSFER_MIN ? TRANSFER_FEE : 0
    const netAmount = grossAmount - fee
    return { grossAmount, fee, netAmount }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount < MIN_WITHDRAW) {
      alert(`Minimal withdraw ${MIN_WITHDRAW} kredit!`)
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      alert('Lengkapi semua data rekening!')
      return
    }

    const availableBalance = earnings?.available_balance || 0
    if (amount > availableBalance) {
      alert('Saldo tidak cukup!')
      return
    }

    setWithdrawLoading(true)

    const { grossAmount, fee, netAmount } = calculateWithdraw(amount)

    const { data: withdrawal, error: withdrawError } = await supabase
      .from('withdrawals')
      .insert({
        creator_id: profile?.id,
        amount: amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawError) {
      alert('Gagal membuat request withdraw!')
      setWithdrawLoading(false)
      return
    }

    await supabase
      .from('earnings')
      .update({
        available_balance: availableBalance - amount
      })
      .eq('creator_id', profile?.id)

    setEarnings({ ...earnings, available_balance: availableBalance - amount })
    setWithdrawals([withdrawal, ...withdrawals])
    
    setWithdrawAmount('')
    setBankName('')
    setAccountNumber('')
    setAccountName('')
    setWithdrawLoading(false)

    alert(`Request withdraw berhasil!\n\nJumlah: ${amount} Kredit\nDiterima: Rp ${netAmount.toLocaleString('id-ID')}${fee > 0 ? `\n(Fee transfer: Rp ${fee.toLocaleString('id-ID')})` : ' (FREE transfer)'}\n\nAkan diproses dalam 1-3 hari kerja.`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Completed</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const withdrawCalc = withdrawAmount ? calculateWithdraw(parseFloat(withdrawAmount)) : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-400">Fanonym</h1>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Halo, {profile?.full_name || profile?.username}! 👋</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Pendapatan</p>
            <p className="text-2xl font-bold text-teal-400">{earnings?.total_earned || 0} Kredit</p>
            <p className="text-gray-500 text-xs">Sepanjang waktu</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Saldo</p>
            <p className="text-2xl font-bold text-green-400">{earnings?.available_balance || 0} Kredit</p>
            <p className="text-gray-500 text-xs">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">Chat Aktif</p>
            <p className="text-2xl font-bold text-purple-400">{activeChats.filter(c => new Date(c.expires_at) > new Date()).length}</p>
          </div>
        </div>

        {/* Profile Link */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Link Profil Kamu</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`fanonym.vercel.app/creator/${profile?.username}`}
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-300"
            />
            <button 
              onClick={() => navigator.clipboard.writeText(`fanonym.vercel.app/creator/${profile?.username}`)}
              className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'inbox' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Inbox ({activeChats.length})
          </button>
          <button
            onClick={() => setActiveTab('spam')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'spam' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Spam ({spamMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'pricing' ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Set Harga
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'withdraw' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            💰 Withdraw
          </button>
        </div>

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Chat Masuk</h3>
            {activeChats.length === 0 ? (
              <p className="text-gray-400">Belum ada chat masuk.</p>
            ) : (
              <div className="space-y-3">
                {activeChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-teal-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                        {chat.sender?.full_name?.[0] || chat.sender?.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{chat.sender?.full_name || chat.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-400 text-sm">
                          {chat.credits_paid === 0 ? '🆓 Free chat' : `Bayar ${chat.credits_paid} kredit`}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      new Date(chat.expires_at) < new Date()
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-teal-500/20 text-teal-400'
                    }`}>
                      ⏱ {getTimeLeft(chat.expires_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spam Tab */}
        {activeTab === 'spam' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Pesan Gratis (Spam)</h3>
            <p className="text-gray-500 text-sm mb-4">Jika diterima, chat 10 menit akan dibuat otomatis.</p>
            {spamMessages.length === 0 ? (
              <p className="text-gray-400">Tidak ada pesan spam.</p>
            ) : (
              <div className="space-y-3">
                {spamMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center font-bold">
                        {msg.sender?.full_name?.[0] || msg.sender?.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{msg.sender?.full_name || msg.sender?.username || 'Anonymous'}</p>
                        <p className="text-gray-500 text-xs">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{msg.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSpamAction(msg.id, msg.sender_id, 'accept')}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                      >
                        ✓ Terima (10 menit chat)
                      </button>
                      <button
                        onClick={() => handleSpamAction(msg.id, msg.sender_id, 'reject')}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        ✗ Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Atur Harga Chat</h3>
            
            <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-3">Tambah Durasi Baru</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Durasi (jam)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Harga (kredit)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="5"
                    min="1"
                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                  />
                </div>
                <button
                  onClick={addPricing}
                  className="px-4 py-2 bg-teal-500 rounded-lg hover:bg-teal-600 font-semibold"
                >
                  Tambah
                </button>
              </div>
            </div>

            {pricing.length === 0 ? (
              <p className="text-gray-400">Belum ada pricing. Tambah di atas!</p>
            ) : (
              <div className="space-y-4">
                {pricing.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold">{p.duration_hours} Jam</p>
                      <p className="text-gray-400 text-sm">Durasi chat</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={p.price_credits}
                        onChange={(e) => updatePricing(p.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-center"
                      />
                      <span className="text-gray-400">Kredit</span>
                      <button
                        onClick={() => deletePricing(p.id)}
                        className="ml-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Hapus
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
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Tarik Saldo</h3>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm">Saldo kamu:</p>
                <p className="text-2xl font-bold text-green-400">{earnings?.available_balance || 0} Kredit</p>
                <p className="text-gray-400 text-xs mt-1">≈ Rp {((earnings?.available_balance || 0) * KREDIT_TO_IDR * (1 - PLATFORM_FEE)).toLocaleString('id-ID')} (setelah potongan 20%)</p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300 mb-2">📋 Ketentuan Withdraw:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Minimal withdraw: <span className="text-white">{MIN_WITHDRAW} Kredit</span></li>
                  <li>• Potongan platform: <span className="text-white">20%</span></li>
                  <li>• Di bawah Rp 1.000.000: <span className="text-yellow-400">Fee Rp 30.000</span></li>
                  <li>• Rp 1.000.000 ke atas: <span className="text-green-400">FREE transfer</span></li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Jumlah Kredit</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Min. ${MIN_WITHDRAW}`}
                    min={MIN_WITHDRAW}
                    max={earnings?.available_balance || 0}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA, Mandiri, GoPay, OVO, dll"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nomor Rekening / HP</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Nama Pemilik</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Nama sesuai rekening"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              {withdrawCalc && parseFloat(withdrawAmount) >= MIN_WITHDRAW && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Rincian:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Jumlah</span>
                      <span>{withdrawAmount} Kredit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nilai (setelah potongan 20%)</span>
                      <span>Rp {withdrawCalc.grossAmount.toLocaleString('id-ID')}</span>
                    </div>
                    {withdrawCalc.fee > 0 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>Fee transfer</span>
                        <span>- Rp {withdrawCalc.fee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-green-400 pt-2 border-t border-gray-700">
                      <span>Yang diterima</span>
                      <span>Rp {withdrawCalc.netAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAW || parseFloat(withdrawAmount) > (earnings?.available_balance || 0)}
                className="w-full py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? 'Processing...' : 'Request Withdraw'}
              </button>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Riwayat Withdraw</h3>
              
              {withdrawals.length === 0 ? (
                <p className="text-gray-400">Belum ada riwayat withdraw.</p>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => {
                    const calc = calculateWithdraw(w.amount)
                    return (
                      <div key={w.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                        <div>
                          <p className="font-semibold">{w.amount} Kredit</p>
                          <p className="text-gray-400 text-sm">{w.bank_name} - {w.account_number}</p>
                          <p className="text-gray-500 text-xs">{new Date(w.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(w.status)}
                          <p className="text-gray-400 text-sm mt-1">Rp {calc.netAmount.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}