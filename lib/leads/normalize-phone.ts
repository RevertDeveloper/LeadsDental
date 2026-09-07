/**
 * Produces a stable comparison key for Spanish phone numbers.
 * Display formatting is deliberately kept in the lead record.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0034") && digits.length === 13) {
    return digits.slice(4);
  }

  if (digits.startsWith("34") && digits.length === 11) {
    return digits.slice(2);
  }

  return digits;
}
