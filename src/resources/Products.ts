/**
 * Recurso de Produtos
 */

import { HttpClient } from '../utils/http';
import type {
  CreateProductRequest,
  Product,
  PaginationParams,
  PaginatedResponse,
} from '../types';

export class ProductsResource {
  constructor(private http: HttpClient) {}

  /**
   * Cria um novo produto
   */
  async create(data: CreateProductRequest): Promise<Product> {
    // Validação básica
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome do produto é obrigatório');
    }

    if (data.price == null) {
      throw new Error('Preço do produto é obrigatório');
    }

    if (data.price < 100) {
      throw new Error('Preço mínimo é R$ 1,00 (100 centavos)');
    }

    return this.http.post<Product>('/products', data);
  }

  /**
   * Lista produtos
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const response = await this.http.get<any>('/products', {
      page: params?.page,
      limit: params?.limit,
      cursor: params?.cursor,
      orderBy: params?.orderBy,
      orderDirection: params?.orderDirection,
    });
    
    // Mapear resposta da API: { message, products, pagination } -> { data, pagination }
    return {
      data: response.products || response.data || [],
      pagination: response.pagination || { total: 0, page: 1, limit: 10 }
    };
  }

  /**
   * Obtém um produto por ID
   */
  async get(id: string): Promise<Product> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    return this.http.get<Product>(`/products/${id}`);
  }

  /**
   * Atualiza um produto
   */
  async update(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }

    if (data.price != null) {
      if (typeof data.price !== 'number' || !Number.isFinite(data.price)) {
        throw new Error('Preço deve ser um número válido');
      }
      if (data.price < 100) {
        throw new Error('Preço mínimo é R$ 1,00 (100 centavos)');
      }
    }

    return this.http.patch<Product>(`/products/${id}`, data);
  }

  /**
   * Deleta um produto
   */
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID é obrigatório');
    }
    await this.http.delete(`/products/${id}`);
  }
}
