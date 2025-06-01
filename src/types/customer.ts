export interface Customer {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  age?: number;
  roleId: string;
  createdDate: string;
  modifiedDate?: string;
  isActive: boolean;
}