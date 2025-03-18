import React, { useState, useEffect, ReactNode } from "react";
import { AuthState } from "@/types/auth";
import { login } from "@/services/authServices";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setState((prev) => ({
          ...prev,
          token: storedToken,
          isAuthenticated: true,
        }));
      }
      setState((prev) => ({ ...prev, loading: false }));
    };
    initializeAuth();
  }, []);

  const handleLogin = async (credentials: {
    username: string;
    password: string;
  }) => {
    const { token, user } = await login(credentials);
    setState({ user, token, isAuthenticated: true, loading: false });
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
