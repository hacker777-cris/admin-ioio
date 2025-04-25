import api from "./api";
import {
  UserStats,
  PropertyStats,
  BookingStats,
  ContentModerationStats,
} from "../types";

// Backend response types that match actual API responses
interface UserStatsResponse {
  total_users: number;
  active_users: number;
  sellers: number;
  new_users_today: number;
}

interface PropertyStatsResponse {
  properties_for_sale: number;
  properties_for_sale_sold: number;
  rental_properties: number;
  per_night_properties: number;
}

interface BookingStatsResponse {
  total_bookings: number;
  confirmed_bookings: number;
  bookings_today: number;
}

interface ContentModerationStatsResponse {
  pending_message_reports: number;
  pending_owner_reports: number;
  flagged_messages: number;
}

export const dashboardService = {
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStatsResponse>(
      "/api/super/v1/dashboard/users/",
    );

    // Transform backend response to match frontend expected structure
    return {
      total: response.data.total_users,
      active: response.data.active_users,
      sellers: response.data.sellers,
      new_this_month: response.data.new_users_today, // Note: this is actually "today" not "month"
    };
  },

  getPropertyStats: async (): Promise<PropertyStats> => {
    const response = await api.get<PropertyStatsResponse>(
      "/api/super/v1/dashboard/properties/",
    );

    // Calculate total properties
    const totalProperties =
      response.data.properties_for_sale +
      response.data.rental_properties +
      response.data.per_night_properties;

    // Transform backend response to match frontend expected structure
    return {
      total: totalProperties,
      active: totalProperties - response.data.properties_for_sale_sold,
      pending: 0, // No equivalent in API response
      featured: 0, // No equivalent in API response
      for_sale: response.data.properties_for_sale,
      rental: response.data.rental_properties,
      per_night: response.data.per_night_properties,
      sold: response.data.properties_for_sale_sold,
      new_this_week: 0, // No equivalent in API response
    };
  },

  getBookingStats: async (): Promise<BookingStats> => {
    const response = await api.get<BookingStatsResponse>(
      "/api/super/v1/dashboard/bookings/",
    );

    // Transform backend response to match frontend expected structure
    return {
      total: response.data.total_bookings,
      confirmed: response.data.confirmed_bookings,
      // These fields don't have direct equivalents in the API response
      pending: 0,
      completed: 0,
      cancelled: 0,
      new_this_month: response.data.bookings_today, // This is actually "today" not "month"
    };
  },

  getContentModerationStats: async (): Promise<ContentModerationStats> => {
    const response = await api.get<ContentModerationStatsResponse>(
      "/api/super/v1/dashboard/content_moderation/",
    );

    // Transform backend response to match frontend expected structure
    return {
      message_reports: {
        total: response.data.pending_message_reports, // We don't have total, only pending
        pending: response.data.pending_message_reports,
        resolved: 0, // No data for resolved in API response
      },
      flagged_messages: {
        total: response.data.flagged_messages, // We don't have total, only pending
        pending: response.data.flagged_messages,
        resolved: 0, // No data for resolved in API response
      },
      owner_reports: {
        total: response.data.pending_owner_reports, // We don't have total, only pending
        pending: response.data.pending_owner_reports,
        resolved: 0, // No data for resolved in API response
      },
      reviews: {
        total: 0, // No data in API response
        flagged: 0, // No data in API response
        removed: 0, // No data in API response
      },
    };
  },
};

export default dashboardService;
