export interface InvestmentReviewInvitationProperties {
  id: string;
  investmentId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export class InvestmentReviewInvitation {
  constructor(
    private readonly properties: InvestmentReviewInvitationProperties,
  ) {}
  get id(): string {
    return this.properties.id;
  }
  get investmentId(): string {
    return this.properties.investmentId;
  }
  get token(): string {
    return this.properties.token;
  }
  get expiresAt(): Date {
    return this.properties.expiresAt;
  }
  get usedAt(): Date | null {
    return this.properties.usedAt;
  }
  isExpired(referenceDate = new Date()): boolean {
    return this.expiresAt <= referenceDate;
  }
  isUsed(): boolean {
    return this.usedAt !== null;
  }
  isAvailable(referenceDate = new Date()): boolean {
    return !this.isUsed() && !this.isExpired(referenceDate);
  }
  markAsUsed(date = new Date()): void {
    this.properties.usedAt = date;
  }
}
