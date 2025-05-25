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
  debug: process.env.NODE_ENV === 'development',
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
          if (!credentials?.email || !credentials?.password || !credentials?.role) {
            console.log("[Auth] Email, mot de passe ou rôle manquant");
            throw new Error("Email, mot de passe et rôle requis");
          }

          console.log("[Auth] Tentative de connexion pour:", {
            email: credentials.email,
            role: credentials.role
          });

          let user = null;
          let collection = "";

          // Sélection de la collection appropriée selon le rôle
          switch (credentials.role) {
            case "citizen":
              collection = "citizens";
              user = await prisma.citizen.findUnique({
                where: { email: credentials.email }
              });
              break;
            case "agent":
              collection = "agents";
              user = await prisma.agent.findUnique({
                where: { email: credentials.email }
              });
              break;
            case "admin":
              collection = "users";
              user = await prisma.user.findUnique({
                where: { email: credentials.email }
              });
              break;
            default:
              throw new Error("Rôle non valide");
          }

          if (!user) {
            console.log(`[Auth] Utilisateur non trouvé dans la collection ${collection}`);
            throw new Error("Email ou mot de passe incorrect");
          }

          console.log("[Auth] Utilisateur trouvé:", {
            id: user.id,
            email: user.email,
            role: user.role,
            collection
          });

          // Vérification du mot de passe avec bcrypt
          try {
            const isPasswordValid = await compare(credentials.password, user.hashedPassword);
            console.log("[Auth] Résultat de la vérification du mot de passe:", isPasswordValid);

            if (!isPasswordValid) {
              console.log("[Auth] Mot de passe incorrect");
              throw new Error("Email ou mot de passe incorrect");
            }
          } catch (error) {
            console.error("[Auth] Erreur lors de la vérification du mot de passe:", error);
            throw new Error("Erreur lors de la vérification du mot de passe");
          }

          console.log("[Auth] Connexion réussie pour:", {
            id: user.id,
            email: user.email,
            role: user.role,
            collection
          });

          // Retourner les informations de l'utilisateur
          return {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName} ${user.lastName}`,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Erreur d'authentification:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
}; 