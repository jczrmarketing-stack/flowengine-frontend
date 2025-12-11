import { createAuthenticatedServerClient } from '@/lib/supabase/server';
import { errorResponse, successResponse, validateRequiredFields } from '@/lib/utils/api-response';
import type { Tienda } from '@/types/database';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerk_user_id, shopify_token, shopify_shop_name } = body;

    // Validar campos requeridos
    const validation = validateRequiredFields(
      { clerk_user_id, shopify_token, shopify_shop_name },
      ['clerk_user_id', 'shopify_token', 'shopify_shop_name']
    );

    if (!validation.isValid) {
      return errorResponse(
        'Datos de onboarding incompletos',
        400,
        { missingFields: validation.missingFields }
      );
    }

    // Crear cliente de Supabase
    const supabase = await createAuthenticatedServerClient();

    // Insertar tienda
    const { data, error } = await supabase
      .from('tiendas')
      .insert([
        {
          clerk_user_id,
          shopify_token,
          shopify_shop_name,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al registrar la tienda:', error);
      return errorResponse('Fallo al registrar la tienda', 500, error);
    }

    return successResponse<Tienda>(
      data,
      'Tenant creado con éxito',
      201
    );
  } catch (error) {
    console.error('Error en el endpoint de onboarding:', error);
    return errorResponse(
      'Error al procesar la solicitud',
      500,
      error instanceof Error ? error.message : 'Error desconocido'
    );
  }
}
