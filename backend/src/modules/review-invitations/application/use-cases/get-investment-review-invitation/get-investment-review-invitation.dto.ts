export interface GetInvestmentReviewInvitationInput {
  token: string;
}

export interface GetInvestmentReviewInvitationOutput {
  invitation: { token: string; expiresAt: Date };
  investment: {
    id: string;
    customerName: string;
    productName: string;
    investedAmount: string;
    startedAt: Date;
    closedAt: Date | null;
    closureReason: string | null;
  };
  policy: { version: '1.0' };
}
