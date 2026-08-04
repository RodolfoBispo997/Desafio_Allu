import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../shared/application/application-error';
import { INVESTMENT_REPOSITORY } from '../../investments/application/investment.repository';
import type { InvestmentRepository } from '../../investments/application/investment.repository';
import {
  INVESTMENT_REVIEW_REPOSITORY,
  INVESTMENT_REVIEW_SUBMISSION_REPOSITORY,
} from '../../investment-reviews/application/investment-review.repository';
import type {
  InvestmentReviewRepository,
  InvestmentReviewSubmissionRepository,
} from '../../investment-reviews/application/investment-review.repository';
import {
  InvestmentReview,
  InvestmentReviewDomainError,
} from '../../investment-reviews/domain/investment-review';
import { INVESTMENT_REVIEW_INVITATION_REPOSITORY } from './investment-review-invitation.repository';
import type { InvestmentReviewInvitationRepository } from './investment-review-invitation.repository';

export interface GetInvestmentReviewInvitationOutput {
  invitation: { token: string; expiresAt: Date };
  investment: {
    id: string;
    customerName: string;
    productName: string;
    investedAmount: string;
    startedAt: Date;
    closedAt: Date | null;
    closureReason: string | null;
  };
  policy: { version: '1.0' };
}

export interface SubmitInvestmentReviewInput {
  token: string;
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyAccepted: boolean;
}

@Injectable()
export class GetInvestmentReviewInvitationUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_INVITATION_REPOSITORY)
    private readonly invitations: InvestmentReviewInvitationRepository,
    @Inject(INVESTMENT_REPOSITORY)
    private readonly investments: InvestmentRepository,
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
  ) {}
  async execute(token: string): Promise<GetInvestmentReviewInvitationOutput> {
    const invitation = await this.invitations.findByToken(token);
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

@Injectable()
export class SubmitInvestmentReviewUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_INVITATION_REPOSITORY)
    private readonly invitations: InvestmentReviewInvitationRepository,
    @Inject(INVESTMENT_REPOSITORY)
    private readonly investments: InvestmentRepository,
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
    @Inject(INVESTMENT_REVIEW_SUBMISSION_REPOSITORY)
    private readonly submission: InvestmentReviewSubmissionRepository,
  ) {}
  async execute(input: SubmitInvestmentReviewInput): Promise<{ id: string }> {
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
    if (!input.policyAccepted)
      throw new ApplicationError(
        'Policy acceptance is required.',
        ApplicationErrorCode.UNPROCESSABLE,
      );
    let review: InvestmentReview;
    try {
      review = InvestmentReview.create({
        investmentId: investment.id,
        overallExperienceRating: input.overallExperienceRating,
        informationClarityRating: input.informationClarityRating,
        processEaseRating: input.processEaseRating,
        comment: input.comment,
        policyVersion: '1.0',
        policyAcceptedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof InvestmentReviewDomainError)
        throw new ApplicationError(
          error.message,
          ApplicationErrorCode.UNPROCESSABLE,
        );
      throw error;
    }
    invitation.markAsUsed();
    await this.submission.submit(
      review,
      invitation.id,
      invitation.usedAt as Date,
    );
    return { id: review.id };
  }
}
