import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface User {
  id: string;
  rut: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/auth/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Error al obtener usuarios');
    }

    return data.users;
  },

  async getByRut(rut: string): Promise<User> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/auth/users/${rut}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Error al obtener usuario');
    }

    return data.user;
  }
};
