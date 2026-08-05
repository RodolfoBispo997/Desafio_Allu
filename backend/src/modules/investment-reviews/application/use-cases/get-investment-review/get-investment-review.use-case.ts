import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import { InvestmentReview } from '../../../domain/investment-review';
import type { InvestmentReviewRepository } from '../../investment-review.repository';
import {
  GetInvestmentReviewInput,
  GetInvestmentReviewOutput,
} from './get-investment-review.dto';

function toOutput(review: InvestmentReview): GetInvestmentReviewOutput {
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
    attachments: review.attachments.map(
      ({ id, originalFileName, mimeType, fileSize, createdAt }) => ({
        id,
        originalFileName,
        mimeType,
        fileSize,
        createdAt,
      }),
    ),
  };
}

@Injectable()
export class GetInvestmentReviewUseCase {
  constructor(
    @Inject('InvestmentReviewRepository')
    private readonly reviews: InvestmentReviewRepository,
  ) {}

  async execute(
    input: GetInvestmentReviewInput,
  ): Promise<GetInvestmentReviewOutput> {
    const review = await this.reviews.findById(input.id);
    if (!review)
      throw new ApplicationError(
        'Investment review not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    return toOutput(review);
  }
}
