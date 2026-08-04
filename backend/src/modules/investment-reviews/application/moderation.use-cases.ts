import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../shared/application/application-error';
import {
  InvestmentReview,
  InvestmentReviewDomainError,
  InvestmentReviewStatus,
} from '../domain/investment-review';
import { INVESTMENT_REVIEW_REPOSITORY } from './investment-review.repository';
import type { InvestmentReviewRepository } from './investment-review.repository';

export interface InvestmentReviewOutput {
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

function toOutput(review: InvestmentReview): InvestmentReviewOutput {
  return {
    id: review.id,
    investmentId: review.investmentId,
    overallExperienceRating: review.overallExperienceRating,
    informationClarityRating: review.informationClarityRating,
    processEaseRating: review.processEaseRating,
    comment: review.comment,
    policyVersion: review.policyVersion,
    policyAcceptedAt: review.policyAcceptedAt,
    status: review.status,
    moderatedAt: review.moderatedAt,
    moderationReason: review.moderationReason,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

@Injectable()
export class ListPendingInvestmentReviewsUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
  ) {}
  async execute(): Promise<InvestmentReviewOutput[]> {
    return (
      await this.reviews.findByStatus(InvestmentReviewStatus.PENDING_MODERATION)
    ).map(toOutput);
  }
}

@Injectable()
export class GetInvestmentReviewUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
  ) {}
  async execute(id: string): Promise<InvestmentReviewOutput> {
    const review = await this.reviews.findById(id);
    if (!review)
      throw new ApplicationError(
        'Investment review not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    return toOutput(review);
  }
}

@Injectable()
export class ApproveInvestmentReviewUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
  ) {}
  async execute(id: string): Promise<void> {
    const review = await this.reviews.findById(id);
    if (!review)
      throw new ApplicationError(
        'Investment review not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    try {
      review.approve();
    } catch (error) {
      if (error instanceof InvestmentReviewDomainError)
        throw new ApplicationError(
          error.message,
          ApplicationErrorCode.CONFLICT,
        );
      throw error;
    }
    await this.reviews.save(review);
  }
}

@Injectable()
export class RejectInvestmentReviewUseCase {
  constructor(
    @Inject(INVESTMENT_REVIEW_REPOSITORY)
    private readonly reviews: InvestmentReviewRepository,
  ) {}
  async execute(id: string, reason: string): Promise<void> {
    const review = await this.reviews.findById(id);
    if (!review)
      throw new ApplicationError(
        'Investment review not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    try {
      review.reject(reason);
    } catch (error) {
      if (error instanceof InvestmentReviewDomainError) {
        const code =
          review.status === InvestmentReviewStatus.PENDING_MODERATION
            ? ApplicationErrorCode.UNPROCESSABLE
            : ApplicationErrorCode.CONFLICT;
        throw new ApplicationError(error.message, code);
      }
      throw error;
    }
    await this.reviews.save(review);
  }
}
