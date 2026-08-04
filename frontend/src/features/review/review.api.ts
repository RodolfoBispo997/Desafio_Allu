import { api } from "../../lib/api";
import type { Invitation } from "./review.types";
export interface SubmitReviewRequest {
  overallExperienceRating: number;
  informationClarityRating: number;
  processEaseRating: number;
  comment: string;
  policyAccepted: boolean;
  attachments: File[];
}
export const getInvitation = async (token: string) =>
  (await api.get<Invitation>(`/review-invitations/${token}`)).data;
export const submitReview = async (
  token: string,
  data: SubmitReviewRequest,
) => {
  const form = new FormData();
  form.append("overallExperienceRating", String(data.overallExperienceRating));
  form.append(
    "informationClarityRating",
    String(data.informationClarityRating),
  );
  form.append("processEaseRating", String(data.processEaseRating));
  form.append("comment", data.comment);
  form.append("policyAccepted", String(data.policyAccepted));
  data.attachments.forEach((file) => form.append("attachments", file));
  return api.post(`/review-invitations/${token}/review`, form);
};
