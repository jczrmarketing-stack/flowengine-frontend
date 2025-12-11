// lib/messaging/whatsappClient.ts

// Respuesta estándar del cliente
export type WhatsappClientResponse = {
    success: boolean;
    messageId: string | null;
    error?: string;
  };
  
  // Proveedores soportados hoy
  export type ProviderType = "MOCK" | "EVOLUTION" | "ZOKO";
  
  // Parámetros de envío (dejamos meta* opcionales para el futuro)
  type SendParams = {
    provider: ProviderType;
    token: string;          // para EVOLUTION / ZOKO (en MOCK se ignora)
    phoneNumber: string;    // número del cliente
    message: string;        // texto generado por la IA
    metaPhoneId?: string;   // reservado para Meta más adelante
    metaTemplateName?: string;
  };
  
  /**
   * Punto ÚNICO para enviar mensajes de WhatsApp.
   * Aquí se enruta según el provider.
   */
  export async function sendWhatsAppMessage({
    provider,
    token,
    phoneNumber,
    message,
  }: SendParams): Promise<WhatsappClientResponse> {
    // 1) MODO MOCK → no requiere token ni número real
    if (provider === "MOCK") {
      console.log("[MOCK WHATSAPP] →", { phoneNumber, message });
      // Simulamos un envío exitoso
      return { success: true, messageId: "mock-message-id" };
    }
  
    // 2) A partir de aquí los providers reales SÍ requieren token y número
    if (!token || !phoneNumber) {
      return {
        success: false,
        messageId: null,
        error: "Missing token or phone number.",
      };
    }
  
    // 3) Routing por proveedor real
    switch (provider) {
      case "EVOLUTION":
        return await sendToEvolution({ token, phoneNumber, message });
  
      case "ZOKO":
        return await sendToZoko({ token, phoneNumber, message });
  
      default:
        return {
          success: false,
          messageId: null,
          error: `Provider ${provider} not supported.`,
        };
    }
  }
  
  // ----------------------------------------------------
  // STUB EVOLUTION (para demos / futuro)
  // ----------------------------------------------------
  async function sendToEvolution({
    token,
    phoneNumber,
    message,
  }: {
    token: string;
    phoneNumber: string;
    message: string;
  }): Promise<WhatsappClientResponse> {
    // Aquí luego pondremos la llamada real a Evolution API.
    console.log("[EVOLUTION STUB] →", { token, phoneNumber, message });
  
    return {
      success: true,
      messageId: "evolution-stub",
    };
  }
  
  // ----------------------------------------------------
  // STUB ZOKO (por si quieres usarlo después)
  // ----------------------------------------------------
  async function sendToZoko({
    token,
    phoneNumber,
    message,
  }: {
    token: string;
    phoneNumber: string;
    message: string;
  }): Promise<WhatsappClientResponse> {
    console.log("[ZOKO STUB] →", { token, phoneNumber, message });
  
    return {
      success: true,
      messageId: "zoko-stub",
    };
  }  
  