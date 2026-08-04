export enum InvestmentStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum InvestmentClosureReason {
  REACHED_MATURITY = 'REACHED_MATURITY',
  REDEEMED_EARLY = 'REDEEMED_EARLY',
  OTHER = 'OTHER',
}

export interface InvestmentProperties {
  id: string;
  customerName: string;
  productName: string;
  investedAmount: string;
  startedAt: Date;
  closedAt: Date | null;
  status: InvestmentStatus;
  closureReason: InvestmentClosureReason | null;
}

export class Investment {
  constructor(private readonly properties: InvestmentProperties) {}

  get id(): string {
    return this.properties.id;
  }
  get customerName(): string {
    return this.properties.customerName;
  }
  get productName(): string {
    return this.properties.productName;
  }
  get investedAmount(): string {
    return this.properties.investedAmount;
  }
  get startedAt(): Date {
    return this.properties.startedAt;
  }
  get closedAt(): Date | null {
    return this.properties.closedAt;
  }
  get status(): InvestmentStatus {
    return this.properties.status;
  }
  get closureReason(): InvestmentClosureReason | null {
    return this.properties.closureReason;
  }

  isClosed(): boolean {
    return this.status === InvestmentStatus.CLOSED;
  }
}
