/**
 * Ethiopian phone number (+251) value object.
 *
 * This does not enforce full validation rules yet – backend will be the
 * ultimate authority. The goal is to keep UI and domain aligned on format.
 */
export class PhoneNumberEt {
  public readonly full: string; // e.g. +2519XXXXXXXX

  constructor(full: string) {
    // Basic normalization for Ethiopian mobile numbers
    let normalized = full.replace(/[^\d+]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '+251' + normalized.substring(1);
    } else if (normalized.startsWith('9') && normalized.length === 9) {
      normalized = '+251' + normalized;
    } else if (normalized.startsWith('251') && !normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    this.full = normalized;
  }

  equals(other: PhoneNumberEt): boolean {
    return other instanceof PhoneNumberEt && this.full === other.full;
  }
}
