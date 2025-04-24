import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  user_id: number;
}

// Token management
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Token validation
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  return isTokenValid(getAccessToken());
};

export const getUserIdFromToken = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    return decodedToken.user_id;
  } catch (error) {
    return null;
  }
};