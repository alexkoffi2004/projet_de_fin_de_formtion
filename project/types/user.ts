export enum UserRole {
  CITIZEN = 'citizen',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
} 