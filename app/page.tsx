import Link from "next/link";
import Logo from "./components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo variant="text" size="md" linkTo="/" />
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-500"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
            Platform Pesan Anonim #1 di Indonesia
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Kirim Pesan Anonim ke{" "}
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent">
              Creator Favoritmu
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Sampaikan pesan, pertanyaan, atau dukunganmu secara anonim.
            Identitasmu tetap rahasia, pesanmu tetap tersampaikan.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="w-full rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:brightness-110 sm:w-auto"
            >
              Mulai Kirim Pesan
            </Link>
            <a
              href="#cara-kerja"
              className="w-full rounded-full border border-white/10 px-8 py-3.5 text-base font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white sm:w-auto"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-kerja" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Cara Kerja
            </h2>
            <p className="text-lg text-zinc-400">
              Tiga langkah mudah untuk mengirim pesan anonim
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl font-bold text-purple-400">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">Pilih Creator</h3>
              <p className="text-zinc-400">
                Temukan creator favoritmu dari daftar creator yang tersedia di
                platform kami.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl font-bold text-purple-400">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">Beli Kredit</h3>
              <p className="text-zinc-400">
                Top up kredit dengan mudah untuk membuka akses pengiriman pesan
                anonim.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl font-bold text-purple-400">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">Kirim Pesan</h3>
              <p className="text-zinc-400">
                Tulis dan kirim pesanmu secara anonim. Creator akan menerima
                pesanmu tanpa tahu siapa pengirimnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Fanonym Section */}
      <section className="relative px-6 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Kenapa Fanonym?
            </h2>
            <p className="text-lg text-zinc-400">
              Platform yang dirancang untuk kenyamanan dan keamananmu
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Safe */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                <svg
                  className="h-7 w-7 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Aman</h3>
              <p className="text-zinc-400">
                Data dan identitasmu dilindungi dengan enkripsi. Tidak ada yang
                bisa melacak pesanmu.
              </p>
            </div>

            {/* Anonymous */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                <svg
                  className="h-7 w-7 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Anonim</h3>
              <p className="text-zinc-400">
                Identitasmu 100% tersembunyi. Kirim pesan tanpa rasa khawatir
                terungkap.
              </p>
            </div>

            {/* Easy */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                <svg
                  className="h-7 w-7 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">Mudah</h3>
              <p className="text-zinc-400">
                Proses yang simpel dan cepat. Daftar, beli kredit, dan langsung
                kirim pesan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-violet-600/5 to-transparent p-12 text-center sm:p-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Siap Kirim Pesan Pertamamu?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-zinc-400">
            Bergabung dengan ribuan fans yang sudah menggunakan Fanonym untuk
            berkomunikasi dengan creator favorit mereka.
          </p>
          <Link
            href="/auth/register"
            className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:brightness-110"
          >
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo variant="text" size="sm" linkTo="/" />
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Fanonym. Semua hak dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
