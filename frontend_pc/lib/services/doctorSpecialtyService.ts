import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface DoctorSpecialtyAssignment {
    id: string;
    doctorId: string;
    specialtyId: string;
    assignedAt: string;
}

export const doctorSpecialtyService = {
    /**
     * Get all specialties assigned to a doctor
     */
    async getAssignedSpecialties(doctorId: string): Promise<DoctorSpecialtyAssignment[]> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/doctors/${doctorId}/specialties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener especialidades asignadas');
        }

        const data = await response.json();
        return data.assignments;
    },

    /**
     * Assign a single specialty to a doctor
     */
    async assignSpecialty(doctorId: string, specialtyId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/doctors/${doctorId}/specialties/${specialtyId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al asignar especialidad');
        }
    },

    /**
     * Remove a single specialty from a doctor
     */
    async removeSpecialty(doctorId: string, specialtyId: string): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/doctors/${doctorId}/specialties/${specialtyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al remover especialidad');
        }
    },

    /**
     * Replace all specialty assignments for a doctor
     */
    async replaceAssignments(doctorId: string, specialtyIds: string[]): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_URL}/doctors/${doctorId}/specialties`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ specialtyIds }),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar especialidades');
        }
    },
};
