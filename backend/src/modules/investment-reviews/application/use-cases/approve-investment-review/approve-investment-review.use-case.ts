import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import { InvestmentReviewStatus } from '../../../domain/investment-review';
import type { InvestmentReviewRepository } from '../../investment-review.repository';
import { ApproveInvestmentReviewInput } from './approve-investment-review.dto';

@Injectable()
export class ApproveInvestmentReviewUseCase {
  constructor(
    @Inject('InvestmentReviewRepository')
    private readonly reviews: InvestmentReviewRepository,
  ) {}

  async execute(input: ApproveInvestmentReviewInput): Promise<void> {
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
    review.approve();
    await this.reviews.save(review);
  }
}
