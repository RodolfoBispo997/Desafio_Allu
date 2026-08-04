export interface Review {
  id: string;
  investmentId: string;
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyVersion: string;
  policyAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  moderatedAt: string | null;
  moderationReason: string | null;
  attachments: Array<{
    id: string;
    originalFileName: string;
    mimeType: string;
    fileSize: number;
  }>;
}
