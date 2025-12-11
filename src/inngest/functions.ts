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
  whatsapp_provider: ProviderType | null;
  whatsapp_api_token: string | null;
  whatsapp_phone_number: string | null;
  meta_phone_id: string | null;
  meta_template_name: string | null;
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
  { event: "app/abandonment.triggered" },
  async ({ event, step }) => {
    const data = event.data as AbandonmentEventData;

    // a) fetch-tenant-config
    const { config } = await step.run("fetch-tenant-config", async () => {
      const supabase = await createAuthenticatedServerClient();

      const { data: tienda, error } = await supabase
        .from("tiendas")
        .select(
          "tenant_id, flow_abandono_delay_min, whatsapp_provider, whatsapp_api_token, whatsapp_phone_number, meta_phone_id, meta_template_name"
        )
        .eq("tenant_id", data.tenant_id)
        .single();

      if (error) {
        throw new Error(
          `Config not found for tenant ${data.tenant_id}: ${error.message}`
        );
      }

      if (!tienda) {
        throw new Error(`No row found for tenant ${data.tenant_id}`);
      }

      return { config: tienda as TiendaConfig };
    });

    // b) wait-for-dynamic-delay
    const delayMinutes = config.flow_abandono_delay_min ?? 60;
    await step.sleep("wait-for-dynamic-delay", `${delayMinutes}m`);

    // c) generate-ai-message
    const message = await step.run("generate-ai-message", async () => {
      const amount = (data.total_price ?? data.cart_value ?? 0) as number;
      const shopName =
        (data.shop_domain ?? data.shop ?? "tu tienda favorita") as string;

      return `Hola 👋, soy el asistente de ${shopName}. Vimos que dejaste un carrito por $${amount}. ¿Te ayudo a finalizar tu compra?`;
    });

    // d) dispatch-whatsapp-message
    const sendResult = await step.run("dispatch-whatsapp-message", async () => {
      const provider: ProviderType =
        (config.whatsapp_provider ?? "MOCK") as ProviderType;

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
        metaPhoneId: config.meta_phone_id ?? undefined,
        metaTemplateName: config.meta_template_name ?? undefined,
      });
    });

    if (!sendResult.success) {
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
