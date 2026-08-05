import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import { InvestmentReviewDomainError } from '../../../domain/investment-review';
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
