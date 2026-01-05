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

export interface Specialty {
    id: string;
    name: string;
    startYear?: number;
    cohortCount?: number;
    cohorts?: Cohort[];
}

export interface Cohort {
    id: string;
    year: number;
    specialtyId: string;
    startDate?: string | null;
    endDate?: string | null;
    status?: 'upcoming' | 'active' | 'completed';
}

export interface JefeEspecialidadData {
    id: string;
    userId: string;
    specialtyId: string;
    specialtyName: string;
    startYear?: number;
    createdAt: Date;
}

export interface ScholarActivity {
    id: string;
    type: string;
    title: string;
    status: string;
    date: string;
    hours: number;
    createdAt: string;
}

export interface ActivityStats {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    totalHours: number;
    approvedHours: number;
}

export interface ScholarWithActivities {
    id: string;
    userId: string;
    rut: string;
    fullName: string;
    email: string | null;
    cohortYear: number | null;
    activities: ScholarActivity[];
    activityStats: ActivityStats;
}

// Types for community activities
export interface CommunityActivity {
    id: string;
    type: string;
    title: string;
    description?: string;
    beneficiaryCount?: number;
    location?: string;
    date: string;
    status: string;
    createdAt: string;
}

// Types for minimum procedures
export interface ProcedureRecord {
    id: string;
    procedureId: string;
    procedureName?: string;
    date: string;
    patientInitials?: string;
    supervisorName?: string;
    notes?: string;
    status: string;
    createdAt: string;
}

export interface ProcedureProgress {
    procedureId: string;
    procedureName: string;
    targetCount: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalCount: number;
    isComplete: boolean;
}

export interface ProcedureCatalog {
    id: string;
    name: string;
    description?: string;
    targetCount: number;
    isActive: boolean;
}

// Similar specialty search result
export interface CohortWithProcedureCount {
    id: string;
    specialtyId: string;
    year: number;
    startDate?: string | null;
    endDate?: string | null;
    procedureCount: number;
}

export interface SimilarSpecialtyResult {
    specialty: Specialty;
    cohortsWithProcedures: CohortWithProcedureCount[];
}

// Scholar evaluation from doctor
export interface ScholarEvaluation {
    id: string;
    doctorName: string;
    rubricName: string;
    date: string;
    score: number;
    maxScore: number;
    status: string;
    criteria: {
        name: string;
        selectedOption: string;
        points: number;
    }[];
    comments?: string;
}

// Complete scholar history
export interface ScholarHistory {
    profile: {
        id: string;
        userId: string;
        rut: string;
        fullName: string;
        email?: string;
        specialty?: string;
        cohort?: number;
    };
    academicActivities: {
        activities: ScholarActivity[];
        stats: ActivityStats;
    };
    communityActivities: {
        activities: CommunityActivity[];
        stats: {
            total: number;
            approved: number;
            pending: number;
            rejected: number;
        };
    };
    procedureRecords: {
        records: ProcedureRecord[];
        progress: ProcedureProgress[];
    };
}

export const specialtyService = {
    // Alias for getSpecialties
    async getAll(): Promise<Specialty[]> {
        return this.getSpecialties();
    },

    // Alias for getCohorts
    async getCohortsBySpecialty(specialtyId: string): Promise<Cohort[]> {
        return this.getCohorts(specialtyId);
    },

    async getSpecialties(): Promise<Specialty[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error(`Error al obtener especialidades: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener especialidades');
        }

        return data.specialties;
    },

    async createSpecialty(name: string, startYear?: number, cohortCount?: number): Promise<Specialty> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, startYear, cohortCount }),
        });

        if (!response.ok) {
            throw new Error('Error al crear especialidad');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al crear especialidad');
        }

        return data.specialty;
    },

    async updateSpecialty(specialtyId: string, name: string): Promise<Specialty> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al actualizar especialidad');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al actualizar especialidad');
        }

        return data.specialty;
    },

    async deleteSpecialty(specialtyId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al eliminar especialidad');
        }
    },

    async getCohorts(specialtyId: string): Promise<Cohort[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/cohorts`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener cortes');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener cortes');
        }

        return data.cohorts;
    },

    async createCohort(specialtyId: string, year: number): Promise<Cohort> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/cohorts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year }),
        });

        if (!response.ok) {
            throw new Error('Error al crear corte');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al crear corte');
        }

        return data.cohort;
    },

    async getUsers(specialtyId: string): Promise<any[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialty-users?specialtyId=${specialtyId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener usuarios');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener usuarios');
        }

        return data.users;
    },

    async updateDoctorSpecialty(userId: string, specialtyId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/doctor/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specialtyId }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar especialidad del doctor');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al actualizar especialidad del doctor');
        }
    },

    async getScholarsByCohort(cohortId: string): Promise<ScholarWithActivities[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/cohorts/${cohortId}/scholars`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener becados del corte');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener becados del corte');
        }

        return data.scholars;
    },

    // Jefe de Especialidad management
    async getJefesBySpecialty(specialtyId: string): Promise<JefeEspecialidadData[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/jefes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener jefes de especialidad');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener jefes');
        }

        return data.jefes;
    },

    async assignJefe(userId: string, specialtyId: string): Promise<JefeEspecialidadData> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/jefe/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, specialtyId }),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al asignar jefe');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al asignar jefe');
        }

        return data.assignment;
    },

    async unassignJefe(userId: string, specialtyId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/jefe/${userId}/specialty/${specialtyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al desasignar jefe');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al desasignar jefe');
        }
    },

    async getMySpecialties(): Promise<JefeEspecialidadData[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/jefe/my-specialties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener mis especialidades');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener mis especialidades');
        }

        return data.specialties;
    },

    // Get all jefe assignments (to filter out jefes already assigned)
    async getAllJefeAssignments(): Promise<JefeEspecialidadData[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/jefe/all-assignments`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener asignaciones de jefes');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener asignaciones');
        }

        return data.assignments;
    },

    // Get specialties assigned to a specific jefe by userId
    async getSpecialtiesByJefeUserId(userId: string): Promise<JefeEspecialidadData[]> {
        // Use getAllJefeAssignments and filter by userId
        const allAssignments = await this.getAllJefeAssignments();
        return allAssignments.filter(a => a.userId === userId);
    },

    // Update cohort dates (Admin only)
    async updateCohort(cohortId: string, startDate?: string, endDate?: string): Promise<Cohort> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/cohorts/${cohortId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startDate, endDate }),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al actualizar corte');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al actualizar corte');
        }

        return data.cohort;
    },

    // Get complete scholar history (for jefe/admin viewing a scholar's full profile)
    async getScholarHistory(userId: string, cohortId?: string): Promise<ScholarHistory> {
        const token = authService.getToken();
        let url = `${API_URL}/becado/scholars/${userId}/history`;
        if (cohortId) {
            url += `?cohortId=${cohortId}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al obtener historial del becado');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener historial del becado');
        }

        return data.history;
    },

    // Get procedure catalog for a specialty
    async getProcedureCatalog(specialtyId: string): Promise<ProcedureCatalog[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/procedure-catalog`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al obtener catálogo de procedimientos');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener catálogo');
        }

        return data.catalog;
    },

    // Create procedure catalog entry
    async createProcedureCatalogEntry(specialtyId: string, entry: Partial<ProcedureCatalog>): Promise<ProcedureCatalog> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/procedure-catalog`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al crear procedimiento');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al crear procedimiento');
        }

        return data.procedure;
    },

    // Update procedure catalog entry
    async updateProcedureCatalogEntry(catalogId: string, entry: Partial<ProcedureCatalog>): Promise<ProcedureCatalog> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/procedure-catalog/${catalogId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al actualizar procedimiento');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al actualizar procedimiento');
        }

        return data.procedure;
    },

    // Delete procedure catalog entry
    async deleteProcedureCatalogEntry(catalogId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/procedure-catalog/${catalogId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al eliminar procedimiento');
        }
    },

    // Search for similar specialties with procedures configured
    async findSimilarSpecialties(name: string): Promise<SimilarSpecialtyResult[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/specialties/similar?name=${encodeURIComponent(name)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            throw new Error('Error al buscar especialidades similares');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al buscar especialidades similares');
        }

        return data.results;
    },

    // Copy procedure catalog from one cohort to another
    async copyCohortConfiguration(sourceCohortId: string, targetCohortId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/becado/cohorts/${targetCohortId}/procedure-catalog/copy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sourceCohortId }),
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al copiar configuración');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Error al copiar configuración');
        }
    },

    // Get evaluations for a scholar by RUT
    async getScholarEvaluations(rut: string): Promise<ScholarEvaluation[]> {
        const token = authService.getToken();
        // Normalize RUT: remove dots, dashes, and spaces for consistent lookup
        const normalizedRut = rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();

        const response = await fetch(`${API_URL}/evaluaciones/students/${encodeURIComponent(normalizedRut)}/evaluations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        await checkAuthResponse(response);

        if (!response.ok) {
            if (response.status === 404) {
                return []; // No evaluations found
            }
            throw new Error('Error al obtener evaluaciones del becado');
        }

        const data = await response.json();
        if (!data.success) {
            return [];
        }

        // Map the response to our interface (backend returns data.data, not data.evaluations)
        const evaluations = data.data || data.evaluations || [];
        return evaluations.map((ev: any) => ({
            id: ev.id,
            doctorName: ev.doctorName || 'Doctor',
            rubricName: ev.rubricName || 'Rúbrica',
            date: ev.createdAt || ev.date,
            score: ev.totalScore || 0,
            maxScore: ev.maxScore || 100,
            status: ev.status || 'completed',
            criteria: (ev.responses || []).map((r: any) => ({
                name: r.criterionName || r.name,
                selectedOption: r.selectedOption || r.label,
                points: r.points || 0
            })),
            comments: ev.comments
        }));
    }
};
