import { InvestmentReviewInvitation } from '../domain/investment-review-invitation';

export interface InvestmentReviewInvitationRepository {
  findByToken(token: string): Promise<InvestmentReviewInvitation | null>;
}
