import { Injectable } from '@nestjs/common';
import {
  InvestmentReviewStatus as PrismaInvestmentReviewStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../../../shared/application/application-error';
import { InvestmentReviewRepository } from '../application/investment-review.repository';
import {
  InvestmentReview,
  InvestmentReviewStatus,
} from '../domain/investment-review';
import { InvestmentReviewPrismaMapper } from './investment-review-prisma.mapper';
import type { StoredFile } from '../../../shared/storage/file-storage';

const investmentReviewStatusMap: Record<
  InvestmentReviewStatus,
  PrismaInvestmentReviewStatus
> = {
  [InvestmentReviewStatus.PENDING_MODERATION]:
    PrismaInvestmentReviewStatus.PENDING_MODERATION,
  [InvestmentReviewStatus.APPROVED]: PrismaInvestmentReviewStatus.APPROVED,
  [InvestmentReviewStatus.REJECTED]: PrismaInvestmentReviewStatus.REJECTED,
};

@Injectable()
export class InvestmentReviewPrismaRepository implements InvestmentReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<InvestmentReview | null> {
    const record = await this.prisma.investmentReview.findUnique({
      where: { id },
      include: { attachments: true },
    });
    return record ? InvestmentReviewPrismaMapper.toDomain(record) : null;
  }

  async findByInvestmentId(
    investmentId: string,
  ): Promise<InvestmentReview | null> {
    const record = await this.prisma.investmentReview.findUnique({
      where: { investmentId },
    });
    return record ? InvestmentReviewPrismaMapper.toDomain(record) : null;
  }

  async findByStatus(
    status: InvestmentReviewStatus,
  ): Promise<InvestmentReview[]> {
    const records = await this.prisma.investmentReview.findMany({
      where: { status: investmentReviewStatusMap[status] },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) =>
      InvestmentReviewPrismaMapper.toDomain(record),
    );
  }

  async save(review: InvestmentReview): Promise<void> {
    await this.prisma.investmentReview.update({
      where: { id: review.id },
      data: this.toPersistence(review),
    });
  }

  async submit(
    review: InvestmentReview,
    invitationId: string,
    usedAt: Date,
    attachments: StoredFile[],
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.investmentReview.create({
          data: {
            ...this.toPersistence(review),
            attachments: { create: attachments },
          },
        });
        await transaction.investmentReviewInvitation.update({
          where: { id: invitationId },
          data: { usedAt },
        });
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApplicationError(
          'An investment review already exists.',
          ApplicationErrorCode.CONFLICT,
        );
      }
      throw error;
    }
  }

  private toPersistence(review: InvestmentReview) {
    return {
      id: review.id,
      investmentId: review.investmentId,
      overallExperienceRating: review.overallExperienceRating,
      informationClarityRating: review.informationClarityRating,
      processEaseRating: review.processEaseRating,
      comment: review.comment,
      policyVersion: review.policyVersion,
      policyAcceptedAt: review.policyAcceptedAt,
      status: investmentReviewStatusMap[review.status],
      moderatedAt: review.moderatedAt,
      moderationReason: review.moderationReason,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
