import { UserRole } from '@/types/user';

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
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
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
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

// Logout function
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
}

// Get authentication token
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Check if user has specific role
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
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
  const token = getToken();
  
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
} 