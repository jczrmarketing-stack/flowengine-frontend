// lib/messaging/whatsappClient.ts

export type WhatsappClientResponse = {
    success: boolean;
    messageId: string | null;
    error?: string;
  };
  
  export type ProviderType = "ZOKO" | "EVOLUTION" | "TWILIO" | "NONE";
  
  type SendParams = {
    provider: ProviderType;
    token: string;
    phoneNumber: string;
    message: string;
  };
  
  /**
   * Punto ÚNICO para enviar mensajes de WhatsApp.
   * La lógica específica de cada proveedor se esconde aquí.
   */
  export async function sendWhatsAppMessage({
    provider,
    token,
    phoneNumber,
    message,
  }: SendParams): Promise<WhatsappClientResponse> {
    if (!token || !phoneNumber) {
      return {
        success: false,
        messageId: null,
        error: "Missing token or phone number.",
      };
    }
  
    switch (provider) {
      case "ZOKO":
        return await sendToZoko({ token, phoneNumber, message });
      case "EVOLUTION":
        return await sendToEvolution({ token, phoneNumber, message });
      // TWILIO / NONE caen en default
      default:
        return {
          success: false,
          messageId: null,
          error: `Provider ${provider} not supported yet.`,
        };
    }
  }
  
  // ----------------------------------------------------
  // IMPLEMENTACIONES ESPECÍFICAS (PLACEHOLDERS)
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
    // TODO: Reemplazar por la URL real de la API de Zoko según tu cuenta
    const ZOKO_API_URL = "https://api.zoko.io/v1/message";
  
    try {
      const response = await fetch(ZOKO_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: phoneNumber,
          body: message,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && (data.status === "sent" || data.success)) {
        return {
          success: true,
          messageId: data.message_id ?? data.id ?? "zoko-ok",
        };
      }
  
      console.error("Zoko API Error:", data);
      return {
        success: false,
        messageId: null,
        error: data.error || data.message || "Zoko API failed.",
      };
    } catch (e) {
      return {
        success: false,
        messageId: null,
        error: `Network error Zoko: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
    }
  }
  
  async function sendToEvolution({
    token,
    phoneNumber,
    message,
  }: {
    token: string;
    phoneNumber: string;
    message: string;
  }): Promise<WhatsappClientResponse> {
    // Suposición: token = "https://mi-instancia.com|API_KEY"
    const [instanceUrl, apiKey] = token.split("|");
    if (!instanceUrl || !apiKey) {
      return {
        success: false,
        messageId: null,
        error: "Invalid Evolution token format. Expected 'url|apikey'.",
      };
    }
  
    const EVOLUTION_API_URL = `${instanceUrl}/message/sendText/${apiKey}`;
  
    try {
      const response = await fetch(EVOLUTION_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: phoneNumber,
          textMessage: { text: message },
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && (data.key?.id || data.success)) {
        return {
          success: true,
          messageId: data.key?.id ?? "evolution-ok",
        };
      }
  
      console.error("Evolution API Error:", data);
      return {
        success: false,
        messageId: null,
        error: data.message || "Evolution API failed.",
      };
    } catch (e) {
      return {
        success: false,
        messageId: null,
        error: `Network error Evolution: ${
          e instanceof Error ? e.message : String(e)
        }`,
      };
    }
  }
  