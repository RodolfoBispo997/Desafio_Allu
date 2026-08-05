import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import { InvestmentReviewStatus } from '../../../domain/investment-review';
import type { InvestmentReviewRepository } from '../../investment-review.repository';
import { RejectInvestmentReviewInput } from './reject-investment-review.dto';

@Injectable()
export class RejectInvestmentReviewUseCase {
  constructor(
    @Inject('InvestmentReviewRepository')
    private readonly reviews: InvestmentReviewRepository,
  ) {}

  async execute(input: RejectInvestmentReviewInput): Promise<void> {
    const review = await this.reviews.findById(input.id);
    if (!review)
      throw new ApplicationError(
        'Investment review not found.',
        ApplicationErrorCode.NOT_FOUND,
      );
    if (review.status !== InvestmentReviewStatus.PENDING_MODERATION)
      throw new ApplicationError(
        'Only pending reviews can be moderated.',
        ApplicationErrorCode.CONFLICT,
      );
    if (!input.reason.trim())
      throw new ApplicationError(
        'Moderation reason is required.',
        ApplicationErrorCode.UNPROCESSABLE,
      );
    review.reject(input.reason);
    await this.reviews.save(review);
  }
}
