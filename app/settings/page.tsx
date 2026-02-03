'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/app/components/Logo'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'blocked'>('profile')

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Verification (creator only)
  const [ktpUploading, setKtpUploading] = useState(false)

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

  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setKtpUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('ktp')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal upload KTP: ' + uploadError.message)
      setKtpUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ktp')
      .getPublicUrl(fileName)

    // Update profile with KTP URL and set status to pending verification
    await supabase
      .from('profiles')
      .update({ 
        ktp_url: publicUrl,
        status: 'pending_verification'
      })
      .eq('id', user.id)

    setProfile({ ...profile, ktp_url: publicUrl, status: 'pending_verification' })
    setKtpUploading(false)
    alert('KTP berhasil diupload! Tunggu verifikasi dari admin.')
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
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
    } else {
      alert('Profil berhasil disimpan!')
      setProfile({ ...profile, full_name: fullName, username, bio, phone, avatar_url: avatarUrl })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-gray-800/50 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Logo size="md" linkTo="/" />
          <Link 
            href={profile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'} 
            className="text-gray-400 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6 relative z-10">
        <h1 className="text-2xl font-bold mb-6">⚙️ Pengaturan</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👤 Profil
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'blocked'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
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
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">🔐 Verifikasi Creator</h3>
            
            {profile?.is_verified ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span>Akun sudah terverifikasi!</span>
                </p>
              </div>
            ) : profile?.status === 'pending_verification' ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <span>Menunggu verifikasi admin...</span>
                </p>
                <p className="text-gray-500 text-sm mt-2">Biasanya 1-2 hari kerja</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm mb-4">
                  Upload foto KTP untuk verifikasi. Setelah diverifikasi, kamu bisa:
                </p>
                <ul className="text-gray-500 text-sm mb-4 space-y-1">
                  <li>• Set harga chat</li>
                  <li>• Withdraw pendapatan</li>
                  <li>• Dapat badge verified ✓</li>
                </ul>
                <label className="px-4 py-2 bg-yellow-500 text-black rounded-lg cursor-pointer hover:bg-yellow-600 inline-block font-semibold">
                  {ktpUploading ? 'Uploading...' : '📤 Upload KTP'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleKtpUpload}
                    className="hidden"
                    disabled={ktpUploading}
                  />
                </label>
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