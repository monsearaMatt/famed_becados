// Service for Minimum Procedure Catalog management

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface MinimumProcedure {
  id: string;
  cohortId: string;
  specialtyId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  targetCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcedureInput {
  name: string;
  description?: string | null;
  category?: string | null;
  targetCount: number;
}

export interface UpdateProcedureInput {
  name?: string;
  description?: string | null;
  category?: string | null;
  targetCount?: number;
  isActive?: boolean;
}

export interface CopyConfigResult {
  success: boolean;
  message: string;
  copiedCount: number;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const procedureService = {
  // Get procedure catalog for a specific cohort
  async getCatalogByCohort(cohortId: string): Promise<MinimumProcedure[]> {
    const response = await fetch(`${API_URL}/becado/cohorts/${cohortId}/procedure-catalog`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el catálogo de procedimientos');
    }

    const data = await response.json();
    return data.catalog || [];
  },

  // Get procedure catalog for a specialty (legacy)
  async getCatalogBySpecialty(specialtyId: string): Promise<MinimumProcedure[]> {
    const response = await fetch(`${API_URL}/becado/specialties/${specialtyId}/procedure-catalog`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el catálogo de procedimientos');
    }

    const data = await response.json();
    return data.catalog || [];
  },

  // Create a new procedure in the cohort catalog
  async createProcedure(cohortId: string, data: CreateProcedureInput): Promise<MinimumProcedure> {
    const response = await fetch(`${API_URL}/becado/cohorts/${cohortId}/procedure-catalog`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el procedimiento');
    }

    const result = await response.json();
    return result.procedure;
  },

  // Update a procedure in the catalog
  async updateProcedure(procedureId: string, data: UpdateProcedureInput): Promise<MinimumProcedure> {
    const response = await fetch(`${API_URL}/becado/procedure-catalog/${procedureId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el procedimiento');
    }

    const result = await response.json();
    return result.procedure;
  },

  // Delete a procedure from the catalog
  async deleteProcedure(procedureId: string): Promise<void> {
    const response = await fetch(`${API_URL}/becado/procedure-catalog/${procedureId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar el procedimiento');
    }
  },

  // Copy procedure configuration from another cohort
  async copyConfiguration(targetCohortId: string, sourceCohortId: string): Promise<CopyConfigResult> {
    const response = await fetch(`${API_URL}/becado/cohorts/${targetCohortId}/procedure-catalog/copy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sourceCohortId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al copiar la configuración');
    }

    return response.json();
  },
};
