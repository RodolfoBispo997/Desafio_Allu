import type { FileToStore } from '../../../../../shared/storage/file-storage';

export interface SubmitInvestmentReviewInput {
  token: string;
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyAccepted: boolean;
  attachments?: FileToStore[];
}

export interface SubmitInvestmentReviewOutput {
  id: string;
}
