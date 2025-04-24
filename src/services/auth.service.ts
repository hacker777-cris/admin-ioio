import api from "./api";
import { AuthResponse, LoginCredentials, User } from "../types";
import { setTokens } from "../utils/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log(
        "Attempting login with credentials:",
        JSON.stringify({
          username: credentials.username,
          password: "[REDACTED]",
        }),
      );

      const response = await api.post<AuthResponse>(
        "/api/super/v1/auth/login/",
        credentials,
      );

      console.log("Login successful!");

      // Store tokens and user data
      if (response.data.access && response.data.refresh) {
        setTokens(response.data.access, response.data.refresh);

        // Store user data in localStorage or state management system
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: response.data.user_id,
            username: response.data.username,
            isSuper: response.data.is_superuser,
          }),
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);

      // Show detailed error information
      if (error.response) {
        alert(
          `Login error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        );
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        alert(`No response received from server`);
        console.error("Error request:", error.request);
      } else {
        alert(`Request error: ${error.message}`);
        console.error("Error message:", error.message);
      }

      throw error;
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await api.post("/api/super/v1/auth/logout/", {
        refresh: refreshToken,
      });

      // Clear user data and tokens
      localStorage.removeItem("currentUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return;
    } catch (error: any) {
      console.error("Logout error:", error);

      // Even if logout fails, clear local data
      localStorage.removeItem("currentUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      throw error;
    }
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      await api.post("/api/super/v1/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      return;
    } catch (error: any) {
      console.error("Password change error:", error);
      throw error;
    }
  },

  // Get current user from localStorage instead of API call
  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
      return null;
    }
  },

  // Only use this if you need to refresh user data from the server
  refreshUserData: async (): Promise<User> => {
    try {
      const response = await api.get<User>("/api/super/v1/users/me/");

      // Update stored user data
      localStorage.setItem("currentUser", JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  },
};

export default authService;

