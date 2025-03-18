import api from "@/config/api";
import { LoginCredentials, User } from "@/types/auth";

export const login = async ({
  username,
  password,
}: LoginCredentials): Promise<{ token: string; user: User }> => {
  const response = await api.post("/login", { username, password });
  return response.data;
};
