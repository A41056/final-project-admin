import { userApi } from "@/config/api";
import { LoginCredentials, User } from "@/types/auth";

export const login = async ({
  username,
  password,
}: LoginCredentials): Promise<{ token: string; user: User }> => {
  const response = await userApi.post("/login", { username, password });
  return response.data;
};
