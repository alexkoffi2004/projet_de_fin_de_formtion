import { getServerSession } from "next-auth/next";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { CustomUser, CustomToken, CustomSession } from "@/types/auth";
import { UserRole } from '@/types/user';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

// API URL
const API_URL = 'http://localhost:3000/api';

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Auth response interface
interface AuthResponse {
  access_token: string;
  user: User;
}

// Login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Register user interface
interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// Login function
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  const data = await response.json();
  
  // Store token and user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

// Register function
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  
  // Store token and user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

// Logout function
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session?.user?.id || !session?.user?.role) {
    return null;
  }
  
  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: session.user.role as UserRole
  };
}

// Get authentication token
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// Check if user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  
  if (user.role === role) {
    return true;
  }
  
  // Admin has access to all roles
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Agent has access to citizen role
  if (user.role === UserRole.AGENT && role === UserRole.CITIZEN) {
    return true;
  }
  
  return false;
}

// Create authenticated fetch function
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const session = await getServerSession(authOptions) as CustomSession;
  const token = session?.user?.id;
  
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Email ou mot de passe manquant");
            return null;
          }

          console.log("[Auth] Tentative de connexion pour:", credentials.email);

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              hashedPassword: true,
            },
          });

          if (!user) {
            console.log("[Auth] Utilisateur non trouvé:", credentials.email);
            return null;
          }

          console.log("[Auth] Utilisateur trouvé, vérification du mot de passe");

          const isPasswordValid = await compare(credentials.password, user.hashedPassword);

          if (!isPasswordValid) {
            console.log("[Auth] Mot de passe incorrect pour:", credentials.email);
            return null;
          }

          // Vérifier le rôle si spécifié
          if (credentials.role && user.role !== credentials.role) {
            console.log("[Auth] Rôle incorrect pour:", credentials.email, "Attendu:", credentials.role, "Reçu:", user.role);
            return null;
          }

          console.log("[Auth] Connexion réussie pour:", credentials.email, "Rôle:", user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Erreur lors de l'authentification:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          role: customUser.role
        };
      }
      return token;
    },
    async session({ session, token }) {
      const customToken = token as CustomToken;
      return {
        ...session,
        user: {
          ...session.user,
          id: customToken.id,
          role: customToken.role
        }
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Activer le mode debug
}; 