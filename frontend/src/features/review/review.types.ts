export interface Invitation {
  invitation: { token: string; expiresAt: string };
  investment: {
    id: string;
    customerName: string;
    productName: string;
    investedAmount: string;
    startedAt: string;
    closedAt: string | null;
    closureReason: "REACHED_MATURITY" | "REDEEMED_EARLY" | "OTHER" | null;
  };
  policy: { version: string };
}
