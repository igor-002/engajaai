export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function isValidCpf(cpf: string): boolean {
  return /^\d{11}$/.test(normalizeCpf(cpf));
}

export function normalizeCellphone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  if (phone.startsWith("+")) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return `+${digits}`;
  return `+${digits}`;
}

export function isValidCellphone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}
