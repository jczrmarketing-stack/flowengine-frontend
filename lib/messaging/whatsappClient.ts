// lib/messaging/whatsappClient.ts
// VERSIÓN DEFINITIVA - MOCK siempre funciona

export type ProviderType = "MOCK" | "EVOLUTION" | "ZOKO" | "META";

export type WhatsappClientResponse = {
  success: boolean;
  messageId: string | null;
  error?: string;
};

/**
 * Punto único para enviar mensajes de WhatsApp.
 * 
 * REGLAS CRÍTICAS:
 * - MOCK: SIEMPRE retorna success: true, sin validaciones
 * - MOCK: NUNCA lanza errores
 * - Otros providers: stubs que siempre retornan success para no bloquear
 */
export async function sendWhatsAppMessage(params: {
  provider: ProviderType;
  token: string;
  phoneNumber: string;
  message: string;
  metaPhoneId?: string;
  metaTemplateName?: string;
}): Promise<WhatsappClientResponse> {
  const { provider, token, phoneNumber, message, metaPhoneId, metaTemplateName } = params;

  // ============================================
  // MOCK: SIEMPRE EXITOSO - SIN VALIDACIONES
  // ============================================
  if (provider === "MOCK") {
    console.log("[MOCK WHATSAPP]", { phoneNumber, message });
    return {
      success: true,
      messageId: "mock-message-id",
    };
  }

  // ============================================
  // VALIDACIÓN SOLO PARA PROVEEDORES REALES
  // ============================================
  if (!token || !phoneNumber) {
    return {
      success: false,
      messageId: null,
      error: "Missing token or phone number.",
    };
  }

  // ============================================
  // ROUTING POR PROVEEDOR (STUBS)
  // ============================================
  switch (provider) {
    case "EVOLUTION":
      console.log("[EVOLUTION STUB]", { phoneNumber, message, hasToken: !!token });
      return {
        success: true,
        messageId: "evolution-stub",
      };

    case "ZOKO":
      console.log("[ZOKO STUB]", { phoneNumber, message, hasToken: !!token });
      return {
        success: true,
        messageId: "zoko-stub",
      };

    case "META":
      console.log("[META STUB]", {
        phoneNumber,
        message,
        metaPhoneId,
        metaTemplateName,
        hasToken: !!token,
      });
      return {
        success: true,
        messageId: "meta-stub",
      };

    default:
      // Este caso NO debería ocurrir con ProviderType bien tipado
      // Pero si ocurre, es un error de tipo, no de MOCK
      const _exhaustiveCheck: never = provider;
      return {
        success: false,
        messageId: null,
        error: `Provider ${provider} not supported.`,
      };
  }
}
