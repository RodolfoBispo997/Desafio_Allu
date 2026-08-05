import { Inject, Injectable } from '@nestjs/common';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../../../shared/application/application-error';
import {
  InvestmentReviewDomainError,
  InvestmentReviewStatus,
} from '../../../domain/investment-review';
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
    try {
      review.reject(input.reason);
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
