import { Lead } from "../types";

export interface WhaticketConfig {
  enabled: boolean;
  apiUrl: string;
  token: string;
  whatsappId: string;
  messageTemplate: string;
}

const DEFAULT_TEMPLATE = `Olá *{nome}*! 👋

Gostaria de agradecer seu interesse em nosso *Guia Estratégico de Segurança Colaborativa*.

Vi que você representa a empresa *{empresa}* e indicou que possuem cerca de *{clientes}* clientes ativos. 

Nosso especialista em Segurança Colaborativa entrará em contato em breve para apresentar o modelo de negócio Atalaia e ajudar a expandir seu faturamento de forma recorrente.

Se preferir acelerar o atendimento, basta responder a essa mensagem!

Abraços,
*Equipe Atalaia Segurança Colaborativa*`;

/**
 * Gets Whaticket configurations from localStorage with default fallbacks
 */
export function getWhaticketConfig(): WhaticketConfig {
  try {
    const saved = localStorage.getItem("whaticket_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled ?? true,
        apiUrl: parsed.apiUrl || "https://app.whatendimento.digital:443/backend/api/messages/send",
        token: parsed.token || "fhnvklhgskldçdmk1255CC",
        whatsappId: parsed.whatsappId || "",
        messageTemplate: parsed.messageTemplate || DEFAULT_TEMPLATE,
      };
    }
  } catch (err) {
    console.error("Erro ao ler configuração do Whaticket:", err);
  }

  return {
    enabled: true,
    apiUrl: "https://app.whatendimento.digital:443/backend/api/messages/send",
    token: "fhnvklhgskldçdmk1255CC",
    whatsappId: "",
    messageTemplate: DEFAULT_TEMPLATE,
  };
}

/**
 * Saves Whaticket configurations to localStorage
 */
export function saveWhaticketConfig(config: WhaticketConfig): void {
  localStorage.setItem("whaticket_config", JSON.stringify(config));
}

/**
 * Normalizes Brazilian phone numbers for WhatsApp API.
 * Standard format required: 55 + DDD + Number (all numbers, no spaces or special characters)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");

  // If number starts with 0, remove it
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // If missing country code for Brazil (starts with DDD, length is 10 or 11 digits)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = "55" + cleaned;
  }

  return cleaned;
}

/**
 * Replaces placeholders in the message template with actual lead data
 */
export function formatMessage(template: string, lead: Lead): string {
  return template
    .replace(/{nome}/g, lead.name)
    .replace(/{empresa}/g, lead.companyName)
    .replace(/{clientes}/g, lead.clientCountEstimate)
    .replace(/{email}/g, lead.email)
    .replace(/{telefone}/g, lead.phone);
}

/**
 * Sends a message directly from the browser to the Whaticket API
 * This is used as a fallback when the Node.js server proxy is not available (e.g., static hosting)
 */
async function sendWhaticketDirectly(
  normalizedPhone: string,
  messageText: string,
  config: WhaticketConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      number: normalizedPhone,
      body: messageText,
    };

    if (config.whatsappId) {
      const idNum = parseInt(config.whatsappId, 10);
      payload.whatsappId = isNaN(idNum) ? config.whatsappId : idNum;
    }

    const response = await fetch(config.apiUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.token.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Erro na requisição direta ao Whaticket:", response.status, responseText);
      return {
        success: false,
        error: `O Whaticket respondeu com erro direto: ${responseText || response.statusText}`
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Falha na conexão direta com o Whaticket (CORS ou rede):", err);
    return {
      success: false,
      error: `Erro de conexão direta (CORS/Rede): ${err.message || "Por favor, verifique se a URL da API está correta e configurada para aceitar requisições de outros domínios."}`
    };
  }
}

/**
 * Sends a message to WhatsApp via our server-side API proxy to bypass browser CORS constraints.
 * If the proxy route is not available (e.g. running on static hosting), it falls back to a direct client-side call.
 */
export async function sendWhaticketMessage(
  toPhone: string,
  messageText: string,
  customConfig?: WhaticketConfig
): Promise<{ success: boolean; error?: string }> {
  const config = customConfig || getWhaticketConfig();

  if (!config.apiUrl) {
    return { success: false, error: "A URL da API do Whaticket não está configurada." };
  }
  if (!config.token) {
    return { success: false, error: "O Token da API do Whaticket não está configurado." };
  }

  const normalizedPhone = normalizePhoneNumber(toPhone);

  try {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiUrl: config.apiUrl.trim(),
        token: config.token.trim(),
        number: normalizedPhone,
        body: messageText,
        whatsappId: config.whatsappId,
      }),
    });

    if (response.status === 404) {
      console.warn("Rota de proxy '/api/whatsapp/send' não encontrada (hospedagem estática). Tentando envio direto do navegador...");
      return await sendWhaticketDirectly(normalizedPhone, messageText, config);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `Status ${response.status}`;
      console.error("Erro no proxy da API Whaticket:", response.status, errorMsg);
      return { 
        success: false, 
        error: `A API do Whaticket (via servidor) retornou erro: ${errorMsg}` 
      };
    }

    const responseData = await response.json();
    console.log("Mensagem enviada com sucesso via proxy Whaticket:", responseData);
    return { success: true };
  } catch (err: any) {
    console.warn("Falha ao comunicar com o servidor proxy (hospedagem estática ou offline). Tentando envio direto do navegador...", err);
    return await sendWhaticketDirectly(normalizedPhone, messageText, config);
  }
}

/**
 * Automatically triggers thank you message if automation is enabled
 */
export async function triggerLeadWhatsAppNotification(lead: Lead): Promise<boolean> {
  const config = getWhaticketConfig();
  
  if (!config.enabled) {
    console.log("Automação de WhatsApp está desativada.");
    return false;
  }

  const messageText = formatMessage(config.messageTemplate, lead);
  const result = await sendWhaticketMessage(lead.phone, messageText, config);
  
  if (!result.success) {
    console.warn("Falha no envio do WhatsApp automático para o lead:", result.error);
    return false;
  }

  return true;
}
