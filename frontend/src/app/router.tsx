import { createBrowserRouter } from "react-router-dom";
import { ModerationDetailPage } from "../features/moderation/moderation-detail-page";
import { ModerationPage } from "../features/moderation/moderation-page";
import { ReviewPage } from "../features/review/review-page";
import { HomePage } from "../pages/home-page";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/review/:token", element: <ReviewPage /> },
  { path: "/moderation", element: <ModerationPage /> },
  { path: "/moderation/:id", element: <ModerationDetailPage /> },
]);
