// lib/messaging/whatsappClient.ts

export type WhatsappClientResponse = {
    success: boolean;
    messageId: string | null;
    error?: string;
  };
  
  // Proveedores soportados en esta fase
  export type ProviderType = "MOCK" | "EVOLUTION" | "ZOKO";
  
  type SendParams = {
    provider: ProviderType;
    token: string;        // Token/API key (no se usa en MOCK)
    phoneNumber: string;  // Número del cliente
    message: string;      // Mensaje final generado por la IA
  
    // Campos opcionales para el futuro (Meta, etc.)
    metaPhoneId?: string;
    metaTemplateName?: string;
  };
  
  /**
   * Punto ÚNICO para enviar mensajes de WhatsApp.
   * Cada proveedor tiene su implementación debajo.
   */
  export async function sendWhatsAppMessage({
    provider,
    token,
    phoneNumber,
    message,
  }: SendParams): Promise<WhatsappClientResponse> {
    //
    // 1) MODO MOCK → para pruebas y demos sin tocar ninguna API real
    //
    if (provider === "MOCK") {
      console.log("[MOCK WHATSAPP] →", { phoneNumber, message });
  
      // Simulamos éxito siempre
      return {
        success: true,
        messageId: "mock-message-id",
      };
    }
  
    //
    // 2) Validaciones mínimas para proveedores reales
    //
    if (!token || !phoneNumber) {
      return {
        success: false,
        messageId: null,
        error: "Missing token or phone number.",
      };
    }
  
    //
    // 3) Routing real por proveedor
    //
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
  // STUBS PARA PROVEEDORES REALES (por ahora solo loguean)
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
    console.log("[EVOLUTION STUB] →", { phoneNumber, message, token });
  
    return {
      success: true,
      messageId: "evolution-stub",
    };
  }
  
  async function sendToZoko({
    token,
    phoneNumber,
    message,
  }: {
    token: string;
    phoneNumber: string;
    message: string;
  }): Promise<WhatsappClientResponse> {
    console.log("[ZOKO STUB] →", { phoneNumber, message, token });
  
    return {
      success: true,
      messageId: "zoko-stub",
    };
  }
  