/**
 * Tipos de base de datos generados desde Supabase
 * Actualiza estos tipos cuando cambies el esquema de la base de datos
 */

export interface Tienda {
  id: string;
  clerk_user_id: string;
  shopify_token: string;
  shopify_shop_name: string;
  created_at: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      tiendas: {
        Row: Tienda;
        Insert: Omit<Tienda, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tienda, 'id' | 'created_at'>>;
      };
    };
  };
}

