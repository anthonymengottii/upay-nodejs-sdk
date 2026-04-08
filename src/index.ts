/**
 * SDK Upay - Cliente principal
 * 
 * @example
 * ```typescript
 * import UpayClient from '@upay/upay-js';
 * 
 * const upay = new UpayClient({
 *   apiKey: 'sua_api_key_aqui'
 * });
 * 
 * const paymentLink = await upay.paymentLinks.create({
 *   title: 'Produto Premium',
 *   amount: 10000, // R$ 100,00
 * });
 * ```
 */

import { HttpClient } from './utils/http';
import { PaymentLinksResource } from './resources/PaymentLinks';
import { TransactionsResource } from './resources/Transactions';
import { ProductsResource } from './resources/Products';
import { CouponsResource } from './resources/Coupons';
import { ClientsResource } from './resources/Clients';
import { verifyWebhookSignature, extractWebhookSignature } from './utils/webhooks';
import type { UpayConfig } from './types';

export class UpayClient {
  private http: HttpClient;
  
  public readonly paymentLinks: PaymentLinksResource;
  public readonly transactions: TransactionsResource;
  public readonly products: ProductsResource;
  public readonly coupons: CouponsResource;
  public readonly clients: ClientsResource;

  constructor(config: UpayConfig) {
    if (!config.apiKey) {
      throw new Error('API Key é obrigatória');
    }

    this.http = new HttpClient(config);
    
    // Inicializa recursos
    this.paymentLinks = new PaymentLinksResource(this.http);
    this.transactions = new TransactionsResource(this.http);
    this.products = new ProductsResource(this.http);
    this.coupons = new CouponsResource(this.http);
    this.clients = new ClientsResource(this.http);
  }

  /**
   * Verifica a assinatura de um webhook
   * 
   * @param payload - Corpo da requisição (string ou Buffer)
   * @param signature - Assinatura recebida no header
   * @param secret - Secret da API key
   * @returns true se a assinatura for válida
   * 
   * @example
   * ```typescript
   * const isValid = upay.verifyWebhookSignature(
   *   requestBody,
   *   request.headers['x-upay-signature'],
   *   webhookSecret
   * );
   * ```
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    return verifyWebhookSignature(payload, signature, secret);
  }

  /**
   * Extrai a assinatura do header da requisição
   * 
   * @param headers - Headers da requisição
   * @returns A assinatura ou null se não encontrada
   */
  extractWebhookSignature(headers: Record<string, string | string[] | undefined>): string | null {
    return extractWebhookSignature(headers);
  }
}

// Exportar como default
export default UpayClient;

// Exportar tipos e utilitários
export * from './types';
export * from './utils/errors';
export { verifyWebhookSignature, extractWebhookSignature, WebhookEventType } from './utils/webhooks';
export * from './utils/validation';
