'use client'

import Link from 'next/link'

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold mb-2 animate-fadeInDown">📜 Syarat dan Ketentuan</h1>
        <p className="text-gray-400 mb-8 animate-fadeIn">Terakhir diperbarui: Februari 2026</p>

        <div className="space-y-8 text-gray-300">
          {/* Section 1 */}
          <section className="animate-fadeInUp">
            <h2 className="text-xl font-semibold text-white mb-3">1. Penerimaan Syarat</h2>
            <p className="leading-relaxed">
              Dengan mengakses dan menggunakan platform Fanonym, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. 
              Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </section>

          {/* Section 2 */}
          <section className="animate-fadeInUp stagger-1">
            <h2 className="text-xl font-semibold text-white mb-3">2. Deskripsi Layanan</h2>
            <p className="leading-relaxed mb-3">
              Fanonym adalah platform yang memungkinkan pengguna (Sender) untuk mengirim pesan anonim kepada Creator. 
              Layanan kami meliputi:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pengiriman pesan anonim berbayar (chat berbatas waktu)</li>
              <li>Pengiriman pesan spam gratis (tanpa balasan)</li>
              <li>Sistem kredit untuk transaksi</li>
              <li>Fitur monetisasi untuk Creator</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="animate-fadeInUp stagger-2">
            <h2 className="text-xl font-semibold text-white mb-3">3. Pendaftaran Akun</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Anda harus berusia minimal <strong>18 tahun</strong> untuk menggunakan layanan ini</li>
              <li>Informasi yang Anda berikan saat pendaftaran harus akurat dan lengkap</li>
              <li>Anda bertanggung jawab menjaga kerahasiaan password akun Anda</li>
              <li>Satu orang hanya boleh memiliki satu akun</li>
              <li>Akun tidak boleh diperjualbelikan atau dipindahtangankan</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="animate-fadeInUp stagger-3">
            <h2 className="text-xl font-semibold text-white mb-3">4. Sistem Kredit & Pembayaran</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Kredit dibeli melalui transfer manual ke rekening yang ditentukan</li>
              <li>Kredit yang sudah dibeli <strong>tidak dapat dikembalikan (non-refundable)</strong></li>
              <li>Harga kredit dapat berubah sewaktu-waktu tanpa pemberitahuan</li>
              <li>Kredit tidak memiliki masa kadaluarsa</li>
              <li>Fanonym berhak membatalkan transaksi yang mencurigakan</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="animate-fadeInUp stagger-4">
            <h2 className="text-xl font-semibold text-white mb-3">5. Aturan untuk Creator</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Creator harus melakukan verifikasi identitas (KTP) sebelum dapat menerima pembayaran</li>
              <li>Platform memotong <strong>20% dari setiap transaksi</strong> sebagai biaya layanan</li>
              <li>Minimum penarikan adalah <strong>10 kredit</strong></li>
              <li>Biaya transfer Rp 30.000 untuk penarikan di bawah Rp 1.000.000</li>
              <li>Creator wajib merespons chat yang sudah dibayar dalam waktu yang wajar</li>
              <li>Creator bertanggung jawab atas konten yang mereka bagikan</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="animate-fadeInUp stagger-5">
            <h2 className="text-xl font-semibold text-white mb-3">6. Konten yang Dilarang</h2>
            <p className="mb-3">Pengguna dilarang mengirim atau membagikan konten yang:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Mengandung pornografi anak atau eksploitasi anak</li>
              <li>Mengancam, melecehkan, atau mengintimidasi orang lain</li>
              <li>Mempromosikan kekerasan, kebencian, atau diskriminasi</li>
              <li>Melanggar hak kekayaan intelektual pihak lain</li>
              <li>Menyebarkan informasi palsu atau menyesatkan</li>
              <li>Mengandung malware, virus, atau kode berbahaya</li>
              <li>Melanggar hukum yang berlaku di Indonesia</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Penangguhan & Penghentian Akun</h2>
            <p className="leading-relaxed mb-3">
              Fanonym berhak untuk menangguhkan atau menghentikan akun Anda tanpa pemberitahuan jika:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Melanggar Syarat dan Ketentuan ini</li>
              <li>Terlibat dalam aktivitas penipuan atau ilegal</li>
              <li>Menerima laporan yang valid dari pengguna lain</li>
              <li>Tidak aktif dalam waktu yang lama (lebih dari 1 tahun)</li>
            </ul>
            <p className="mt-3 text-yellow-400">
              ⚠️ Saldo kredit yang tersisa pada akun yang ditangguhkan karena pelanggaran <strong>tidak akan dikembalikan</strong>.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Batasan Tanggung Jawab</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fanonym tidak bertanggung jawab atas konten yang dikirim antar pengguna</li>
              <li>Fanonym tidak menjamin ketersediaan layanan 100% tanpa gangguan</li>
              <li>Fanonym tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform</li>
              <li>Interaksi antara Sender dan Creator adalah tanggung jawab masing-masing pihak</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Perubahan Syarat</h2>
            <p className="leading-relaxed">
              Fanonym dapat mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku segera setelah 
              dipublikasikan di halaman ini. Penggunaan berkelanjutan atas layanan kami setelah perubahan berarti 
              Anda menyetujui syarat yang telah diperbarui.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Hukum yang Berlaku</h2>
            <p className="leading-relaxed">
              Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
              Setiap perselisihan akan diselesaikan melalui musyawarah, dan jika tidak tercapai kesepakatan, 
              akan diselesaikan di Pengadilan Negeri Jakarta.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Kontak</h2>
            <p className="leading-relaxed">
              Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui:
            </p>
            <div className="mt-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <p>📧 Email: <a href="mailto:support@fanonym.id" className="text-purple-400 hover:text-purple-300">support@fanonym.id</a></p>
              <p className="mt-2">📱 Instagram: <a href="https://instagram.com/fanonym.id" target="_blank" className="text-purple-400 hover:text-purple-300">@fanonym.id</a></p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center">
            Dengan menggunakan Fanonym, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 text-sm">
              Kebijakan Privasi →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
