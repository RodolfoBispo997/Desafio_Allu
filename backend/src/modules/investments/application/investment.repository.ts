import { Investment } from '../domain/investment';

export interface InvestmentRepository {
  findById(id: string): Promise<Investment | null>;
}
