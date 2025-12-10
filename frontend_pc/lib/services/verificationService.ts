import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper para manejar respuestas con posible token expirado
function handleTokenExpired() {
  if (typeof window !== 'undefined') {
    const handler = (window as any).__handleTokenExpired;
    if (handler) {
      handler();
    } else {
      // Fallback
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

export interface PendingActivity {
  id: string;
  scholarProfileId: string;
  scholarName: string;
  scholarRut: string;
  specialtyId?: string | null;
  specialtyName?: string | null;
  title: string;
  description: string | null;
  type: string;
  customType: string | null;
  date: string;
  hours: number;
  status: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    name: string;
    mimeType: string;
    contentBase64: string;
  }>;
}

export interface PendingCommunityActivity {
  id: string;
  scholarProfileId: string;
  scholarName: string;
  scholarRut: string;
  specialtyId?: string | null;
  specialtyName?: string | null;
  title: string;
  description: string | null;
  type: string;
  customType: string | null;
  date: string;
  hours: number;
  location?: string | null;
  beneficiaries?: number | null;
  status: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    name: string;
    mimeType: string;
    contentBase64: string;
  }>;
}

export interface PendingProcedureRecord {
  id: string;
  scholarProfileId: string;
  scholarName: string;
  scholarRut: string;
  specialtyId?: string | null;
  specialtyName?: string | null;
  procedureId: string;
  procedureName: string;
  date: string;
  patientInitials?: string | null;
  supervisorName?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    name: string;
    mimeType: string;
    contentBase64: string;
  }>;
}

export interface AvailableSpecialty {
  id: string;
  name: string;
}

export interface GetActivitiesResult {
  activities: PendingActivity[];
  availableSpecialties: AvailableSpecialty[];
}

export interface VerifyActivityResult {
  success: boolean;
  message: string;
  activity?: {
    id: string;
    title: string;
    status: string;
  };
}

export const verificationService = {
  /**
   * Obtiene las actividades académicas para verificación
   * Para jefes: solo las de su especialidad
   * Para admins: todas las actividades
   * @param statusFilter Filtro opcional: 'pending', 'approved', 'rejected', o 'all' (default)
   * @param specialtyFilter Filtro opcional por especialidad
   */
  async getPendingActivities(statusFilter?: string, specialtyFilter?: string): Promise<GetActivitiesResult> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (specialtyFilter && specialtyFilter !== 'all') params.append('specialty', specialtyFilter);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_URL}/becado/activities/pending?${queryString}`
      : `${API_URL}/becado/activities/pending`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error(`Error al obtener actividades: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener actividades');
    }

    return {
      activities: data.activities,
      availableSpecialties: data.availableSpecialties || []
    };
  },

  /**
   * Aprueba una actividad académica
   * @param activityId ID de la actividad a aprobar
   */
  async approveActivity(activityId: string): Promise<VerifyActivityResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/activities/${activityId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'approved' }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al aprobar actividad: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Rechaza una actividad académica
   * @param activityId ID de la actividad a rechazar
   */
  async rejectActivity(activityId: string): Promise<VerifyActivityResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/activities/${activityId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'rejected' }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al rechazar actividad: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Verifica una actividad académica con un estado específico
   * @param activityId ID de la actividad
   * @param status Estado a asignar ('approved' | 'rejected')
   */
  async verifyActivity(activityId: string, status: 'approved' | 'rejected'): Promise<VerifyActivityResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/activities/${activityId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al verificar actividad: ${response.status}`);
    }

    return await response.json();
  },

  // ========== COMMUNITY ACTIVITIES ==========

  /**
   * Obtiene las actividades comunitarias para verificación
   */
  async getPendingCommunityActivities(statusFilter?: string, specialtyFilter?: string): Promise<{ activities: PendingCommunityActivity[], availableSpecialties: AvailableSpecialty[] }> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (specialtyFilter && specialtyFilter !== 'all') params.append('specialty', specialtyFilter);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_URL}/becado/community-activities/pending?${queryString}`
      : `${API_URL}/becado/community-activities/pending`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error(`Error al obtener actividades comunitarias: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener actividades comunitarias');
    }

    return {
      activities: data.activities,
      availableSpecialties: data.availableSpecialties || []
    };
  },

  /**
   * Verifica una actividad comunitaria
   */
  async verifyCommunityActivity(activityId: string, status: 'approved' | 'rejected'): Promise<VerifyActivityResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/community-activities/${activityId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al verificar actividad comunitaria: ${response.status}`);
    }

    return await response.json();
  },

  // ========== PROCEDURE RECORDS ==========

  /**
   * Obtiene los registros de procedimientos para verificación
   */
  async getPendingProcedureRecords(statusFilter?: string, specialtyFilter?: string): Promise<{ records: PendingProcedureRecord[], availableSpecialties: AvailableSpecialty[] }> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (specialtyFilter && specialtyFilter !== 'all') params.append('specialty', specialtyFilter);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_URL}/becado/procedure-records/pending?${queryString}`
      : `${API_URL}/becado/procedure-records/pending`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error(`Error al obtener registros de procedimientos: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener registros de procedimientos');
    }

    return {
      records: data.records,
      availableSpecialties: data.availableSpecialties || []
    };
  },

  /**
   * Verifica un registro de procedimiento
   */
  async verifyProcedureRecord(recordId: string, status: 'approved' | 'rejected'): Promise<VerifyActivityResult> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/procedure-records/${recordId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al verificar registro: ${response.status}`);
    }

    return await response.json();
  }
};
