'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { specialtyService, SimilarSpecialtyResult, CohortWithProcedureCount } from '@/lib/services/specialtyService';

export default function AdminSpecialtyCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [cohortCount, setCohortCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para especialidades similares
  const [similarSpecialties, setSimilarSpecialties] = useState<SimilarSpecialtyResult[]>([]);
  const [searchingSpecialties, setSearchingSpecialties] = useState(false);
  const [selectedImports, setSelectedImports] = useState<Map<number, string>>(new Map()); // cohortIndex -> sourceCohortId

  // Debounce search for similar specialties
  const searchSimilar = useCallback(async (searchName: string) => {
    if (!searchName.trim() || searchName.length < 3) {
      setSimilarSpecialties([]);
      return;
    }

    setSearchingSpecialties(true);
    try {
      const results = await specialtyService.findSimilarSpecialties(searchName);
      setSimilarSpecialties(results);
    } catch (err) {
      console.error('Error searching similar specialties:', err);
      setSimilarSpecialties([]);
    } finally {
      setSearchingSpecialties(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSimilar(name);
    }, 500);

    return () => clearTimeout(timer);
  }, [name, searchSimilar]);

  // Toggle selection for a cohort import
  const toggleImport = (cohortIndex: number, sourceCohortId: string) => {
    setSelectedImports(prev => {
      const newMap = new Map(prev);
      if (newMap.get(cohortIndex) === sourceCohortId) {
        newMap.delete(cohortIndex);
      } else {
        newMap.set(cohortIndex, sourceCohortId);
      }
      return newMap;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Crear la especialidad
      const newSpecialty = await specialtyService.createSpecialty(name, startYear, cohortCount);
      
      // Si hay importaciones seleccionadas, copiar procedimientos
      if (selectedImports.size > 0 && newSpecialty.cohorts && newSpecialty.cohorts.length > 0) {
        // Obtener los cohortes recién creados
        const newCohorts = await specialtyService.getCohorts(newSpecialty.id);
        
        // Para cada importación seleccionada, copiar procedimientos
        for (const [cohortIndex, sourceCohortId] of selectedImports) {
          const targetCohort = newCohorts[cohortIndex];
          if (targetCohort) {
            try {
              await specialtyService.copyCohortConfiguration(sourceCohortId, targetCohort.id);
            } catch (copyErr) {
              console.error(`Error copying procedures to cohort ${cohortIndex + 1}:`, copyErr);
              // Continue with other imports even if one fails
            }
          }
        }
      }
      
      router.push('/admin/specialties');
    } catch (err) {
      console.error('Error creating specialty:', err);
      setError('Error al crear la especialidad. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Generate cohort years based on startYear and cohortCount
  const cohortYears = Array.from({ length: cohortCount }, (_, i) => startYear + i);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <span className="mr-2">←</span>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Especialidad</h1>
        <p className="text-gray-500">Ingrese los datos para crear una nueva especialidad médica.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre de la Especialidad
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Ej: Traumatología"
              required
            />
            {searchingSpecialties && (
              <p className="mt-1 text-sm text-gray-400">Buscando especialidades similares...</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startYear" className="block text-sm font-semibold text-gray-900 mb-2">
                Año de Inicio
              </label>
              <input
                type="number"
                id="startYear"
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="cohortCount" className="block text-sm font-semibold text-gray-900 mb-2">
                Cantidad de Cortes
              </label>
              <input
                type="number"
                id="cohortCount"
                value={cohortCount}
                onChange={(e) => setCohortCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          {/* Sección de importación de procedimientos */}
          {similarSpecialties.length > 0 && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-md font-semibold text-blue-900 mb-2">
                📋 Importar Procedimientos Mínimos
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Se encontraron especialidades similares con procedimientos configurados. 
                Puede importar la configuración de procedimientos para cada corte.
              </p>

              <div className="space-y-4">
                {cohortYears.map((year, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border border-blue-100">
                    <p className="font-medium text-gray-800 mb-2">Corte {index + 1} (Año {year})</p>
                    
                    <div className="space-y-2">
                      {similarSpecialties.map((result) => (
                        <div key={result.specialty.id} className="ml-2">
                          <p className="text-sm text-gray-600 font-medium">
                            {result.specialty.name} ({result.specialty.startYear})
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1 ml-2">
                            {result.cohortsWithProcedures.map((cohort) => (
                              <button
                                key={cohort.id}
                                type="button"
                                onClick={() => toggleImport(index, cohort.id)}
                                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                  selectedImports.get(index) === cohort.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Corte {cohort.year} ({cohort.procedureCount} procedimientos)
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedImports.has(index) && (
                      <p className="mt-2 text-xs text-green-600">
                        ✓ Se importarán procedimientos al crear
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 mr-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Especialidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
