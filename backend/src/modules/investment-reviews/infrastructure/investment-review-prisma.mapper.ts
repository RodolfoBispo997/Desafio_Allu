import {
  InvestmentReview as PrismaInvestmentReview,
  InvestmentReviewStatus as PrismaInvestmentReviewStatus,
} from '@prisma/client';
import {
  InvestmentReview,
  InvestmentReviewStatus,
} from '../domain/investment-review';

const reviewStatusMap: Record<
  PrismaInvestmentReviewStatus,
  InvestmentReviewStatus
> = {
  PENDING_MODERATION: InvestmentReviewStatus.PENDING_MODERATION,
  APPROVED: InvestmentReviewStatus.APPROVED,
  REJECTED: InvestmentReviewStatus.REJECTED,
};

export class InvestmentReviewPrismaMapper {
  static toDomain(record: PrismaInvestmentReview): InvestmentReview {
    return InvestmentReview.restore({
      ...record,
      status: reviewStatusMap[record.status],
    });
  }
}
