import api from "./api";
import {
  MessageReport,
  FlaggedMessage,
  OwnerReport,
  Review,
  PaginatedResponse,
  ContentModerationStats,
} from "../types";

export const moderationService = {
  // Dashboard Stats
  getContentModerationStats: async (): Promise<ContentModerationStats> => {
    const response = await api.get<ContentModerationStats>(
      "/api/super/v1/dashboard/content_moderation/",
    );
    return response.data;
  },

  // Message Reports
  getMessageReports: async (
    page = 1,
  ): Promise<PaginatedResponse<MessageReport>> => {
    const response = await api.get<PaginatedResponse<MessageReport>>(
      "/api/super/v1/message-reports/",
      { params: { page } },
    );
    return response.data;
  },

  getMessageReportById: async (id: number): Promise<MessageReport> => {
    const response = await api.get<MessageReport>(
      `/api/super/v1/message-reports/${id}/`,
    );
    return response.data;
  },

  markMessageReportReviewed: async (id: number): Promise<MessageReport> => {
    const response = await api.post<MessageReport>(
      `/api/super/v1/message-reports/${id}/mark_reviewed/`,
    );
    return response.data;
  },

  takeActionOnMessageReport: async (
    id: number,
    action: string,
    notes?: string,
  ): Promise<MessageReport> => {
    const response = await api.post<MessageReport>(
      `/api/super/v1/message-reports/${id}/take_action/`,
      { action, notes },
    );
    return response.data;
  },

  // Flagged Messages
  getFlaggedMessages: async (
    page = 1,
  ): Promise<PaginatedResponse<FlaggedMessage>> => {
    const response = await api.get<PaginatedResponse<FlaggedMessage>>(
      "/api/super/v1/flagged-messages/",
      { params: { page } },
    );
    return response.data;
  },

  getFlaggedMessageById: async (id: number): Promise<FlaggedMessage> => {
    const response = await api.get<FlaggedMessage>(
      `/api/super/v1/flagged-messages/${id}/`,
    );
    return response.data;
  },

  markFlaggedMessageReviewed: async (id: number): Promise<FlaggedMessage> => {
    const response = await api.post<FlaggedMessage>(
      `/api/super/v1/flagged-messages/${id}/mark_reviewed/`,
    );
    return response.data;
  },

  takeActionOnFlaggedMessage: async (
    id: number,
    action: string,
    notes?: string,
  ): Promise<FlaggedMessage> => {
    const response = await api.post<FlaggedMessage>(
      `/api/super/v1/flagged-messages/${id}/take_action/`,
      { action, notes },
    );
    return response.data;
  },

  // Owner Reports
  getOwnerReports: async (
    page = 1,
  ): Promise<PaginatedResponse<OwnerReport>> => {
    const response = await api.get<PaginatedResponse<OwnerReport>>(
      "/api/super/v1/owner-reports/",
      { params: { page } },
    );
    return response.data;
  },

  getOwnerReportById: async (id: number): Promise<OwnerReport> => {
    const response = await api.get<OwnerReport>(
      `/api/super/v1/owner-reports/${id}/`,
    );
    return response.data;
  },

  updateOwnerReportStatus: async (
    id: number,
    status: string,
    notes?: string,
  ): Promise<OwnerReport> => {
    const response = await api.post<OwnerReport>(
      `/api/super/v1/owner-reports/${id}/update_status/`,
      { status, notes },
    );
    return response.data;
  },

  // Reviews
  getReviews: async (
    page = 1,
    flagged = false,
  ): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>(
      "/api/super/v1/reviews/",
      { params: { page, flagged } },
    );
    return response.data;
  },

  removeReview: async (id: number, reason: string): Promise<void> => {
    await api.post(`/api/super/v1/reviews/${id}/remove/`, { reason });
  },
};

export default moderationService;

