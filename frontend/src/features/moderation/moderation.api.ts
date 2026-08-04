import { api } from "../../lib/api";
import type { Review } from "./moderation.types";
export const getPending = async () =>
  (await api.get<Review[]>("/investment-reviews?status=PENDING_MODERATION"))
    .data;
export const getReview = async (id: string) =>
  (await api.get<Review>(`/investment-reviews/${id}`)).data;
export const approveReview = (id: string) =>
  api.patch(`/investment-reviews/${id}/approve`);
export const rejectReview = (id: string, reason: string) =>
  api.patch(`/investment-reviews/${id}/reject`, { reason });
