import { Investment } from '../domain/investment';

export const INVESTMENT_REPOSITORY = Symbol('INVESTMENT_REPOSITORY');

export interface InvestmentRepository {
  findById(id: string): Promise<Investment | null>;
}
