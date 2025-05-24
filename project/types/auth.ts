import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

export interface CustomUser {
  id: string;
  email: string;
  role: string;
  hashedPassword: string;
}

export interface CustomToken extends JWT {
  role?: string;
  id?: string;
}

export interface CustomSession extends Session {
  user: {
    id?: string;
    role?: string;
    email?: string;
    name?: string;
  };
} 