function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function hasAllDigitsEqual(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function calcCheckDigit(base: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || hasAllDigitsEqual(digits)) return false;

  const weights1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calcCheckDigit(digits.slice(0, 9), weights1);
  if (digit1 !== Number(digits[9])) return false;

  const weights2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calcCheckDigit(digits.slice(0, 10), weights2);
  return digit2 === Number(digits[10]);
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || hasAllDigitsEqual(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calcCheckDigit(digits.slice(0, 12), weights1);
  if (digit1 !== Number(digits[12])) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calcCheckDigit(digits.slice(0, 13), weights2);
  return digit2 === Number(digits[13]);
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}
