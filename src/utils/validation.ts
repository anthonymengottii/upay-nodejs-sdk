/**
 * Utilitários de validação
 */

/**
 * Valida se um valor é um número positivo
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(`${fieldName} deve ser um número positivo`);
  }
}

/**
 * Valida se um valor está em centavos (inteiro)
 */
export function validateCents(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} deve ser um número inteiro positivo em centavos`);
  }
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CPF com dígitos verificadores
 */
function validateCPF(cpf: string): boolean {
  // Rejeita padrões repetidos (111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[9]) {
    return false;
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== digits[10]) {
    return false;
  }

  return true;
}

/**
 * Valida CNPJ com dígitos verificadores
 */
function validateCNPJ(cnpj: string): boolean {
  // Rejeita padrões repetidos (11.111.111/1111-11, etc)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const digits = cnpj.split('').map(Number);
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== digits[12]) {
    return false;
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== digits[13]) {
    return false;
  }

  return true;
}

/**
 * Valida formato de CPF/CNPJ com verificação de dígitos verificadores
 */
export function validateDocument(document: string): boolean {
  // Remove caracteres não numéricos
  const cleanDoc = document.replace(/\D/g, '');
  
  if (cleanDoc.length === 11) {
    return validateCPF(cleanDoc);
  } else if (cleanDoc.length === 14) {
    return validateCNPJ(cleanDoc);
  }
  
  return false;
}

/**
 * Valida formato de UUID
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida data de expiração (deve ser válida até o final do mês de expiração)
 */
export function validateExpirationDate(date: Date | string): boolean {
  let expirationYear: number;
  let expirationMonth: number;

  // Parse do input
  if (typeof date === 'string') {
    // Suporta formatos "YYYY-MM" ou "YYYY-MM-DD"
    const parts = date.split('-');
    if (parts.length < 2) {
      return false;
    }
    expirationYear = parseInt(parts[0], 10);
    expirationMonth = parseInt(parts[1], 10);
  } else if (date instanceof Date) {
    expirationYear = date.getFullYear();
    expirationMonth = date.getMonth() + 1; // getMonth() retorna 0-11
  } else {
    return false;
  }

  // Validação básica
  if (!Number.isFinite(expirationYear) || !Number.isFinite(expirationMonth)) {
    return false;
  }

  if (expirationMonth < 1 || expirationMonth > 12) {
    return false;
  }

  // Obtém ano/mês atual (timezone-agnostic usando UTC)
  const now = new Date();
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1; // getUTCMonth() retorna 0-11

  // Compara apenas ano/mês: válido se ano > atual ou (ano === atual e mês >= atual)
  return expirationYear > nowYear || 
         (expirationYear === nowYear && expirationMonth >= nowMonth);
}
