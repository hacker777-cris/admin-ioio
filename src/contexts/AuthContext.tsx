import React, { createContext, useState, useEffect, useContext } from "react";
import { User } from "../types";
import { authService } from "../services/auth.service";
import { isAuthenticated, clearTokens, setTokens } from "../utils/auth";
import { LoginCredentials, AuthResponse } from "../types";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data if authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Failed to load user data:", err);
          setIsLoggedIn(false);
          clearTokens();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const authResponse: AuthResponse = await authService.login(credentials);
      console.log(authResponse);
      setTokens(authResponse.access, authResponse.refresh);

      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials. Please try again.");
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearTokens();
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (err) {
      console.error("Change password error:", err);
      setError(
        "Failed to change password. Please verify your current password.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        error,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

