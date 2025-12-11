import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const { clerk_user_id, shopify_token, shopify_shop_name } = await req.json();

  if (!clerk_user_id || !shopify_token || !shopify_shop_name) {
    return NextResponse.json({ error: "Datos de onboarding incompletos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tiendas')
    .insert([
      {
        clerk_user_id,
        shopify_token,
        shopify_shop_name,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: "Fallo al registrar la tienda." }, { status: 500 });
  }

  return NextResponse.json({ message: "Tenant creado con éxito.", tenant: data[0] }, { status: 200 });
}

