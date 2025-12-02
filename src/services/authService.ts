import { jwtDecode } from "jwt-decode";
import type { ApiResponse, DecodedToken, LoginResponse } from "@/types";
import Cookies from "js-cookie";
import apiService from "./apiService";
const TOKEN_KEY = "jwt";

const setToken = (token: string, remember: boolean = true) => {
  const options: Cookies.CookieAttributes = {
    secure: true,
    sameSite: "strict",
  };

  // Persistent cookie for remember-me, session cookie otherwise
  if (remember) {
    options.expires = 7; // days
  }

  Cookies.set(TOKEN_KEY, token, options);
};

const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

const getDecodedToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const isTokenExpired = (): boolean => {
  const decodedToken = getDecodedToken();
  if (!decodedToken) return true;

  const now = Date.now() / 1000;
  return decodedToken.exp < now;
};

const login = async (
  username: string,
  password: string,
  remember: boolean = true,
): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiService.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    { username, password },
  );
  if (response.success && response.data?.token) {
    setToken(response.data.token, remember);
  }
  return response;
};

const logout = (): void => {
  removeToken();
};

export const authService = {
  setToken,
  getToken,
  removeToken,
  getDecodedToken,
  isTokenExpired,
  login,
  logout,
};