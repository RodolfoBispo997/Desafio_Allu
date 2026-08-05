import { Inject, Injectable } from '@nestjs/common';
import {
  InvestmentReview,
  InvestmentReviewStatus,
} from '../../../domain/investment-review';
import type { InvestmentReviewRepository } from '../../investment-review.repository';
import { InvestmentReviewListOutput } from './list-pending-investment-reviews.dto';

function toListOutput(review: InvestmentReview): InvestmentReviewListOutput {
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
    @Inject('InvestmentReviewRepository')
    private readonly reviews: InvestmentReviewRepository,
  ) {}

  async execute(): Promise<InvestmentReviewListOutput[]> {
    return (
      await this.reviews.findByStatus(InvestmentReviewStatus.PENDING_MODERATION)
    ).map(toListOutput);
  }
}
