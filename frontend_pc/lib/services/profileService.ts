import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper para manejar respuestas con posible token expirado
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));

    // Verificar si es por token expirado
    const isTokenError =
      data.message?.toLowerCase().includes('token') ||
      data.message?.toLowerCase().includes('expirado') ||
      data.message?.toLowerCase().includes('expired') ||
      data.message?.toLowerCase().includes('jwt') ||
      data.message?.toLowerCase().includes('autenticación');

    if (isTokenError && typeof window !== 'undefined') {
      const handler = (window as any).__handleTokenExpired;
      if (handler) {
        handler();
      }
    }

    throw new Error(data.message || 'No autorizado');
  }

  return response.json();
}

export interface ProfileUser {
  id: string;
  userId: string;
  fullName: string;
  rut: string;
  role: 'becado' | 'doctor' | 'jefe_especialidad' | 'admin' | 'admin_readonly';
  specialty: string;
  specialtyId?: string;
  email: string | null;
  phone?: string | null;
  photoUrl: string | null;
  storageQuota?: number;
  usedStorage?: number;
  status?: 'ACTIVE' | 'FROZEN' | 'GRADUATED' | 'WITHDRAWN' | 'RESIGNED';
}

export const profileService = {
  // Get all users from auth service (with real roles)
  async getAllUsers(): Promise<ProfileUser[]> {
    const token = authService.getToken();

    // 1. Get all users from auth service (source of truth for roles)
    const authResponse = await fetch(`${API_URL}/auth/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const authData = await handleResponse<any>(authResponse);
    if (!authData.success) {
      throw new Error(authData.message || 'Error al obtener usuarios');
    }

    // 2. Get profile data from becado service (for emails, specialty, etc)
    let profilesData: ProfileUser[] = [];
    try {
      const profilesResponse = await fetch(`${API_URL}/becado/specialty-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (profilesResponse.ok) {
        const profiles = await profilesResponse.json();
        if (profiles.success) {
          profilesData = profiles.users;
        }
      }
    } catch (e) {
      // Profiles are optional, continue without them
    }

    // 3. Merge auth users with profile data
    const profilesByRut = new Map<string, ProfileUser>();
    profilesData.forEach((p: ProfileUser) => {
      // Normalize RUT for comparison (remove dots and dashes)
      const normalizedRut = p.rut.replace(/\./g, '').replace(/-/g, '');
      profilesByRut.set(normalizedRut, p);
    });

    return authData.users.map((authUser: any) => {
      const normalizedRut = authUser.rut.replace(/\./g, '').replace(/-/g, '');
      const profile = profilesByRut.get(normalizedRut);

      return {
        id: profile?.id || authUser.id,
        userId: profile?.userId || authUser.id, // Use auth user id, not rut
        fullName: authUser.fullName,
        rut: profile?.rut || authUser.rut, // Use formatted RUT from profile if available
        role: authUser.role, // Always use role from auth service
        specialty: profile?.specialty || '',
        specialtyId: profile?.specialtyId,
        email: profile?.email || null,
        phone: profile?.phone || null,
        photoUrl: profile?.photoUrl || null,
        storageQuota: profile?.storageQuota,
        usedStorage: profile?.usedStorage,
      };
    });
  },

  async getSpecialtyUsers(specialtyId?: string): Promise<ProfileUser[]> {
    const token = authService.getToken();

    // Si no se pasa specialtyId, intentar obtener del localStorage (para jefes)
    let effectiveSpecialtyId = specialtyId;
    if (!effectiveSpecialtyId && typeof window !== 'undefined') {
      effectiveSpecialtyId = localStorage.getItem('selectedSpecialtyId') || undefined;
    }

    const params = new URLSearchParams();
    if (effectiveSpecialtyId) {
      params.append('specialtyId', effectiveSpecialtyId);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/becado/specialty-users?${queryString}`
      : `${API_URL}/becado/specialty-users`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios de la especialidad');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener usuarios');
    }

    return data.users;
  },

  async getMyProfile(role: string): Promise<ProfileUser> {
    const token = authService.getToken();
    // Determine endpoint based on role
    // Becados use /becado/profile, Doctors/Jefes use /doctor/profile
    const endpoint = role === 'becado' ? '/becado/profile' : '/doctor/profile';

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener mi perfil');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener mi perfil');
    }

    return data.profile;
  },

  async getProfileByUserId(userId: string, role?: string): Promise<ProfileUser> {
    const token = authService.getToken();

    // If role is doctor or jefe_especialidad, try doctor endpoint first
    if (role === 'doctor' || role === 'jefe_especialidad') {
      try {
        const response = await fetch(`${API_URL}/doctor/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return { ...data.profile, role };
          }
        }
      } catch (e) {
        // Fall through to other options
      }
    }

    // For admin roles without profile, or if doctor profile not found for jefe
    if (role === 'admin' || role === 'admin_readonly' || role === 'jefe_especialidad') {
      // Try to get basic user info from auth service
      try {
        const authResponse = await fetch(`${API_URL}/auth/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.success) {
            const authUser = authData.users.find((u: any) => u.id === userId);
            if (authUser) {
              // Return a minimal profile object for admin/jefe without becado-service profile
              return {
                id: authUser.id,
                userId: authUser.id,
                fullName: authUser.fullName,
                rut: authUser.rut,
                role: authUser.role,
                specialty: '',
                email: null,
                phone: null,
                photoUrl: null,
              };
            }
          }
        }
      } catch (e) {
        // Fall through to becado endpoint
      }
    }

    // Default to becado endpoint
    const response = await fetch(`${API_URL}/becado/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el perfil del usuario');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener el perfil');
    }

    return data.profile;
  },

  async updateProfile(role: string, data: Partial<ProfileUser>): Promise<ProfileUser> {
    const token = authService.getToken();

    // Admin roles don't have becado/doctor profiles, only auth service data
    if (role === 'admin' || role === 'admin_readonly') {
      // For admin, we can only update fullName via auth service
      const userInfo = authService.getUser();
      if (!userInfo?.rut) {
        throw new Error('No se pudo obtener el RUT del usuario');
      }

      const response = await fetch(`${API_URL}/auth/users/${userInfo.rut}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: data.fullName }),
      });

      if (!response.ok) {
        console.error("Update admin profile failed with status:", response.status);
        throw new Error('Error al actualizar el perfil');
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message || 'Error al actualizar el perfil');
      }

      // Return a minimal profile object
      return {
        id: userInfo.id || '',
        userId: userInfo.id || '',
        fullName: data.fullName || '',
        rut: userInfo.rut,
        role: role as ProfileUser['role'],
        specialty: '',
        email: data.email || null,
        phone: data.phone || null,
        photoUrl: null,
      };
    }

    // Determine endpoint based on role
    const endpoint = role === 'becado' ? '/becado/profile' : '/doctor/profile';

    console.log(`Updating profile at ${API_URL}${endpoint}`, data);

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Update profile failed with status:", response.status);
      throw new Error('Error al actualizar el perfil');
    }

    const responseData = await response.json();
    console.log("Update profile response:", responseData);

    if (!responseData.success) {
      throw new Error(responseData.message || 'Error al actualizar el perfil');
    }

    return responseData.profile;
  },

  async updateStorageQuota(userId: string, quotaInBytes: number): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/profile/${userId}/quota`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quota: quotaInBytes }),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la cuota de almacenamiento');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al actualizar la cuota');
    }
  },

  async updatePassword(rut: string, password: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/auth/users/${rut}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al actualizar la contraseña');
    }
  },

  async adminUpdateProfile(userId: string, data: Partial<ProfileUser> & { rut?: string }, role?: string): Promise<ProfileUser> {
    const token = authService.getToken();

    // Use doctor endpoint for doctors/jefes
    const isDoctor = role === 'doctor' || role === 'jefe_especialidad';
    const endpoint = isDoctor
      ? `/doctor/profile/${userId}`
      : `/becado/profile/${userId}`;

    let response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // If update fails with 404, try to create the profile (for jefe/doctor without profile)
    if (!response.ok && response.status === 404 && isDoctor) {
      console.log('Profile not found, creating new doctor profile...');
      const createResponse = await fetch(`${API_URL}/doctor/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          rut: data.rut || '',
          fullName: data.fullName || '',
          email: data.email || undefined,
          phone: data.phone || undefined,
          specialtyId: data.specialtyId || undefined,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Error al crear el perfil del usuario');
      }

      const createData = await createResponse.json();
      if (!createData.success) {
        throw new Error(createData.message || 'Error al crear el perfil');
      }

      return createData.profile;
    }

    if (!response.ok) {
      throw new Error('Error al actualizar el perfil del usuario');
    }

    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || 'Error al actualizar el perfil');
    }

    return responseData.profile;
  },

  async updateUser(rut: string, data: { fullName?: string; role?: string }): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/auth/users/${rut}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el usuario en Auth Service');
    }

    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || 'Error al actualizar el usuario');
    }
  }
};
