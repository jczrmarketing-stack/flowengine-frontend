// lib/messaging/whatsappClient.ts

export type ProviderType = "MOCK" | "EVOLUTION" | "ZOKO" | "META";

export type WhatsappClientResponse = {
  success: boolean;
  messageId: string | null;
  error?: string;
};

/**
 * Punto único para enviar mensajes de WhatsApp.
 * Soporta MOCK (siempre exitoso), EVOLUTION, ZOKO y META (stubs por ahora).
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

  // 1) MODO MOCK → siempre OK, sin validaciones
  if (provider === "MOCK") {
    console.log("[MOCK WHATSAPP]", { phoneNumber, message });
    return {
      success: true,
      messageId: "mock-message-id",
    };
  }

  // 2) Validación para proveedores reales
  if (!token || !phoneNumber) {
    return {
      success: false,
      messageId: null,
      error: "Missing token or phone number.",
    };
  }

  // 3) Routing por proveedor
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
      // Stub para META - puede funcionar sin campos Meta para pruebas
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
      // Este caso no debería ocurrir si ProviderType está bien tipado
      return {
        success: false,
        messageId: null,
        error: `Provider ${provider} not supported.`,
      };
  }
}
  