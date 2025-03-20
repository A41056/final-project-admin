import { useAuthStore } from "@/stores/authStore";
import { UserInfo } from "@/types/user";
import { userApi } from "@/config/api";

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
    const response = await userApi.post<LoginResponse>("/Login", credentials);
    const { token, user } = response.data;
    login(token, user);
  };

  return {
    login: loginUser,
    logout,
  };
};
