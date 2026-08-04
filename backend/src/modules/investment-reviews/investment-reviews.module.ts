import { Module } from '@nestjs/common';
import {
  INVESTMENT_REVIEW_REPOSITORY,
  INVESTMENT_REVIEW_SUBMISSION_REPOSITORY,
} from './application/investment-review.repository';
import {
  ApproveInvestmentReviewUseCase,
  GetInvestmentReviewUseCase,
  ListPendingInvestmentReviewsUseCase,
  RejectInvestmentReviewUseCase,
} from './application/moderation.use-cases';
import { InvestmentReviewPrismaRepository } from './infrastructure/investment-review-prisma.repository';
import { InvestmentReviewsController } from './presentation/investment-reviews.controller';

@Module({
  controllers: [InvestmentReviewsController],
  providers: [
    InvestmentReviewPrismaRepository,
    {
      provide: INVESTMENT_REVIEW_REPOSITORY,
      useExisting: InvestmentReviewPrismaRepository,
    },
    {
      provide: INVESTMENT_REVIEW_SUBMISSION_REPOSITORY,
      useExisting: InvestmentReviewPrismaRepository,
    },
    ListPendingInvestmentReviewsUseCase,
    GetInvestmentReviewUseCase,
    ApproveInvestmentReviewUseCase,
    RejectInvestmentReviewUseCase,
  ],
  exports: [
    INVESTMENT_REVIEW_REPOSITORY,
    INVESTMENT_REVIEW_SUBMISSION_REPOSITORY,
  ],
})
export class InvestmentReviewsModule {}
