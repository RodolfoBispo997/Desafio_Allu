import { Module } from '@nestjs/common';
import { InvestmentReviewsModule } from '../investment-reviews/investment-reviews.module';
import { InvestmentsModule } from '../investments/investments.module';
import { INVESTMENT_REVIEW_INVITATION_REPOSITORY } from './application/investment-review-invitation.repository';
import {
  GetInvestmentReviewInvitationUseCase,
  SubmitInvestmentReviewUseCase,
} from './application/review-invitation.use-cases';
import { InvestmentReviewInvitationPrismaRepository } from './infrastructure/investment-review-invitation-prisma.repository';
import { ReviewInvitationsController } from './presentation/review-invitations.controller';

@Module({
  imports: [InvestmentsModule, InvestmentReviewsModule],
  controllers: [ReviewInvitationsController],
  providers: [
    {
      provide: INVESTMENT_REVIEW_INVITATION_REPOSITORY,
      useClass: InvestmentReviewInvitationPrismaRepository,
    },
    GetInvestmentReviewInvitationUseCase,
    SubmitInvestmentReviewUseCase,
  ],
})
export class ReviewInvitationsModule {}
