import { InvestmentReviewInvitation } from '../domain/investment-review-invitation';

export const INVESTMENT_REVIEW_INVITATION_REPOSITORY = Symbol(
  'INVESTMENT_REVIEW_INVITATION_REPOSITORY',
);

export interface InvestmentReviewInvitationRepository {
  findByToken(token: string): Promise<InvestmentReviewInvitation | null>;
}
