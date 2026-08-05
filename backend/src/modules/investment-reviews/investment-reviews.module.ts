import { Module } from '@nestjs/common';
import { ApproveInvestmentReviewUseCase } from './application/use-cases/approve-investment-review/approve-investment-review.use-case';
import { GetInvestmentReviewUseCase } from './application/use-cases/get-investment-review/get-investment-review.use-case';
import { ListPendingInvestmentReviewsUseCase } from './application/use-cases/list-pending-investment-reviews/list-pending-investment-reviews.use-case';
import { RejectInvestmentReviewUseCase } from './application/use-cases/reject-investment-review/reject-investment-review.use-case';
import { InvestmentReviewPrismaRepository } from './infrastructure/investment-review-prisma.repository';
import { InvestmentReviewsController } from './presentation/investment-reviews.controller';

@Module({
  controllers: [InvestmentReviewsController],
  providers: [
    {
      provide: 'InvestmentReviewRepository',
      useClass: InvestmentReviewPrismaRepository,
    },
    ListPendingInvestmentReviewsUseCase,
    GetInvestmentReviewUseCase,
    ApproveInvestmentReviewUseCase,
    RejectInvestmentReviewUseCase,
  ],
  exports: ['InvestmentReviewRepository'],
})
export class InvestmentReviewsModule {}
