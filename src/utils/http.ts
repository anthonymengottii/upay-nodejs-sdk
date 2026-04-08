/**
 * Cliente HTTP base para requisições
 */

import { handleApiError } from './errors';
import type { UpayConfig } from '../types';

// Polyfill para fetch no Node.js < 18
let fetchImpl: typeof fetch;
if (typeof fetch === 'undefined') {
  // Node.js < 18 - usar undici
  try {
    const undici = require('undici');
    const { fetch: undiciFetch, Agent } = undici;
    // Configurar agente com verificação TLS sempre habilitada
    const agent = new Agent({
      connect: {
        rejectUnauthorized: true
      }
    });
    fetchImpl = ((url: any, options: any) => {
      return undiciFetch(url, {
        ...options,
        dispatcher: agent
      });
    }) as typeof fetch;
  } catch {
    throw new Error(
      'fetch não está disponível. Instale undici: npm install undici\n' +
      'Ou use Node.js 18+ que tem fetch nativo.'
    );
  }
} else {
  fetchImpl = fetch;
}

export interface RequestOptions {
  method: string;
  endpoint: string;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export class HttpClient {
  private apiKey: string;
  public readonly baseUrl: string;
  private version: string;
  private defaultTimeout: number;

  constructor(config: UpayConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://upay-sistema-api.onrender.com';
    this.version = config.version || 'v1';
    this.defaultTimeout = config.timeout || 30000; // 30 segundos
  }

  /**
   * Faz uma requisição HTTP
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const {
      method,
      endpoint,
      data,
      params,
      timeout = this.defaultTimeout,
    } = options;

    // Constrói a URL
    let url = `${this.baseUrl}/api/${this.version}${endpoint}`;
    
    // Adiciona query params
    if (params) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      const query = queryString.toString();
      if (query) {
        url += `?${query}`;
      }
    }

    // Prepara headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Upay-JS-SDK/1.0.0',
    };

    // Prepara opções da requisição
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Adiciona body se necessário
    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      // Converte datas para ISO string
      const processedData = this.processData(data);
      fetchOptions.body = JSON.stringify(processedData);
    }

    // Timeout usando AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetchImpl(url, fetchOptions);
      clearTimeout(timeoutId);

      // Tenta parsear o body
      let body: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          body = await response.json();
        } catch {
          body = {};
        }
      } else {
        body = await response.text();
      }

      // Se não for sucesso, lança erro
      if (!response.ok) {
        throw handleApiError(response, body);
      }

      // Desempacota o envelope padrão: { success: true, data: X, pagination?: Y }
      if (body && typeof body === 'object' && body.success === true && 'data' in body) {
        if (body.pagination !== undefined) {
          return { data: body.data, pagination: body.pagination } as T;
        }
        if (body.meta !== undefined) {
          return { data: body.data, meta: body.meta } as T;
        }
        return body.data as T;
      }

      return body as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Se for abortado por timeout
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout após ${timeout}ms`);
      }

      // Se já for um erro do SDK, re-lança
      if (error.name?.startsWith('Upay')) {
        throw error;
      }

      // Erro de rede ou outro - incluir mais detalhes
      const errorMessage = error.message || 'Erro desconhecido';
      const errorDetails = error.cause ? ` (causa: ${error.cause})` : '';
      throw new Error(`Erro na requisição: ${errorMessage}${errorDetails}. URL: ${url}`);
    }
  }

  /**
   * Processa dados antes de enviar (converte datas, etc)
   */
  private processData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.processData(item));
    }

    if (typeof data === 'object') {
      const processed: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'expiresAt' && value instanceof Date) {
          processed[key] = value.toISOString();
        } else {
          processed[key] = this.processData(value);
        }
      }
      return processed;
    }

    return data;
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      endpoint,
      params,
    });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      endpoint,
      data,
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      endpoint,
      data,
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      endpoint,
      data,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      endpoint,
    });
  }
}
