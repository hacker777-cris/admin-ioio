import api from "./api";
import { User, UserFilters, PaginatedResponse } from "../types";

export const usersService = {
  getUsers: async (
    filters: UserFilters = {},
    page = 1,
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();

    if (filters.is_active !== undefined) {
      params.append("is_active", filters.is_active.toString());
    }

    if (filters.is_staff !== undefined) {
      params.append("is_staff", filters.is_staff.toString());
    }

    if (filters.search) {
      params.append("search", filters.search);
    }

    params.append("page", page.toString());

    const response = await api.get<PaginatedResponse<User>>(
      "/api/super/v1/users/",
      { params },
    );
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/super/v1/users/${id}/`);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(
      `/api/super/v1/users/${id}/`,
      userData,
    );
    return response.data;
  },

  activateUser: async (id: number): Promise<void> => {
    await api.post(`/api/super/v1/users/${id}/activate/`);
  },

  deactivateUser: async (id: number): Promise<void> => {
    await api.post(`/api/super/v1/users/${id}/deactivate/`);
  },
};

export default usersService;

