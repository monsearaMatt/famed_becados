import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper para manejar respuestas con posible token expirado
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

// Interfaces para filtros de exportación
export interface ExportFilters {
  specialtyId?: string;
  cohortId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  year?: number;
}

export interface ExportableData {
  scholars: ScholarExportData[];
  academicActivities: ActivityExportData[];
  communityActivities: CommunityExportData[];
  procedureRecords: ProcedureExportData[];
  evaluations: EvaluationExportData[];
}

export interface ScholarExportData {
  rut: string;
  fullName: string;
  email: string | null;
  specialty: string;
  cohortYear: number;
  status: string;
  totalAcademicHours: number;
  approvedAcademicHours: number;
  totalCommunityHours: number;
  totalProcedures: number;
  averageEvaluationScore: number | null;
}

export interface ActivityExportData {
  scholarRut: string;
  scholarName: string;
  specialty: string;
  type: string;
  title: string;
  date: string;
  hours: number;
  status: string;
  createdAt: string;
}

export interface CommunityExportData {
  scholarRut: string;
  scholarName: string;
  specialty: string;
  type: string;
  title: string;
  location: string | null;
  beneficiaries: number | null;
  date: string;
  hours: number;
  status: string;
  createdAt: string;
}

export interface ProcedureExportData {
  scholarRut: string;
  scholarName: string;
  specialty: string;
  procedureName: string;
  date: string;
  patientInitials: string | null;
  supervisorName: string | null;
  status: string;
  createdAt: string;
}

export interface EvaluationExportData {
  scholarRut: string;
  scholarName: string;
  specialty: string;
  doctorName: string;
  rubricName: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  comments: string | null;
}

export interface SpecialtyOption {
  id: string;
  name: string;
  startYear?: number;
}

export interface CohortOption {
  id: string;
  year: number;
  specialtyId: string;
}

export const exportService = {
  // Obtener opciones de especialidades para filtros
  async getSpecialties(): Promise<SpecialtyOption[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/specialties`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al obtener especialidades');
    }

    const data = await response.json();
    return data.specialties || [];
  },

  // Obtener cohortes de una especialidad
  async getCohorts(specialtyId: string): Promise<CohortOption[]> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/cohorts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al obtener cohortes');
    }

    const data = await response.json();
    return data.cohorts || [];
  },

  // Exportar becados
  async exportScholars(filters: ExportFilters): Promise<ScholarExportData[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
    if (filters.cohortId) params.append('cohortId', filters.cohortId);
    if (filters.year) params.append('year', filters.year.toString());

    const response = await fetch(`${API_URL}/becado/export/scholars?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al exportar becados');
    }

    const data = await response.json();
    return data.scholars || [];
  },

  // Exportar actividades académicas
  async exportAcademicActivities(filters: ExportFilters): Promise<ActivityExportData[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
    if (filters.cohortId) params.append('cohortId', filters.cohortId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_URL}/becado/export/academic-activities?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al exportar actividades académicas');
    }

    const data = await response.json();
    return data.activities || [];
  },

  // Exportar actividades comunitarias
  async exportCommunityActivities(filters: ExportFilters): Promise<CommunityExportData[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
    if (filters.cohortId) params.append('cohortId', filters.cohortId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_URL}/becado/export/community-activities?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al exportar actividades comunitarias');
    }

    const data = await response.json();
    return data.activities || [];
  },

  // Exportar procedimientos
  async exportProcedures(filters: ExportFilters): Promise<ProcedureExportData[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
    if (filters.cohortId) params.append('cohortId', filters.cohortId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_URL}/becado/export/procedures?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al exportar procedimientos');
    }

    const data = await response.json();
    return data.procedures || [];
  },

  // Exportar evaluaciones
  async exportEvaluations(filters: ExportFilters): Promise<EvaluationExportData[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (filters.specialtyId) params.append('specialtyId', filters.specialtyId);
    if (filters.cohortId) params.append('cohortId', filters.cohortId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${API_URL}/evaluaciones/export?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    await checkAuthResponse(response);

    if (!response.ok) {
      throw new Error('Error al exportar evaluaciones');
    }

    const data = await response.json();
    return data.evaluations || [];
  },
};

// Utilidades para generar archivos de exportación
export const exportUtils = {
  // Convertir array de objetos a CSV
  arrayToCSV<T extends Record<string, any>>(data: T[], headers: { key: keyof T; label: string }[]): string {
    if (data.length === 0) return '';

    const headerRow = headers.map(h => `"${h.label}"`).join(',');
    const rows = data.map(item => 
      headers.map(h => {
        const value = item[h.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      }).join(',')
    );

    return [headerRow, ...rows].join('\n');
  },

  // Descargar archivo CSV
  downloadCSV(content: string, filename: string): void {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Descargar como Excel (formato CSV compatible)
  downloadExcel(content: string, filename: string): void {
    // For simplicity, we use CSV format which Excel can open
    this.downloadCSV(content, filename);
  }
};
