import { userApi } from "@/config/api";
import { LoginCredentials, User } from "@/types/auth";

export const login = async ({
  email,
  password,
}: LoginCredentials): Promise<{ token: string; user: User }> => {
  const response = await userApi.useLogin(email, password);
  return response.data;
};
