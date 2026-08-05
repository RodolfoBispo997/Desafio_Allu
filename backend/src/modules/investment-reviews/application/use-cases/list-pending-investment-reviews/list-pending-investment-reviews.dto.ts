import { InvestmentReviewStatus } from '../../../domain/investment-review';

export interface InvestmentReviewListOutput {
  id: string;
  investmentId: string;
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyVersion: string;
  policyAcceptedAt: Date;
  status: InvestmentReviewStatus;
  moderatedAt: Date | null;
  moderationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
