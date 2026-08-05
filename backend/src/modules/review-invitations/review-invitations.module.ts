import { Module } from '@nestjs/common';
import { InvestmentReviewsModule } from '../investment-reviews/investment-reviews.module';
import { InvestmentsModule } from '../investments/investments.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { GetInvestmentReviewInvitationUseCase } from './application/use-cases/get-investment-review-invitation/get-investment-review-invitation.use-case';
import { SubmitInvestmentReviewUseCase } from './application/use-cases/submit-investment-review/submit-investment-review.use-case';
import { InvestmentReviewInvitationPrismaRepository } from './infrastructure/investment-review-invitation-prisma.repository';
import { ReviewInvitationsController } from './presentation/review-invitations.controller';

@Module({
  imports: [InvestmentsModule, InvestmentReviewsModule, StorageModule],
  controllers: [ReviewInvitationsController],
  providers: [
    {
      provide: 'InvestmentReviewInvitationRepository',
      useClass: InvestmentReviewInvitationPrismaRepository,
    },
    GetInvestmentReviewInvitationUseCase,
    SubmitInvestmentReviewUseCase,
  ],
})
export class ReviewInvitationsModule {}
