/**
 * Recurso de Payment Links
 */

import { HttpClient } from '../utils/http';
import type {
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  PaymentLink,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class PaymentLinksResource {
  constructor(private http: HttpClient) {}

  /**
   * Cria um novo link de pagamento
   */
  async create(data: CreatePaymentLinkRequest): Promise<PaymentLink> {
    // Validação básica
    const title = (data.title || '').trim();
    if (title.length < 3) {
      throw new Error('Título deve ter pelo menos 3 caracteres');
    }

    if (!data.amount && (!data.products || data.products.length === 0)) {
      throw new Error('É necessário fornecer amount ou products');
    }

    if (data.amount && data.amount < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }

    return this.http.post<PaymentLink>('/payment-links', {
      title: title,
      description: data.description,
      amount: data.amount,
      products: data.products,
      currency: data.currency || 'BRL',
      expiresAt: data.expiresAt,
      redirectUrl: data.redirectUrl,
      settings: data.settings,
      status: data.status || 'ACTIVE',
      metaPixelCode: data.metaPixelCode,
      stockQuantity: data.stockQuantity,
      stockEnabled: data.stockEnabled,
    });
  }

  /**
   * Lista links de pagamento
   */
  async list(params?: PaginationParams & { status?: string }): Promise<PaginatedResponse<PaymentLink>> {
    return this.http.get<PaginatedResponse<PaymentLink>>('/payment-links', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
      status: params?.status,
    });
  }

  /**
   * Obtém um link de pagamento por ID
   */
  async get(id: string): Promise<PaymentLink> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.get<PaymentLink>(`/payment-links/${id}`);
  }

  /**
   * Obtém um link de pagamento por slug
   */
  async getBySlug(slug: string): Promise<PaymentLink> {
    if (!slug) {
      throw new Error('Slug é obrigatório');
    }
    return this.http.get<PaymentLink>(`/payment-links/slug/${slug}`);
  }

  /**
   * Atualiza um link de pagamento
   */
  async update(id: string, data: UpdatePaymentLinkRequest): Promise<PaymentLink> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.redirectUrl !== undefined) updateData.redirectUrl = data.redirectUrl;
    if (data.settings !== undefined) updateData.settings = data.settings;

    return this.http.patch<PaymentLink>(`/payment-links/${id}`, updateData);
  }

  /**
   * Deleta um link de pagamento
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    await this.http.delete(`/payment-links/${id}`);
  }

  /**
   * Obtém a URL pública do checkout
   */
  getCheckoutUrl(slug: string, baseUrl?: string): string {
    const checkoutBase = baseUrl || 'https://checkout.upaybr.com';
    return `${checkoutBase}/${slug}`;
  }
}
