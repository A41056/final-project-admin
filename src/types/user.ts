export interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  age: number;
  roleId: string;
  createdDate: string;
  modifiedDate: string | null;
}

export interface UserUpdate {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  age?: number;
}
