// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      {/* Tarjeta central */}
      <div className="max-w-xl w-full px-8 py-12 border border-neutral-800 rounded-2xl bg-neutral-900/40 backdrop-blur-sm shadow-2xl shadow-emerald-900/10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-bold mb-3">
            SISTEMA OPERATIVO
          </p>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            FlowEngine EdgeCore
          </h1>
        </div>

        {/* Descripción */}
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          Bienvenido al mando central. La infraestructura multi-tenant está activa.
          <br />
          <span className="text-neutral-500">Estado: </span>
          <span className="text-emerald-400">● Sistema Operacional</span>
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/tiendas"
            className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-95"
          >
            Gestionar Tiendas
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          <a
            href="https://dawn-haze-9df3.flowengine-edgecore.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-5 py-2.5 rounded-lg border border-neutral-800 text-neutral-400 text-sm hover:text-white hover:border-neutral-600 transition-colors bg-black"
          >
            <span>Ver Edge Worker</span>
          </a>
        </div>
      </div>

      {/* Footer técnico */}
      <div className="mt-12 flex gap-6 text-[10px] text-neutral-600 font-mono uppercase tracking-wider">
        <span>Next.js</span>
        <span>•</span>
        <span>Supabase</span>
        <span>•</span>
        <span>Cloudflare</span>
      </div>
    </main>
  );
}

