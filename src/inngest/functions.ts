// src/inngest/functions.ts
import { inngest } from "./client";
import { createAuthenticatedServerClient } from "@/lib/supabase/server";
import {
  sendWhatsAppMessage,
  type ProviderType,
} from "@/lib/messaging/whatsappClient";

type TiendaConfig = {
  tenant_id: string;
  flow_abandono_delay_min: number;
  whatsapp_provider: ProviderType;
  whatsapp_api_token: string | null;
  whatsapp_phone_number: string | null;
};

type AbandonmentEventData = {
  tenant_id: string;
  shop_domain?: string;
  shop?: string;
  total_price?: number;
  cart_value?: number;
  phone?: string;
  [key: string]: unknown;
};

export const abandonmentFlow = inngest.createFunction(
  { id: "abandonment-recovery-flow" },
  // Por ahora seguimos usando el evento manual:
  // "app/abandonment.triggered"
  { event: "app/abandonment.triggered" },
  async ({ event, step }) => {
    const data = event.data as AbandonmentEventData;

    // --- 1) Config del tenant desde Supabase ---
    const { config } = await step.run("fetch-tenant-config", async () => {
      const supabase = await createAuthenticatedServerClient();

      const { data: tienda, error } = await supabase
        .from("tiendas")
        .select(
          "tenant_id, flow_abandono_delay_min, whatsapp_provider, whatsapp_api_token, whatsapp_phone_number"
        )
        .eq("tenant_id", data.tenant_id)
        .single();

      if (error || !tienda) {
        throw new Error(
          `Config not found for tenant ${data.tenant_id}: ${
            error?.message ?? "no row"
          }`
        );
      }

      return { config: tienda as TiendaConfig };
    });

    // --- 2) Delay dinámico según la tienda ---
    const delayMinutes = config.flow_abandono_delay_min ?? 60;
    await step.sleep("wait-for-dynamic-delay", `${delayMinutes}m`);

    // --- 3) Mensaje IA (placeholder) ---
    const message = await step.run("generate-ai-message", async () => {
      const amount = (data.total_price ?? data.cart_value ?? 0) as number;
      const shopName =
        (data.shop_domain ?? data.shop ?? "tu tienda favorita") as string;

      return `Hola 👋, soy el asistente de ${shopName}. Vimos que dejaste un carrito por $${amount}. ¿Te ayudo a finalizar tu compra?`;
    });

    // --- 4) Enviar WhatsApp usando la abstracción ---
    const sendResult = await step.run("dispatch-whatsapp-message", async () => {
      const provider: ProviderType =
        (config.whatsapp_provider ?? "ZOKO") as ProviderType;

      const token = config.whatsapp_api_token ?? "";
      const phoneNumber =
        (data.phone as string | undefined) ??
        config.whatsapp_phone_number ??
        "";

      return await sendWhatsAppMessage({
        provider,
        token,
        phoneNumber,
        message,
      });
    });

    if (!sendResult.success) {
      // Esto hace que Inngest marque la ejecución como fallo y permita reintentos.
      throw new Error(
        `WhatsApp send failed: ${sendResult.error ?? "unknown error"}`
      );
    }

    return {
      status: "completed",
      tenant_id: config.tenant_id,
      messageId: sendResult.messageId,
    };
  }
);
