'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook personalizado para obtener el cliente de Supabase en componentes del cliente
 * Crea una instancia única del cliente que se reutiliza en toda la aplicación
 */
export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);
  }, []);

  return supabase;
}

