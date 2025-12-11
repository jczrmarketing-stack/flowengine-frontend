import { createAuthenticatedServerClient } from "@/lib/supabase/server";
import Link from "next/link";

// Forzamos comportamiento dinámico para ver siempre datos frescos (Real-time admin)
export const dynamic = "force-dynamic";

// Definición estricta del tipo de dato según tu tabla en Supabase
type TiendaRow = {
  tenant_id: string;
  clerk_user_id: string;
  shopify_shop_name: string;
  health_status: string;
  created_at: string;
};

export default async function TiendasPage() {
  const supabase = await createAuthenticatedServerClient();

  // 1. Consulta a la tabla CORRECTA ('tiendas')
  const { data: tiendas, error } = await supabase
    .from("tiendas") // <--- CORREGIDO: Antes decía 'tenants'
    .select("tenant_id, clerk_user_id, shopify_shop_name, health_status, created_at")
    .order("created_at", { ascending: false })
    .returns<TiendaRow[]>(); // <--- Tipado fuerte para evitar errores en el template

  // 2. Manejo de Error Crítico (Blindaje LEY 2: Visibilidad)
  if (error) {
    return (
      <main className="min-h-screen bg-black text-red-500 p-10 font-mono flex items-center justify-center">
        <div className="max-w-2xl w-full border border-red-900/50 bg-red-950/10 p-6 rounded-lg">
          <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            CRITICAL_DB_ERROR
          </h1>
          <p className="text-sm text-red-300 font-mono break-all">{error.message}</p>
          <p className="text-xs text-red-500 mt-4">Verifica que la tabla `tiendas` existe y tienes permisos RLS.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 md:px-12">
      {/* Navbar de Navegación */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-10 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tenants Activos
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Infraestructura multi-tenant conectada.
          </p>
        </div>
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-white transition-colors"
        >
          <span>← VOLVER AL MANDO</span>
        </Link>
      </header>

      {/* Tabla de Datos */}
      <div className="max-w-6xl mx-auto">
        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/20 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-900/50 text-neutral-400 font-medium border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 w-1/3">Shopify Store</th>
                <th className="px-6 py-4 w-1/3">Tenant ID (UUID)</th>
                <th className="px-6 py-4">Clerk User</th>
                <th className="px-6 py-4 text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              
              {/* Renderizado de Filas */}
              {tiendas?.map((tienda) => (
                <tr
                  key={tienda.tenant_id}
                  className="hover:bg-neutral-800/40 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{tienda.shopify_shop_name}</div>
                    <div className="text-[10px] text-neutral-600 font-mono mt-0.5">
                      Creado: {new Date(tienda.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] bg-neutral-950 px-2 py-1 rounded border border-neutral-800 text-neutral-400 select-all">
                      {tienda.tenant_id}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-xs">
                    {tienda.clerk_user_id || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide border ${
                        tienda.health_status === "OK"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tienda.health_status === "OK" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                      {tienda.health_status || "UNKNOWN"}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Estado Vacío */}
              {tiendas && tiendas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-neutral-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-neutral-400 font-medium">No hay tiendas registradas</p>
                      <p className="text-neutral-600 text-xs max-w-xs mx-auto">
                        Usa el endpoint <code className="text-neutral-400">POST /api/onboard</code> para crear tu primer tenant.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}


