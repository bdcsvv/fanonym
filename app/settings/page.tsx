'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/app/components/Logo'
import FanonymLoader from '@/app/components/FanonymLoader'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'blocked' | 'security'>('profile')

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)

  // Verification (creator only)
  const [ktpUploading, setKtpUploading] = useState(false)
  const [selfieUploading, setSelfieUploading] = useState(false)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [ktpPreview, setKtpPreview] = useState('')
  const [selfiePreview, setSelfiePreview] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
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

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setPhone(profileData.phone || '')
        setAvatarUrl(profileData.avatar_url || '')
        setCoverPhotoUrl(profileData.cover_photo_url || '')
      }
      setLoading(false)
    }

    init()
  }, [router])

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    if (!user) return
    setLoadingBlocked(true)
    
    const { data, error } = await supabase
      .from('blocks')
      .select(`
        id,
        blocked_id,
        created_at,
        blocked_user:blocked_id(id, username, full_name, avatar_url)
      `)
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBlockedUsers(data)
    }
    setLoadingBlocked(false)
  }

  useEffect(() => {
    if (activeTab === 'blocked' && user) {
      fetchBlockedUsers()
    }
  }, [activeTab, user])

  const handleUnblock = async (blockId: string, username: string) => {
    if (!confirm(`Yakin ingin membuka blokir @${username}?`)) return
    
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId)

    if (!error) {
      setBlockedUsers(blockedUsers.filter(b => b.id !== blockId))
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal upload foto: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setAvatarUrl(publicUrl)
    setUploading(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal upload cover: ' + uploadError.message)
      setCoverUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setCoverPhotoUrl(publicUrl)
    setCoverUploading(false)
  }

  const handleKtpSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setKtpFile(file)
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setKtpPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelfieFile(file)
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleVerificationSubmit = async () => {
    if (!ktpFile || !selfieFile) {
      alert('Upload KTP dan Selfie dengan KTP terlebih dahulu!')
      return
    }

    setKtpUploading(true)

    try {
      // Upload KTP
      const ktpExt = ktpFile.name.split('.').pop()
      const ktpFileName = `ktp-${user.id}-${Date.now()}.${ktpExt}`

      const { error: ktpError } = await supabase.storage
        .from('ktp')
        .upload(ktpFileName, ktpFile)

      if (ktpError) throw new Error('Gagal upload KTP: ' + ktpError.message)

      const { data: { publicUrl: ktpUrl } } = supabase.storage
        .from('ktp')
        .getPublicUrl(ktpFileName)

      // Upload Selfie
      const selfieExt = selfieFile.name.split('.').pop()
      const selfieFileName = `selfie-${user.id}-${Date.now()}.${selfieExt}`

      const { error: selfieError } = await supabase.storage
        .from('ktp')
        .upload(selfieFileName, selfieFile)

      if (selfieError) throw new Error('Gagal upload Selfie: ' + selfieError.message)

      const { data: { publicUrl: selfieUrl } } = supabase.storage
        .from('ktp')
        .getPublicUrl(selfieFileName)

      // Update profile with both URLs and set status to pending verification
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          ktp_url: ktpUrl,
          selfie_ktp_url: selfieUrl,
          status: 'pending_verification',
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Create verification request for admin
      await supabase
        .from('verification_requests')
        .insert({
          creator_id: user.id,
          ktp_url: ktpUrl,
          selfie_ktp_url: selfieUrl,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })

      setProfile({ 
        ...profile, 
        ktp_url: ktpUrl, 
        selfie_ktp_url: selfieUrl,
        status: 'pending_verification' 
      })
      
      alert('Dokumen berhasil diupload! Tunggu verifikasi dari admin (1-2 hari kerja).')
      
      // Clear previews
      setKtpFile(null)
      setSelfieFile(null)
      setKtpPreview('')
      setSelfiePreview('')
      
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat upload')
    } finally {
      setKtpUploading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Password baru dan konfirmasi tidak sama')
      return
    }

    setChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        bio: bio,
        phone: phone,
        avatar_url: avatarUrl,
        cover_photo_url: coverPhotoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
    } else {
      alert('Profil berhasil disimpan!')
      setProfile({ ...profile, full_name: fullName, username, bio, phone, avatar_url: avatarUrl, cover_photo_url: coverPhotoUrl })
    }
    setSaving(false)
  }

  if (loading) {
    return <FanonymLoader text="Memuat pengaturan..." />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative page-transition">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="p-4 relative z-10 bg-[#0c0a14]/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Logo size="md" linkTo={profile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'} />
          <Link 
            href={profile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'} 
            className="text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
            Pengaturan Akun
          </h1>
          <p className="text-zinc-400">Kelola profil, keamanan, dan preferensi kamu</p>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-2 mb-8 inline-flex gap-2 animate-fadeIn">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Keamanan
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'blocked'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Blocked
            }`}
          >
            🚫 Diblokir {blockedUsers.length > 0 && `(${blockedUsers.length})`}
          </button>
        </div>

        {activeTab === 'profile' && (
          <>
        {/* Avatar Upload */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Foto Profil</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold">
                  {fullName?.[0] || username?.[0] || '?'}
                </div>
              )}
            </div>
            <div>
              <label className="px-4 py-2 bg-purple-500 rounded-lg cursor-pointer hover:bg-purple-600 inline-block">
                {uploading ? 'Uploading...' : 'Upload Foto'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-gray-500 text-xs mt-2">JPG, PNG max 2MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informasi Dasar</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-500 outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">fanonym.vercel.app/creator/{username || 'username'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan tentang dirimu..."
                rows={3}
                maxLength={200}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-500 outline-none resize-none"
              />
              <p className="text-gray-500 text-xs mt-1">{bio.length}/200 karakter</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nomor HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informasi Akun</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs mt-1">Email tidak bisa diubah</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tipe Akun</label>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                profile?.user_type === 'creator' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {profile?.user_type === 'creator' ? '✨ Creator' : '👤 Sender'}
              </div>
            </div>
          </div>
        </div>

        {/* Creator Verification */}
        {profile?.user_type === 'creator' && (
          <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-8 mb-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                🔐
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Verifikasi Creator
                </h3>
                <p className="text-zinc-400 text-sm mt-1">Dapatkan badge verified dan akses penuh</p>
              </div>
            </div>
            
            {profile?.is_verified ? (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold text-lg">Akun Terverifikasi!</p>
                    <p className="text-green-300/70 text-sm">Kamu bisa menggunakan semua fitur creator</p>
                  </div>
                </div>
              </div>
            ) : profile?.status === 'pending_verification' ? (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-bold text-lg">Menunggu Verifikasi Admin</p>
                    <p className="text-yellow-300/70 text-sm">Biasanya diproses dalam 1-2 hari kerja</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
                  <p className="text-zinc-400 text-sm">
                    💡 <span className="font-semibold">Tips:</span> Pastikan dokumen yang kamu upload jelas dan tidak blur agar proses verifikasi lebih cepat!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Benefits */}
                <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-700/30">
                  <p className="text-zinc-300 font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Keuntungan Verifikasi:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-zinc-400">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Badge verified ✓ di profil kamu</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-400">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Set harga chat sesuai keinginan</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-400">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Withdraw pendapatan kapan saja</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-400">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tingkatkan kepercayaan pengguna</span>
                    </li>
                  </ul>
                </div>

                {/* Upload Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* KTP Upload */}
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-zinc-300 font-semibold mb-2 block">📄 Upload KTP</span>
                      <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
                        ktpPreview 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-zinc-700 hover:border-purple-500/50 bg-zinc-800/30 hover:bg-zinc-800/50'
                      }`}>
                        {ktpPreview ? (
                          <div className="space-y-3">
                            <img src={ktpPreview} alt="KTP Preview" className="w-full h-48 object-cover rounded-lg" />
                            <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              KTP siap diupload
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-zinc-400 text-sm">Klik untuk upload KTP</p>
                            <p className="text-zinc-600 text-xs mt-1">JPG, PNG max 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleKtpSelect}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Selfie with KTP Upload */}
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-zinc-300 font-semibold mb-2 block">🤳 Selfie dengan KTP</span>
                      <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
                        selfiePreview 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-zinc-700 hover:border-purple-500/50 bg-zinc-800/30 hover:bg-zinc-800/50'
                      }`}>
                        {selfiePreview ? (
                          <div className="space-y-3">
                            <img src={selfiePreview} alt="Selfie Preview" className="w-full h-48 object-cover rounded-lg" />
                            <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Selfie siap diupload
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-zinc-400 text-sm">Klik untuk upload selfie</p>
                            <p className="text-zinc-600 text-xs mt-1">JPG, PNG max 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSelfieSelect}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                  <p className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Persyaratan Foto:
                  </p>
                  <ul className="space-y-2 text-blue-300/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Foto KTP harus jelas, tidak blur, dan semua text terbaca</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Selfie harus menunjukkan wajah kamu dengan jelas sambil memegang KTP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Pastikan KTP yang kamu pegang di selfie sama dengan foto KTP yang diupload</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Format: JPG atau PNG, maksimal 5MB per file</span>
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleVerificationSubmit}
                  disabled={!ktpFile || !selfieFile || ktpUploading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  {ktpUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kirim Verifikasi
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
          </>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-2xl">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ganti Password</h3>
                <p className="text-sm text-gray-400">Perbarui password akun kamu</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 flex items-center gap-2">
                  <span>✅</span>
                  <span>Password berhasil diubah!</span>
                </p>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 flex items-center gap-2">
                  <span>❌</span>
                  <span>{passwordError}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:border-purple-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl focus:border-purple-500 outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmNewPassword}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
              >
                {changingPassword ? 'Mengubah...' : '🔐 Ganti Password'}
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-400 text-sm font-medium mb-1">ℹ️ Tips Keamanan</p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Gunakan password minimal 6 karakter</li>
                <li>• Kombinasikan huruf, angka, dan simbol</li>
                <li>• Jangan gunakan password yang sama dengan akun lain</li>
              </ul>
            </div>
          </div>
        )}

        {/* Blocked Users Tab */}
        {activeTab === 'blocked' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                🚫
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pengguna Diblokir</h3>
                <p className="text-sm text-gray-400">{blockedUsers.length} pengguna diblokir</p>
              </div>
            </div>

            {loadingBlocked ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : blockedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center text-4xl">
                  👤
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Tidak Ada Pengguna Diblokir</h4>
                <p className="text-gray-400 text-sm">Pengguna yang kamu blokir akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      {blocked.blocked_user?.avatar_url ? (
                        <img
                          src={blocked.blocked_user.avatar_url}
                          alt={blocked.blocked_user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                          {blocked.blocked_user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs">
                        🚫
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {blocked.blocked_user?.full_name || blocked.blocked_user?.username}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        @{blocked.blocked_user?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Diblokir {new Date(blocked.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Unblock Button */}
                    <button
                      onClick={() => handleUnblock(blocked.id, blocked.blocked_user?.username)}
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-green-400 text-sm font-medium transition-colors"
                    >
                      🔓 Buka
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Info Notice */}
            {blockedUsers.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm font-medium mb-1">ℹ️ Tentang Pemblokiran</p>
                <p className="text-gray-400 text-sm">
                  Pengguna yang diblokir tidak akan bisa mengirim pesan atau melihat profilmu.
                  Mereka tidak akan diberi tahu bahwa kamu memblokirnya.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}