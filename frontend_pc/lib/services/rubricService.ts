import { authService } from '../auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface RubricLevel {
  id?: number | string;
  nombre: string; // label
  descripcion: string;
  puntaje: number;
}

export interface RubricCriterion {
  id?: number | string;
  nombre: string; // title
  descripcion: string;
  niveles: RubricLevel[];
}

export interface Rubric {
  id?: string;
  nombre: string;
  descripcion: string;
  specialty?: string;
  specialtyId?: string;
  criterios: RubricCriterion[];
}

// Helper to convert frontend format to backend format
const toBackendPayload = (rubric: Rubric) => ({
  name: rubric.nombre,
  description: rubric.descripcion,
  specialty: rubric.specialty,
  specialtyId: rubric.specialtyId,
  criteria: rubric.criterios.map((c, index) => ({
    key: `criterion_${index}_${Date.now()}`,
    title: c.nombre,
    description: c.descripcion,
    sortOrder: index,
    options: c.niveles.map((n, nIndex) => ({
      value: `${n.puntaje}`,
      label: n.nombre,
      description: n.descripcion,
      points: Number(n.puntaje),
      sortOrder: nIndex
    }))
  }))
});

// Helper to convert backend format to frontend format
const fromBackendFormat = (r: any): Rubric => ({
  id: r.id,
  nombre: r.name,
  descripcion: r.description,
  specialty: r.specialty,
  criterios: r.criteria.map((c: any) => ({
    id: c.id || c.key,
    nombre: c.name || c.title,
    descripcion: c.description,
    niveles: c.options.map((o: any) => ({
      id: o.value,
      nombre: o.label,
      descripcion: o.description,
      puntaje: o.points
    }))
  }))
});

export const rubricService = {
  async getAll(specialtyId?: string): Promise<Rubric[]> {
    const token = authService.getToken();
    let url = `${API_URL}/evaluaciones/rubrics`;
    if (specialtyId) {
      url += `?specialtyId=${encodeURIComponent(specialtyId)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener rúbricas');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener rúbricas');
    }

    return data.data.map(fromBackendFormat);
  },

  async getById(id: string): Promise<Rubric> {
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/evaluaciones/rubrics/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener rúbrica');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Error al obtener rúbrica');
    }

    return fromBackendFormat(data.data);
  },

  async create(rubric: Rubric): Promise<void> {
    const token = authService.getToken();

    const payload = toBackendPayload(rubric);

    const response = await fetch(`${API_URL}/evaluaciones/rubrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear rúbrica');
    }
  },

  async update(id: string, rubric: Rubric): Promise<void> {
    const token = authService.getToken();

    const payload = toBackendPayload(rubric);

    const response = await fetch(`${API_URL}/evaluaciones/rubrics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar rúbrica');
    }
  },

  async delete(id: string): Promise<void> {
    const token = authService.getToken();

    const response = await fetch(`${API_URL}/evaluaciones/rubrics/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar rúbrica');
    }
  }
};
