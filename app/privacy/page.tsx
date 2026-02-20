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

export default function PrivacyPolicy() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
              <p className="text-zinc-500 text-sm mt-1">Terakhir diperbarui: Februari 2026</p>
            </div>
          </div>
          
          {/* Intro */}
          <div className="mt-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-zinc-300 leading-relaxed">
              Fanonym menghargai privasi dan keamanan informasi pribadi Anda. Dokumen ini menjelaskan 
              bagaimana kami mengelola data saat Anda menggunakan layanan Fanonym.
            </p>
            <p className="text-zinc-400 text-sm mt-4">
              Dengan membuat akun atau menggunakan Platform, Anda menyetujui praktik yang dijelaskan dalam Kebijakan ini.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          <Section title="Prinsip Dasar Pengelolaan Data" index={1} isVisible={isVisible}>
            <p>Kami memproses data pribadi berdasarkan prinsip berikut:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span><strong className="text-zinc-300">Transparansi</strong> — Anda mengetahui data apa yang diproses dan untuk tujuan apa</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span><strong className="text-zinc-300">Pembatasan tujuan</strong> — Data hanya digunakan untuk kebutuhan layanan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span><strong className="text-zinc-300">Minimalisasi</strong> — Kami hanya mengumpulkan data yang benar-benar diperlukan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span><strong className="text-zinc-300">Keamanan</strong> — Data dilindungi dengan standar yang wajar dan sesuai praktik industri</span>
              </li>
            </ul>
          </Section>

          <Section title="Informasi yang Dikelola oleh Fanonym" index={2} isVisible={isVisible}>
            <p>Dalam menjalankan layanan, kami dapat mengelola:</p>
            
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <h4 className="font-medium text-zinc-200 mb-2">Informasi Akun</h4>
                <p className="text-sm">Nama, email, username, nomor telepon, serta informasi profil yang Anda isi secara sukarela.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <h4 className="font-medium text-zinc-200 mb-2">Informasi Verifikasi (Creator)</h4>
                <p className="text-sm">Data identitas yang diperlukan untuk memastikan keabsahan akun Creator dan menjaga keamanan Platform.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <h4 className="font-medium text-zinc-200 mb-2">Informasi Transaksi</h4>
                <p className="text-sm">Data terkait aktivitas transaksi dan pencairan dana, termasuk informasi rekening yang diberikan oleh pengguna.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <h4 className="font-medium text-zinc-200 mb-2">Informasi Aktivitas & Teknis</h4>
                <p className="text-sm">Data teknis seperti alamat IP, jenis perangkat, sistem operasi, serta aktivitas penggunaan fitur.</p>
              </div>
              
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <h4 className="font-medium text-zinc-200 mb-2">Konten dalam Platform</h4>
                <p className="text-sm">Pesan, foto, atau konten lain yang Anda kirimkan melalui layanan.</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-500 mt-4">
              Kami tidak menyimpan informasi kartu pembayaran secara langsung.
            </p>
          </Section>

          <Section title="Alasan Kami Memproses Data" index={3} isVisible={isVisible}>
            <p>Data digunakan untuk memastikan Platform dapat berfungsi dengan baik, termasuk:</p>
            <ul className="space-y-2 mt-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Mengelola akun dan autentikasi pengguna</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Memfasilitasi transaksi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Melakukan verifikasi identitas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Menjaga keamanan sistem dan mencegah pelanggaran</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Menyediakan dukungan pelanggan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Memenuhi kewajiban hukum dan administratif</span>
              </li>
            </ul>
            <p className="mt-4 p-4 rounded-xl bg-purple-600/10 border border-purple-500/20 text-zinc-300">
              Kami tidak menjual data pribadi Anda kepada pihak mana pun.
            </p>
          </Section>

          <Section title="Kerahasiaan & Keamanan" index={4} isVisible={isVisible}>
            <p>
              Kami menerapkan langkah-langkah perlindungan teknis dan organisasi yang dirancang untuk 
              melindungi informasi dari akses yang tidak sah, perubahan, pengungkapan, atau perusakan.
            </p>
            <p className="mt-3">
              Akses terhadap data dibatasi hanya untuk pihak internal yang memiliki kebutuhan operasional 
              dan kewajiban menjaga kerahasiaan.
            </p>
            <p className="mt-3 text-zinc-500 text-sm">
              Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko. Anda juga bertanggung jawab 
              menjaga keamanan akun Anda.
            </p>
          </Section>

          <Section title="Kerja Sama dengan Pihak Ketiga" index={5} isVisible={isVisible}>
            <p>
              Dalam menjalankan layanan, kami dapat bekerja sama dengan penyedia layanan pihak ketiga 
              untuk kebutuhan operasional seperti infrastruktur, pemrosesan pembayaran, dan dukungan teknis.
            </p>
            <p className="mt-3">
              Pihak tersebut hanya memproses data sesuai instruksi kami dan terikat kewajiban kerahasiaan.
            </p>
            <p className="mt-3">
              Kami juga dapat mengungkapkan informasi apabila diwajibkan oleh hukum atau untuk melindungi 
              hak serta keamanan Platform.
            </p>
          </Section>

          <Section title="Retensi Data" index={6} isVisible={isVisible}>
            <p>
              Data pribadi disimpan selama akun Anda aktif atau selama diperlukan untuk menjalankan 
              layanan dan memenuhi kewajiban hukum.
            </p>
            <p className="mt-3">
              Setelah periode tersebut berakhir, data dapat dihapus atau diproses secara anonim sesuai 
              kebijakan internal kami.
            </p>
          </Section>

          <Section title="Batasan Usia" index={7} isVisible={isVisible}>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-zinc-300">
                Fanonym diperuntukkan bagi pengguna berusia minimal <strong>18 tahun</strong>. 
                Jika ditemukan pelanggaran terhadap ketentuan usia ini, kami berhak melakukan 
                pembatasan atau penghentian akun.
              </p>
            </div>
          </Section>

          <Section title="Perubahan Kebijakan" index={8} isVisible={isVisible}>
            <p>
              Kami dapat memperbarui Kebijakan ini sewaktu-waktu untuk menyesuaikan dengan 
              perkembangan layanan atau ketentuan hukum.
            </p>
            <p className="mt-3">
              Versi terbaru akan selalu tersedia di Platform.
            </p>
          </Section>

          <Section title="Kontak" index={9} isVisible={isVisible}>
            <p>Jika Anda memiliki pertanyaan atau permintaan terkait privasi, silakan hubungi:</p>
            <div className="mt-4 p-6 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email Privasi</p>
                  <a href="mailto:privacy@fanonym.id" className="text-purple-400 hover:text-purple-300 transition-colors">
                    privacy@fanonym.id
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email Support</p>
                  <a href="mailto:support@fanonym.id" className="text-purple-400 hover:text-purple-300 transition-colors">
                    support@fanonym.id
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
            Dengan menggunakan Fanonym, Anda menyatakan telah membaca dan memahami Kebijakan Privasi ini.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Syarat dan Ketentuan
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
