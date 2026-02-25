'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

interface SectionProps {
  title: string
  children: React.ReactNode
  index: number
  isVisible: boolean
}

const Section = ({ title, children, index, isVisible }: SectionProps) => (
  <section 
    className={`
      transition-all duration-700 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 text-sm font-bold">
        {index}
      </span>
      {title}
    </h2>
    <div className="pl-11 text-zinc-400 leading-relaxed space-y-3">
      {children}
    </div>
  </section>
)

export default function TermsOfService() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0a14] text-white relative">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 border-b border-zinc-800/50 p-4 relative z-50 bg-[#0c0a14]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black italic bg-gradient-to-r from-[#6700e8] via-[#471c70] to-[#36244d] bg-clip-text text-transparent">
            fanonym
          </Link>
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
        </div>
      </nav>

      <main ref={containerRef} className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className={`
          mb-12 transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Syarat dan Ketentuan</h1>
              <p className="text-zinc-500 text-sm mt-1">Terakhir diperbarui: Februari 2026</p>
            </div>
          </div>
          
          {/* Intro */}
          <div className="mt-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-zinc-300 leading-relaxed">
              Dengan mengakses dan menggunakan platform Fanonym, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. 
              Jika Anda tidak menyetujui syarat-syarat ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          <Section title="Deskripsi Layanan" index={1} isVisible={isVisible}>
            <p>
              Fanonym adalah platform yang memungkinkan pengguna (Sender) untuk mengirim pesan anonim kepada Creator. 
              Layanan kami meliputi:
            </p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Pengiriman pesan anonim berbayar (chat berbatas waktu)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Pengiriman pesan spam gratis (tanpa balasan)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Sistem kredit untuk transaksi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Fitur monetisasi untuk Creator</span>
              </li>
            </ul>
          </Section>

          <Section title="Pendaftaran Akun" index={2} isVisible={isVisible}>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Anda harus berusia minimal <strong className="text-zinc-300">18 tahun</strong> untuk menggunakan layanan ini</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Informasi yang Anda berikan saat pendaftaran harus akurat dan lengkap</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Anda bertanggung jawab menjaga kerahasiaan password akun Anda</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Satu orang hanya boleh memiliki satu akun</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Akun tidak boleh diperjualbelikan atau dipindahtangankan</span>
              </li>
            </ul>
          </Section>

          <Section title="Sistem Kredit & Pembayaran" index={3} isVisible={isVisible}>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Kredit dibeli melalui transfer manual ke rekening yang ditentukan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Kredit yang sudah dibeli <strong className="text-zinc-300">tidak dapat dikembalikan (non-refundable)</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Harga kredit dapat berubah sewaktu-waktu tanpa pemberitahuan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Kredit tidak memiliki masa kadaluarsa</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Fanonym berhak membatalkan transaksi yang mencurigakan</span>
              </li>
            </ul>
          </Section>

          <Section title="Aturan untuk Creator" index={4} isVisible={isVisible}>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Creator harus melakukan verifikasi identitas (KTP) sebelum dapat menerima pembayaran</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Platform memotong <strong className="text-zinc-300">4% dari setiap transaksi</strong> sebagai biaya layanan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Minimum penarikan adalah <strong className="text-zinc-300">10 kredit</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Biaya transfer Rp 3.500 untuk setiap penarikan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Creator wajib merespons chat yang sudah dibayar dalam waktu yang wajar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Creator bertanggung jawab atas konten yang mereka bagikan</span>
              </li>
            </ul>
          </Section>

          <Section title="Konten yang Dilarang" index={5} isVisible={isVisible}>
            <p>Pengguna dilarang mengirim atau membagikan konten yang:</p>
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Mengandung pornografi anak atau eksploitasi anak</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Mengancam, melecehkan, atau mengintimidasi orang lain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Mempromosikan kekerasan, kebencian, atau diskriminasi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Melanggar hak kekayaan intelektual pihak lain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Menyebarkan informasi palsu atau menyesatkan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Mengandung malware, virus, atau kode berbahaya</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span>Melanggar hukum yang berlaku di Indonesia</span>
                </li>
              </ul>
            </div>
          </Section>

          <Section title="Penangguhan & Penghentian Akun" index={6} isVisible={isVisible}>
            <p>Fanonym berhak untuk menangguhkan atau menghentikan akun Anda tanpa pemberitahuan jika:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Melanggar Syarat dan Ketentuan ini</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Terlibat dalam aktivitas penipuan atau ilegal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Menerima laporan yang valid dari pengguna lain</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Tidak aktif dalam waktu yang lama (lebih dari 1 tahun)</span>
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-300 text-sm">
                Saldo kredit yang tersisa pada akun yang ditangguhkan karena pelanggaran <strong>tidak akan dikembalikan</strong>.
              </p>
            </div>
          </Section>

          <Section title="Batasan Tanggung Jawab" index={7} isVisible={isVisible}>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Fanonym tidak bertanggung jawab atas konten yang dikirim antar pengguna</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Fanonym tidak menjamin ketersediaan layanan 100% tanpa gangguan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Fanonym tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Interaksi antara Sender dan Creator adalah tanggung jawab masing-masing pihak</span>
              </li>
            </ul>
          </Section>

          <Section title="Perubahan Syarat" index={8} isVisible={isVisible}>
            <p>
              Fanonym dapat mengubah Syarat dan Ketentuan ini sewaktu-waktu. Perubahan akan berlaku segera setelah 
              dipublikasikan di halaman ini.
            </p>
            <p className="mt-3">
              Penggunaan berkelanjutan atas layanan kami setelah perubahan berarti Anda menyetujui syarat yang telah diperbarui.
            </p>
          </Section>

          <Section title="Hukum yang Berlaku" index={9} isVisible={isVisible}>
            <p>
              Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
            </p>
            <p className="mt-3">
              Setiap perselisihan akan diselesaikan melalui musyawarah, dan jika tidak tercapai kesepakatan, 
              akan diselesaikan di Pengadilan Negeri Jakarta.
            </p>
          </Section>

          <Section title="Kontak" index={10} isVisible={isVisible}>
            <p>Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi:</p>
            <div className="mt-4 p-6 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email Support</p>
                  <a href="mailto:support@fanonym.id" className="text-purple-400 hover:text-purple-300 transition-colors">
                    support@fanonym.id
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Instagram</p>
                  <a href="https://instagram.com/fanonym.id" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">
                    @fanonym.id
                  </a>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className={`
          mt-16 pt-8 border-t border-zinc-800 transition-all duration-700 delay-1000
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}>
          <p className="text-zinc-500 text-sm text-center">
            Dengan menggunakan Fanonym, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Kebijakan Privasi
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-white text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
