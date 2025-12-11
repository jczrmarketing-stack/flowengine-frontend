import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para uso en Client Components
 * Maneja la autenticación del lado del cliente
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

