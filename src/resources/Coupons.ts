/**
 * Recurso de Cupons
 */

import { HttpClient } from '../utils/http';
import type {
  ValidateCouponRequest,
  CouponValidation,
} from '../types';

export class CouponsResource {
  constructor(private http: HttpClient) {}

  /**
   * Valida um cupom de desconto
   * 
   * Nota: Este endpoint é público e não requer autenticação
   * Endpoint: POST /api/coupons/validate (não /api/v1)
   */
  async validate(data: ValidateCouponRequest): Promise<CouponValidation> {
    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Código do cupom é obrigatório');
    }

    if (!data.amountCents || data.amountCents < 100) {
      throw new Error('Valor mínimo é R$ 1,00 (100 centavos)');
    }

    // Endpoint público em /api/coupons/validate (sem /v1)
    // Faz requisição sem autenticação
    if (!this.http.baseUrl) {
      throw new Error('baseUrl must be configured. Set baseUrl when creating UpayClient instance.');
    }
    const url = `${this.http.baseUrl}/api/coupons/validate`;

    // Usar fetch global ou polyfill
    const fetchFn = typeof fetch !== 'undefined' ? fetch : require('undici').fetch;
    const response = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: data.code.trim(),
        amount: data.amountCents,
        productIds: data.productIds || [],
      }),
    });

    const result: any = await response.json().catch(() => null);
    if (!result) {
      throw new Error(`HTTP ${response.status}`);
    }

    // 400 com { valid: false } é uma resposta válida (cupom inválido/não encontrado)
    if (!response.ok && result.valid === undefined) {
      throw new Error(result.message || result.error || `HTTP ${response.status}`);
    }
    
    // Normalizar resposta para o formato esperado
    return {
      valid: result.valid || false,
      discountCents: result.discountAmount || 0,
      discountPercentage: result.coupon?.discountPercentage,
      finalAmountCents: result.finalAmount || data.amountCents,
      message: result.error || result.message,
    };
  }
}
