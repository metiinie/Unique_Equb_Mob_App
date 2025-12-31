export class EqubId {
  constructor(public readonly value: string) { }
  equals(other: EqubId): boolean {
    return other instanceof EqubId && this.value === other.value;
  }
}

export class MemberId {
  constructor(public readonly value: string) { }
  equals(other: MemberId): boolean {
    return other instanceof MemberId && this.value === other.value;
  }
}

export class UserId {
  constructor(public readonly value: string) { }
  equals(other: UserId): boolean {
    return other instanceof UserId && this.value === other.value;
  }
}
