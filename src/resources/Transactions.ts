/**
 * Recurso de Transações
 */

import { HttpClient } from '../utils/http';
import type {
  CreateTransactionRequest,
  Transaction,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class TransactionsResource {
  constructor(private http: HttpClient) {}

  /**
   * Cria uma nova transação
   */
  async create(data: CreateTransactionRequest): Promise<Transaction> {
    // Validação básica
    if (!data.product || data.product.trim().length === 0) {
      throw new Error('Produto é obrigatório');
    }

    if (!data.amountCents || data.amountCents < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }

    if (data.client && !data.client.email) {
      throw new Error('Email do cliente é obrigatório');
    }

    return this.http.post<Transaction>('/transactions', data);
  }

  /**
   * Lista transações
   */
  async list(params?: PaginationParams & {
    status?: string;
    paymentMethod?: string;
    clientId?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.http.get<any>('/transactions', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
      status: params?.status,
      method: params?.paymentMethod,
      clientId: params?.clientId,
    });
    
    // Mapear resposta da API: { message, transactions, pagination } -> { data, pagination }
    return {
      data: response.transactions || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 }
    };
  }

  /**
   * Obtém uma transação por ID
   */
  async get(id: string): Promise<Transaction> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.get<Transaction>(`/transactions/${id}`);
  }

  /**
   * Processa o pagamento de uma transação
   */
  async process(id: string, paymentData?: {
    cardData?: any;
    installments?: number;
  }): Promise<Transaction> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.post<Transaction>(`/transactions/${id}/process`, paymentData);
  }

  /**
   * Captura uma transação autorizada (Pagar.me)
   */
  async capture(id: string): Promise<Transaction> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.post<Transaction>(`/transactions/${id}/capture`);
  }

  /**
   * Cancela uma transação pendente
   */
  async cancel(id: string): Promise<Transaction> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.post<Transaction>(`/transactions/${id}/cancel`);
  }

  /**
   * Estorna uma transação paga
   */
  async refund(id: string, amountCents?: number): Promise<Transaction> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    
    // Validar amountCents se fornecido
    if (amountCents !== undefined) {
      if (typeof amountCents !== 'number' || 
          !Number.isInteger(amountCents) || 
          amountCents <= 0 || 
          !Number.isFinite(amountCents)) {
        throw new Error('amountCents must be a positive integer');
      }
    }
    
    return this.http.post<Transaction>(`/transactions/${id}/refund`, {
      amountCents,
    });
  }
}
