import { Injectable } from '@nestjs/common';
import {
  InvestmentClosureReason as PrismaInvestmentClosureReason,
  InvestmentStatus as PrismaInvestmentStatus,
} from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';
import { InvestmentRepository } from '../application/investment.repository';
import {
  Investment,
  InvestmentClosureReason,
  InvestmentStatus,
} from '../domain/investment';

const investmentStatusMap: Record<PrismaInvestmentStatus, InvestmentStatus> = {
  ACTIVE: InvestmentStatus.ACTIVE,
  CLOSED: InvestmentStatus.CLOSED,
};

const closureReasonMap: Record<
  PrismaInvestmentClosureReason,
  InvestmentClosureReason
> = {
  REACHED_MATURITY: InvestmentClosureReason.REACHED_MATURITY,
  REDEEMED_EARLY: InvestmentClosureReason.REDEEMED_EARLY,
  OTHER: InvestmentClosureReason.OTHER,
};

@Injectable()
export class InvestmentPrismaRepository implements InvestmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Investment | null> {
    const record = await this.prisma.investment.findUnique({ where: { id } });
    if (!record) return null;
    return new Investment({
      id: record.id,
      customerName: record.customerName,
      productName: record.productName,
      investedAmount: record.investedAmount.toFixed(2),
      startedAt: record.startedAt,
      closedAt: record.closedAt,
      status: investmentStatusMap[record.status],
      closureReason: record.closureReason
        ? closureReasonMap[record.closureReason]
        : null,
    });
  }
}
