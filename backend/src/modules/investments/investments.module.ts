import { Module } from '@nestjs/common';
import { INVESTMENT_REPOSITORY } from './application/investment.repository';
import { InvestmentPrismaRepository } from './infrastructure/investment-prisma.repository';

@Module({
  providers: [
    { provide: INVESTMENT_REPOSITORY, useClass: InvestmentPrismaRepository },
  ],
  exports: [INVESTMENT_REPOSITORY],
})
export class InvestmentsModule {}
