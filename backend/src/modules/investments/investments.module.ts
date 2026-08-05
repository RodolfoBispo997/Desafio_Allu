import { Module } from '@nestjs/common';
import { InvestmentPrismaRepository } from './infrastructure/investment-prisma.repository';

@Module({
  providers: [
    { provide: 'InvestmentRepository', useClass: InvestmentPrismaRepository },
  ],
  exports: ['InvestmentRepository'],
})
export class InvestmentsModule {}
