import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { InvestmentReviewInvitationRepository } from '../application/investment-review-invitation.repository';
import { InvestmentReviewInvitation } from '../domain/investment-review-invitation';

@Injectable()
export class InvestmentReviewInvitationPrismaRepository implements InvestmentReviewInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findByToken(token: string): Promise<InvestmentReviewInvitation | null> {
    const record = await this.prisma.investmentReviewInvitation.findUnique({
      where: { token },
    });
    return record ? new InvestmentReviewInvitation(record) : null;
  }
}
