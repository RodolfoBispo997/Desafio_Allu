import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import type { InvestmentRepository } from '../../../../investments/application/investment.repository';
import type { InvestmentReviewRepository } from '../../../../investment-reviews/application/investment-review.repository';
import type { InvestmentReviewInvitationRepository } from '../../investment-review-invitation.repository';
import {
  GetInvestmentReviewInvitationInput,
  GetInvestmentReviewInvitationOutput,
} from './get-investment-review-invitation.dto';

@Injectable()
export class GetInvestmentReviewInvitationUseCase {
  constructor(
    @Inject('InvestmentReviewInvitationRepository')
    private readonly invitations: InvestmentReviewInvitationRepository,
    @Inject('InvestmentRepository')
    private readonly investments: InvestmentRepository,
    @Inject('InvestmentReviewRepository')
    private readonly reviews: InvestmentReviewRepository,
  ) {}

  async execute(
    input: GetInvestmentReviewInvitationInput,
  ): Promise<GetInvestmentReviewInvitationOutput> {
    const invitation = await this.invitations.findByToken(input.token);
    if (!invitation)
      throw new ApplicationError(
        'Review invitation not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    if (invitation.isUsed())
      throw new ApplicationError(
        'Review invitation has already been used.',
        ApplicationErrorCode.CONFLICT,
      );
    if (invitation.isExpired())
      throw new ApplicationError(
        'Review invitation has expired.',
        ApplicationErrorCode.GONE,
      );
    const investment = await this.investments.findById(invitation.investmentId);
    if (!investment)
      throw new ApplicationError(
        'Investment not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    if (!investment.isClosed())
      throw new ApplicationError(
        'Investment must be closed before it can be reviewed.',
        ApplicationErrorCode.UNPROCESSABLE,
      );
    if (await this.reviews.findByInvestmentId(investment.id))
      throw new ApplicationError(
        'An investment review already exists.',
        ApplicationErrorCode.CONFLICT,
      );
    return {
      invitation: { token: invitation.token, expiresAt: invitation.expiresAt },
      investment: {
        id: investment.id,
        customerName: investment.customerName,
        productName: investment.productName,
        investedAmount: investment.investedAmount,
        startedAt: investment.startedAt,
        closedAt: investment.closedAt,
        closureReason: investment.closureReason,
      },
      policy: { version: '1.0' },
    };
  }
}
