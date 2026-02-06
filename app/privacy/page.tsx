'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <nav className="border-b border-purple-500/20 p-4 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent">
            fanonym
          </Link>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Kembali
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 relative z-10 page-transition">
        <h1 className="text-3xl font-bold mb-2 animate-fadeInDown">🔒 Kebijakan Privasi</h1>
        <p className="text-gray-400 mb-8 animate-fadeIn">Terakhir diperbarui: Februari 2026</p>

        <div className="space-y-8 text-gray-300">
          {/* Intro */}
          <section className="animate-fadeInUp">
            <p className="leading-relaxed">
              Fanonym ("kami", "kita", atau "platform") berkomitmen untuk melindungi privasi Anda. 
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, 
              dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
            </p>
          </section>

          {/* Section 1 */}
          <section className="animate-fadeInUp stagger-1">
            <h2 className="text-xl font-semibold text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
            
            <h3 className="text-lg font-medium text-purple-400 mt-4 mb-2">A. Informasi yang Anda Berikan</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Informasi Akun:</strong> Nama, email, username, password (terenkripsi), nomor telepon</li>
              <li><strong>Informasi Profil:</strong> Foto profil, bio, foto sampul</li>
              <li><strong>Informasi Verifikasi (Creator):</strong> Foto KTP untuk verifikasi identitas</li>
              <li><strong>Informasi Pembayaran:</strong> Nama bank, nomor rekening untuk penarikan dana</li>
              <li><strong>Konten:</strong> Pesan, foto, dan video yang Anda kirim melalui platform</li>
            </ul>

            <h3 className="text-lg font-medium text-purple-400 mt-4 mb-2">B. Informasi yang Dikumpulkan Otomatis</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Data Penggunaan:</strong> Halaman yang dikunjungi, waktu akses, fitur yang digunakan</li>
              <li><strong>Informasi Perangkat:</strong> Jenis browser, sistem operasi, IP address</li>
              <li><strong>Cookies:</strong> Untuk menjaga sesi login dan preferensi</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="animate-fadeInUp stagger-2">
            <h2 className="text-xl font-semibold text-white mb-3">2. Bagaimana Kami Menggunakan Informasi</h2>
            <p className="mb-3">Kami menggunakan informasi Anda untuk:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Menyediakan dan mengelola layanan platform</li>
              <li>Memproses transaksi dan pembayaran</li>
              <li>Memverifikasi identitas Creator</li>
              <li>Mengirim notifikasi terkait akun dan transaksi</li>
              <li>Meningkatkan pengalaman pengguna dan layanan</li>
              <li>Mencegah penipuan dan penyalahgunaan platform</li>
              <li>Mematuhi kewajiban hukum</li>
              <li>Menanggapi pertanyaan dan keluhan</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="animate-fadeInUp stagger-3">
            <h2 className="text-xl font-semibold text-white mb-3">3. Penyimpanan & Keamanan Data</h2>
            
            <h3 className="text-lg font-medium text-purple-400 mt-4 mb-2">A. Penyimpanan</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Data disimpan di server yang aman (Supabase - berbasis di Singapore/US)</li>
              <li>Data disimpan selama akun Anda aktif atau sesuai kebutuhan hukum</li>
              <li>Foto KTP akan dihapus setelah verifikasi selesai (maksimal 30 hari)</li>
            </ul>

            <h3 className="text-lg font-medium text-purple-400 mt-4 mb-2">B. Keamanan</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Password dienkripsi menggunakan standar industri</li>
              <li>Koneksi menggunakan HTTPS/SSL</li>
              <li>Akses ke data dibatasi hanya untuk pihak yang berwenang</li>
              <li>Row Level Security (RLS) untuk melindungi data antar pengguna</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="animate-fadeInUp stagger-4">
            <h2 className="text-xl font-semibold text-white mb-3">4. Berbagi Informasi</h2>
            <p className="mb-3">Kami <strong>TIDAK</strong> menjual data pribadi Anda. Kami hanya membagikan informasi dalam kondisi berikut:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Dengan Pengguna Lain:</strong> Username, foto profil, dan bio Anda terlihat publik. Pesan dikirim secara anonim (identity Sender tersembunyi dari Creator)</li>
              <li><strong>Penyedia Layanan:</strong> Pihak ketiga yang membantu operasional (hosting, pembayaran) dengan perjanjian kerahasiaan</li>
              <li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum, proses pengadilan, atau permintaan pemerintah yang sah</li>
              <li><strong>Keamanan:</strong> Untuk mencegah penipuan, pelanggaran, atau melindungi hak kami</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="animate-fadeInUp stagger-5">
            <h2 className="text-xl font-semibold text-white mb-3">5. Anonimitas</h2>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="leading-relaxed">
                <strong>🎭 Fitur Anonim:</strong> Ketika Sender mengirim pesan ke Creator, identitas Sender 
                (nama, username, foto) <strong>TIDAK ditampilkan</strong> kepada Creator. Hanya isi pesan yang terlihat.
              </p>
              <p className="mt-3 text-yellow-400 text-sm">
                ⚠️ Namun, untuk keperluan keamanan dan hukum, kami tetap menyimpan data siapa yang mengirim pesan. 
                Data ini hanya akan dibuka jika ada laporan pelanggaran serius atau permintaan dari pihak berwenang.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Hak Anda</h2>
            <p className="mb-3">Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Mengakses:</strong> Meminta salinan data pribadi Anda</li>
              <li><strong>Memperbaiki:</strong> Memperbarui informasi yang tidak akurat</li>
              <li><strong>Menghapus:</strong> Meminta penghapusan akun dan data Anda</li>
              <li><strong>Membatasi:</strong> Meminta pembatasan pemrosesan data tertentu</li>
              <li><strong>Portabilitas:</strong> Meminta data dalam format yang dapat dibaca mesin</li>
            </ul>
            <p className="mt-3">
              Untuk menggunakan hak-hak ini, hubungi kami di <a href="mailto:privacy@fanonym.id" className="text-purple-400 hover:text-purple-300">privacy@fanonym.id</a>
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
            <p className="leading-relaxed mb-3">
              Kami menggunakan cookies dan teknologi serupa untuk:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Menjaga sesi login Anda</li>
              <li>Mengingat preferensi Anda</li>
              <li>Menganalisis penggunaan platform</li>
            </ul>
            <p className="mt-3">
              Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi dengan baik.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Anak di Bawah Umur</h2>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="leading-relaxed">
                🚫 Layanan Fanonym <strong>TIDAK ditujukan untuk anak di bawah 18 tahun</strong>. 
                Kami tidak dengan sengaja mengumpulkan informasi dari anak-anak. Jika Anda mengetahui 
                ada anak yang menggunakan platform kami, silakan hubungi kami untuk penghapusan akun.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Transfer Data Internasional</h2>
            <p className="leading-relaxed">
              Data Anda mungkin disimpan dan diproses di server yang berlokasi di luar Indonesia 
              (seperti Singapore atau Amerika Serikat). Dengan menggunakan layanan kami, Anda menyetujui 
              transfer data ini. Kami memastikan perlindungan yang memadai sesuai standar internasional.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Perubahan Kebijakan</h2>
            <p className="leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan 
              akan diberitahukan melalui email atau notifikasi di platform. Tanggal "Terakhir diperbarui" 
              di atas menunjukkan kapan revisi terakhir dilakukan.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Hubungi Kami</h2>
            <p className="leading-relaxed mb-3">
              Jika Anda memiliki pertanyaan atau keluhan tentang Kebijakan Privasi ini, silakan hubungi:
            </p>
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <p className="font-semibold text-white">Fanonym Privacy Team</p>
              <p className="mt-2">📧 Email: <a href="mailto:privacy@fanonym.id" className="text-purple-400 hover:text-purple-300">privacy@fanonym.id</a></p>
              <p className="mt-1">📧 Umum: <a href="mailto:support@fanonym.id" className="text-purple-400 hover:text-purple-300">support@fanonym.id</a></p>
              <p className="mt-1">📱 Instagram: <a href="https://instagram.com/fanonym.id" target="_blank" className="text-purple-400 hover:text-purple-300">@fanonym.id</a></p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center">
            Dengan menggunakan Fanonym, Anda menyatakan telah membaca dan memahami Kebijakan Privasi ini.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 text-sm">
              ← Syarat dan Ketentuan
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
