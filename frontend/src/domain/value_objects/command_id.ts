/**
 * CommandId: Unique identifier for a command execution.
 * 
 * Used to enforce idempotency: same commandId must not be applied twice.
 * 
 * This is a domain value object, not a feature. It enforces integrity.
 */
export class CommandId {
  constructor(public readonly value: string) { }

  equals(other: any): boolean {
    if (this === other) return true;
    if (!(other instanceof CommandId)) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
