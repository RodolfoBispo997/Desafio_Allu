import {
  InvestmentReview,
  InvestmentReviewStatus,
} from '../domain/investment-review';
import type { StoredFile } from '../../../shared/storage/file-storage';

export interface InvestmentReviewRepository {
  findById(id: string): Promise<InvestmentReview | null>;
  findByInvestmentId(investmentId: string): Promise<InvestmentReview | null>;
  findByStatus(status: InvestmentReviewStatus): Promise<InvestmentReview[]>;
  save(review: InvestmentReview): Promise<void>;
  submit(
    review: InvestmentReview,
    invitationId: string,
    usedAt: Date,
    attachments: StoredFile[],
  ): Promise<void>;
}
