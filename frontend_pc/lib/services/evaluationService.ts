import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface EvaluationScore {
    id: string;
    criterionKey: string;
    optionValue: string;
    points: number;
}

export interface Evaluation {
    id: string;
    evaluatorId: string;
    evaluatorRole: string | null;
    studentId: string;
    studentName: string | null;
    studentRut: string | null;
    rotation: string | null;
    rubricId: string;
    comments: string | null;
    totalPoints: number;
    status: 'DRAFT' | 'COMPLETED';
    savedAt: string;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
    scores?: EvaluationScore[];
}

export const evaluationService = {
    async getByStudentRut(rut: string): Promise<Evaluation[]> {
        const token = authService.getToken();
        if (!token) {
            // Return empty array instead of throwing for missing token
            console.warn('No autenticado - retornando evaluaciones vacías');
            return [];
        }

        try {
            const response = await fetch(`${API_URL}/evaluaciones/students/${rut}/evaluations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // Return empty array instead of throwing - endpoint might not exist yet
                console.warn('Error al obtener evaluaciones:', response.status);
                return [];
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            // Silently return empty array on network errors
            console.warn('Error de red al obtener evaluaciones:', error);
            return [];
        }
    }
};
