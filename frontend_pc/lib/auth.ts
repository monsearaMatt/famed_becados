// Utility functions for authentication

export interface User {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  rut: string;
  fullName: string;
  rol: string;
  user?: User; // Mantener opcional para compatibilidad si se usa en otros lados
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const authService = {
  async login(rut: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rut, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data = await response.json();

    return {
      ...data,
      user: {
        id: data.id,
        rut: data.rut,
        nombre: data.fullName,
        rol: data.rol,
      }
    };
  },

  async register(userData: {
    email: string;
    nombre: string;
    apellido: string;
    rut: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    return response.json();
  },

  async verifyToken(token: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token inválido o expirado');
    }

    const data = await response.json();

    return {
      ...data,
      user: {
        id: data.id,
        rut: data.rut,
        nombre: data.fullName,
        rol: data.rol,
      }
    };
  },

  // LocalStorage helpers
  saveAuth(data: LoginResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
