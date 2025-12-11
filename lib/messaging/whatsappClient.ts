// lib/messaging/whatsappClient.ts
// VERSIÓN DEFINITIVA: MOCK estable + EVOLUTION real + ZOKO/META stubs

export type ProviderType = "MOCK" | "EVOLUTION" | "ZOKO" | "META";

export type WhatsappClientResponse = {
  success: boolean;
  messageId: string | null;
  error?: string;
};

// ===============================
// ENV de Evolution
// ===============================
const EVOLUTION_SERVER_URL = process.env.EVOLUTION_SERVER_URL;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY ?? "";

// ===============================
// Helpers
// ===============================

function cleanPhoneNumber(raw: string): string {
  // Elimina todo lo que no sea dígito
  const digits = raw.replace(/[^\d]/g, "");
  return digits;
}

// ===============================
// EVOLUTION REAL
// ===============================
async function sendViaEvolution(params: {
  tokenFromConfig: string; // whatsapp_api_token desde Supabase
  phoneNumber: string;
  message: string;
}): Promise<WhatsappClientResponse> {
  const { tokenFromConfig, phoneNumber, message } = params;

  // 1) API Key: prioridad token de Supabase, luego EVOLUTION_API_KEY
  const apiKey = tokenFromConfig || EVOLUTION_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      messageId: null,
      error: "Evolution API key is missing (token + EVOLUTION_API_KEY empty).",
    };
  }

  // 2) Validar configuración básica
  if (!EVOLUTION_SERVER_URL || !EVOLUTION_INSTANCE) {
    return {
      success: false,
      messageId: null,
      error: "Evolution ENV not configured (EVOLUTION_SERVER_URL / EVOLUTION_INSTANCE).",
    };
  }

  // 3) Normalizar número
  const cleanedNumber = cleanPhoneNumber(phoneNumber);
  if (!cleanedNumber) {
    return {
      success: false,
      messageId: null,
      error: `Invalid phone number: "${phoneNumber}".`,
    };
  }

  const url = `${EVOLUTION_SERVER_URL}/message/sendText/${encodeURIComponent(
    EVOLUTION_INSTANCE
  )}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // IMPORTANTE: Evolution usa 'apikey', NO 'Authorization'
        apikey: apiKey,
      } as Record<string, string>,
      body: JSON.stringify({
        number: cleanedNumber, // ej: 573001234567
        text: message,
        // Algunas instalaciones necesitan esto para ignorar validaciones extra
        forceSend: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        messageId: null,
        error: `Evolution HTTP ${res.status}: ${text || res.statusText}`,
      };
    }

    const data: any = await res.json().catch(() => null);

    // Intentamos extraer un ID razonable
    const messageId =
      data?.messageId ||
      data?.data?.id ||
      data?.data?.key?.id ||
      data?.data?.key?.idMessage ||
      null;

    return {
      success: true,
      messageId: messageId ?? "evolution-ok",
    };
  } catch (err: any) {
    return {
      success: false,
      messageId: null,
      error: `Evolution network error: ${err?.message ?? "unknown"}`,
    };
  }
}

// ===============================
// FUNCIÓN PÚBLICA
// ===============================
export async function sendWhatsAppMessage(params: {
  provider: ProviderType;
  token: string; // viene de config.whatsapp_api_token
  phoneNumber: string;
  message: string;
  metaPhoneId?: string;
  metaTemplateName?: string;
}): Promise<WhatsappClientResponse> {
  const {
    provider,
    token,
    phoneNumber,
    message,
    metaPhoneId,
    metaTemplateName,
  } = params;

  // ===========================
  // MOCK: SIEMPRE EXITOSO
  // ===========================
  if (provider === "MOCK") {
    console.log("[MOCK WHATSAPP]", { phoneNumber, message });
    return {
      success: true,
      messageId: "mock-message-id",
    };
  }

  // Validación general (solo para proveedores reales)
  if (!phoneNumber) {
    return {
      success: false,
      messageId: null,
      error: "Missing phone number.",
    };
  }

  switch (provider) {
    case "EVOLUTION":
      return await sendViaEvolution({
        tokenFromConfig: token,
        phoneNumber,
        message,
      });

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

    default: {
      const _exhaustiveCheck: never = provider;
      return {
        success: false,
        messageId: null,
        error: `Provider ${provider} not supported.`,
      };
    }
  }
}
