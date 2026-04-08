/**
 * Classes de erro customizadas para o SDK
 */

export class UpayError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = 'UpayError';
    this.code = code;
    this.status = status;
    this.details = details;
    
    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UpayError);
    }
  }
}

export class UpayAuthenticationError extends UpayError {
  constructor(message: string = 'Falha na autenticação. Verifique sua API key.') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'UpayAuthenticationError';
  }
}

export class UpayValidationError extends UpayError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'UpayValidationError';
  }
}

export class UpayNotFoundError extends UpayError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} com ID ${id} não encontrado.` : `${resource} não encontrado.`,
      'NOT_FOUND',
      404
    );
    this.name = 'UpayNotFoundError';
  }
}

export class UpayRateLimitError extends UpayError {
  constructor(message: string = 'Limite de requisições excedido. Tente novamente mais tarde.') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'UpayRateLimitError';
  }
}

export class UpayServerError extends UpayError {
  constructor(message: string = 'Erro interno do servidor. Tente novamente mais tarde.') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'UpayServerError';
  }
}

/**
 * Converte erros HTTP em erros do SDK
 */
export function handleApiError(response: Response, body?: any): UpayError {
  const status = response.status;
  const message = body?.message || `HTTP ${status}: ${response.statusText}`;
  const code = body?.code;

  switch (status) {
    case 401:
      return new UpayAuthenticationError(message);
    case 400:
      return new UpayValidationError(message, body?.details);
    case 404:
      return new UpayNotFoundError('Recurso', body?.id);
    case 429:
      return new UpayRateLimitError(message);
    case 500:
    case 502:
    case 503:
      return new UpayServerError(message);
    default:
      return new UpayError(message, code, status, body);
  }
}
