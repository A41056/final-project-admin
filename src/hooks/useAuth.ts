import { useAuthStore } from "@/stores/authStore";
import api from "@/config/api";
import { UserInfo } from "@/types/user";

interface LoginResponse {
  token: string;
  user: UserInfo;
}

export const useAuth = () => {
  const { login, logout } = useAuthStore();

  const loginUser = async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await api.post<LoginResponse>("/Login", credentials);
    const { token, user } = response.data;
    login(token, user);
  };

  return {
    login: loginUser,
    logout,
  };
};
