import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper para manejar respuestas con token expirado
function handleTokenExpired() {
  if (typeof window !== 'undefined') {
    const handler = (window as any).__handleTokenExpired;
    if (handler) {
      handler();
    } else {
      authService.clearAuth();
      window.location.href = '/login';
    }
  }
}

async function checkAuthResponse(response: Response): Promise<void> {
  if (response.status === 401) {
    handleTokenExpired();
    throw new Error('Sesión expirada');
  }
}

export interface DoctorCohortAssignment {
  id: string;
  doctorId: string;
  cohortId: string;
  specialtyId: string;
  cohortYear?: number;
  assignedAt: string;
  assignedBy?: string;
}

export interface DoctorWithCohorts {
  doctorId: string;
  userId: string;
  fullName?: string;
  cohortIds: string[];
  cohorts?: {
    id: string;
    year: number;
  }[];
}

export const doctorCohortService = {
  // Obtener cohortes asignados a un doctor
  async getDoctorCohorts(doctorId: string): Promise<DoctorCohortAssignment[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/doctors/${doctorId}/cohorts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al obtener cohortes del doctor');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener cohortes del doctor');
    }

    return data.assignments;
  },

  // Asignar cohortes a un doctor (reemplaza todas las asignaciones)
  async assignCohorts(doctorId: string, cohortIds: string[]): Promise<DoctorCohortAssignment[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/doctors/${doctorId}/cohorts`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cohortIds }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al asignar cohortes');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al asignar cohortes');
    }

    return data.assignments;
  },

  // Reemplazar cohortes para una especialidad específica (Más seguro para doctores con múltiples especialidades)
  async updateSpecialtyCohorts(doctorId: string, specialtyId: string, cohortIds: string[]): Promise<string[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/doctors/${doctorId}/cohorts/specialty/${specialtyId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cohortIds }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar cohortes de la especialidad');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al actualizar cohortes de la especialidad');
    }

    return data.cohortIds; // Controller returns { success: true, cohortIds: ... }
  },

  // Agregar un cohorte a un doctor
  async addCohort(doctorId: string, cohortId: string, specialtyId: string): Promise<DoctorCohortAssignment> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/doctors/${doctorId}/cohorts/${cohortId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ specialtyId }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al agregar cohorte');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al agregar cohorte');
    }

    return data.assignment;
  },

  // Remover un cohorte de un doctor
  async removeCohort(doctorId: string, cohortId: string): Promise<void> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/doctors/${doctorId}/cohorts/${cohortId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al remover cohorte');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al remover cohorte');
    }
  },

  // Obtener doctores asignados a un cohorte
  async getCohortDoctors(cohortId: string): Promise<DoctorWithCohorts[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/cohorts/${cohortId}/doctors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al obtener doctores del cohorte');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener doctores del cohorte');
    }

    return data.doctors;
  },
};
