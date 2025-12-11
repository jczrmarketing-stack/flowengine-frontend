import { createAuthenticatedServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/onboard
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { clerk_user_id, shopify_shop_name, shopify_token } = body;

    if (!clerk_user_id || !shopify_shop_name || !shopify_token) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = await createAuthenticatedServerClient();

    const { data, error } = await supabase
      .from("tiendas")
      .insert([
        {
          clerk_user_id,
          shopify_shop_name,
          shopify_token,
          health_status: "OK",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("DB ERROR:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Tenant creado con éxito.",
        tenant: data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
