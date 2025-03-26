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
    try {
      const response = (await userApi.post(
        "/Login",
        credentials
      )) as LoginResponse;
      const { token, user } = response;
      login(token, user);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.message || "An unknown error occurred during login";
      throw new Error(errorMessage);
    }
  };

  return {
    login: loginUser,
    logout,
  };
};
