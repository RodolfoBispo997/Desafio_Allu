import {
  InvestmentReview,
  InvestmentReviewStatus,
} from '../domain/investment-review';
import type { StoredFile } from '../../../shared/storage/file-storage';

export const INVESTMENT_REVIEW_REPOSITORY = Symbol(
  'INVESTMENT_REVIEW_REPOSITORY',
);
export const INVESTMENT_REVIEW_SUBMISSION_REPOSITORY = Symbol(
  'INVESTMENT_REVIEW_SUBMISSION_REPOSITORY',
);

export interface InvestmentReviewRepository {
  findById(id: string): Promise<InvestmentReview | null>;
  findByInvestmentId(investmentId: string): Promise<InvestmentReview | null>;
  findByStatus(status: InvestmentReviewStatus): Promise<InvestmentReview[]>;
  save(review: InvestmentReview): Promise<void>;
}

export interface InvestmentReviewSubmissionRepository {
  submit(
    review: InvestmentReview,
    invitationId: string,
    usedAt: Date,
    attachments: StoredFile[],
  ): Promise<void>;
}
