'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-teal-400">Fanonym</Link>
          <Link 
            href={profile?.user_type === 'creator' ? '/dashboard/creator' : '/dashboard/sender'} 
            className="text-gray-400 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">⚙️ Pengaturan Profil</h1>

        {/* Avatar Upload */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Foto Profil</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-teal-500"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold">
                  {fullName?.[0] || username?.[0] || '?'}
                </div>
              )}
            </div>
            <div>
              <label className="px-4 py-2 bg-teal-500 rounded-lg cursor-pointer hover:bg-teal-600 inline-block">
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
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-teal-500 outline-none"
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
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-teal-500 outline-none resize-none"
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
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-teal-500 outline-none"
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
                  ? 'bg-teal-500/20 text-teal-400' 
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
          className="w-full py-3 bg-teal-500 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </main>
    </div>
  )
}