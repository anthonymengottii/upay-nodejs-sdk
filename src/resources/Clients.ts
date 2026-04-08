/**
 * Recurso de Clientes
 */

import { HttpClient } from '../utils/http';
import type {
  CreateClientRequest,
  Client,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class ClientsResource {
  constructor(private http: HttpClient) {}

  /**
   * Cria um novo cliente
   */
  async create(data: CreateClientRequest): Promise<Client> {
    // Validação básica
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome do cliente é obrigatório');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    return this.http.post<Client>('/clients', data);
  }

  /**
   * Lista clientes
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Client>> {
    return this.http.get<PaginatedResponse<Client>>('/clients', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
    });
  }

  /**
   * Obtém um cliente por ID
   */
  async get(id: string): Promise<Client> {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }
    return this.http.get<Client>(`/clients/${id}`);
  }

  /**
   * Atualiza um cliente
   */
  async update(id: string, data: Partial<CreateClientRequest>): Promise<Client> {
    if (!id || id.trim().length === 0) {
      throw new Error('ID é obrigatório');
    }

    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      throw new Error('Nome do cliente é obrigatório');
    }

    if (data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0 || !this.isValidEmail(data.email)) {
        throw new Error('Email inválido');
      }
    }

    return this.http.patch<Client>(`/clients/${id}`, data);
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
