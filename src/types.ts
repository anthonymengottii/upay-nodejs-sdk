/**
 * Tipos TypeScript para o SDK Upay
 */

export interface UpayConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
  timeout?: number;
}

export interface PaymentLinkSettings {
  pixEnabled?: boolean;
  boletoEnabled?: boolean;
  creditCardEnabled?: boolean;
  maxInstallments?: number;
  interestFreeInstallments?: number;
  interestRate?: number;
  requirePhone?: boolean;
  requireAddress?: boolean;
}

interface BaseCreatePaymentLinkRequest {
  title: string;
  description?: string;
  currency?: string;
  expiresAt?: Date | string;
  redirectUrl?: string;
  settings?: PaymentLinkSettings;
  status?: 'ACTIVE' | 'INACTIVE';
  metaPixelCode?: string;
  stockQuantity?: number;
  stockEnabled?: boolean;
}

export interface CreatePaymentLinkWithAmountRequest extends BaseCreatePaymentLinkRequest {
  /** Valor em centavos inteiros (ex: 10000 = R$ 100,00) */
  amount: number;
  products?: never;
}

export interface CreatePaymentLinkWithProductsRequest extends BaseCreatePaymentLinkRequest {
  amount?: number;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
}

export type CreatePaymentLinkRequest =
  | CreatePaymentLinkWithAmountRequest
  | CreatePaymentLinkWithProductsRequest;

export interface UpdatePaymentLinkRequest {
  title?: string;
  description?: string;
  /** Valor em centavos inteiros (ex: 10000 = R$ 100,00) */
  amount?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  expiresAt?: Date | string;
  redirectUrl?: string;
  settings?: PaymentLinkSettings;
}

export interface PaymentLink {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Valor em centavos inteiros (ex: 10000 = R$ 100,00) */
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE';
  expiresAt?: string;
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
  settings?: PaymentLinkSettings;
  products?: Array<{
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

export interface CreateTransactionRequest {
  product: string;
  amountCents: number;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  clientId?: string;
  client?: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  paymentLinkId?: string;
  metadata?: Record<string, any>;
  couponCode?: string;
}

export interface Transaction {
  id: string;
  displayId?: string;
  product: string;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  client?: {
    id: string;
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  paymentLink?: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  boletoBarcode?: string;
  boletoUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  stockEnabled?: boolean;
  imageUrl?: string;
  sku?: string;
  category?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  stockEnabled?: boolean;
  imageUrl?: string;
  sku?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponRequest {
  code: string;
  amountCents: number;
  paymentLinkId?: string;
  productIds?: string[]; // Product IDs to resolve coupon ambiguity
}

export interface CouponValidation {
  valid: boolean;
  discountCents?: number;
  discountPercentage?: number;
  finalAmountCents?: number;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    cursor?: string;
    nextCursor?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  document?: string;
  phone?: string;
}
