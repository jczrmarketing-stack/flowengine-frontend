// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente Supabase para SSR (panel interno / admin)
export async function createAuthenticatedServerClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,          // debe existir en tu .env.local
    process.env.SUPABASE_SERVICE_KEY!,  // service key para panel interno
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // en Server Components a veces no se puede mutar cookie; ignoramos
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignoramos
          }
        },
      },
    }
  );

  return supabase;
}