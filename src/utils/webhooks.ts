/**
 * Utilitários para verificação de webhooks
 */

/**
 * Verifica a assinatura de um webhook usando HMAC SHA256
 * 
 * @param payload - Corpo da requisição (string ou Buffer)
 * @param signature - Assinatura recebida no header
 * @param secret - Secret da API key
 * @returns true se a assinatura for válida
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  // Verifica null/undefined explicitamente para permitir payloads vazios mas válidos
  if (payload == null || signature == null || secret == null) {
    return false;
  }

  // Verifica se signature e secret não estão vazios (payload vazio é permitido)
  if (typeof signature === 'string' && signature.length === 0) {
    return false;
  }
  if (typeof secret === 'string' && secret.length === 0) {
    return false;
  }

  // Detecta ambiente Node.js de forma robusta
  const isNode =
    typeof process !== 'undefined' &&
    !!(process as any).versions &&
    !!(process as any).versions.node;

  // Se estiver em Node.js, usa crypto
  if (isNode) {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      // Comparação segura para prevenir timing attacks
      const hashBuffer = Buffer.from(hash);
      const signatureBuffer = Buffer.from(signature);

      // timingSafeEqual lança erro se os buffers tiverem tamanhos diferentes
      if (hashBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
    } catch (error) {
      console.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }

  // Para browser, usa Web Crypto API
  // Nota: Web Crypto API não suporta HMAC diretamente de forma simples
  // Recomenda-se usar uma biblioteca como crypto-js ou fazer no backend
  console.warn('Verificação de webhook no browser não é recomendada. Use no backend.');
  return false;
}

/**
 * Extrai a assinatura do header da requisição
 * 
 * @param headers - Headers da requisição
 * @returns A assinatura ou null se não encontrada
 */
export function extractWebhookSignature(headers: Record<string, string | string[] | undefined>): string | null {
  // Tenta diferentes formatos de header
  const signatureHeader = 
    headers['x-upay-signature'] ||
    headers['x-upay-signature-256'] ||
    headers['upay-signature'] ||
    headers['signature'];

  if (!signatureHeader) {
    return null;
  }

  // Se for array, pega o primeiro
  if (Array.isArray(signatureHeader)) {
    return signatureHeader[0] || null;
  }

  // Remove prefixo "sha256=" se existir
  return signatureHeader.replace(/^sha256=/, '');
}

/**
 * Tipos de eventos de webhook
 */
export enum WebhookEventType {
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_PAID = 'transaction.paid',
  TRANSACTION_FAILED = 'transaction.failed',
  TRANSACTION_CANCELLED = 'transaction.cancelled',
  TRANSACTION_REFUNDED = 'transaction.refunded',
  PAYMENT_LINK_CREATED = 'payment_link.created',
  PAYMENT_LINK_UPDATED = 'payment_link.updated',
  PAYMENT_LINK_DELETED = 'payment_link.deleted',
}
