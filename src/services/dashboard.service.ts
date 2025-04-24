import api from "./api";
import {
  UserStats,
  PropertyStats,
  BookingStats,
  ContentModerationStats,
} from "../types";

export const dashboardService = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>("/api/super/v1/dashboard/users/");
    return response.data;
  },

  getPropertyStats: async (): Promise<PropertyStats> => {
    const response = await api.get<PropertyStats>(
      "/api/super/v1/dashboard/properties/",
    );
    return response.data;
  },

  getBookingStats: async (): Promise<BookingStats> => {
    const response = await api.get<BookingStats>(
      "/api/super/v1/dashboard/bookings/",
    );
    return response.data;
  },

  getContentModerationStats: async (): Promise<ContentModerationStats> => {
    const response = await api.get<ContentModerationStats>(
      "/api/super/v1/dashboard/content_moderation/",
    );
    return response.data;
  },
};

export default dashboardService;

