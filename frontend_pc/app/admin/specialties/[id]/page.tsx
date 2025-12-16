'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { specialtyService, Specialty, Cohort, JefeEspecialidadData } from '@/lib/services/specialtyService';
import { doctorCohortService, DoctorCohortAssignment } from '@/lib/services/doctorCohortService';
import { userService, User } from '@/lib/services/userService';

// Helper para formatear fecha a YYYY-MM-DD
const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

// Helper para obtener color del badge según status
const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' };
    case 'upcoming':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Próximo' };
    case 'completed':
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completado' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Sin fechas' };
  }
};

export default function AdminSpecialtyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [jefes, setJefes] = useState<JefeEspecialidadData[]>([]);
  const [allJefes, setAllJefes] = useState<User[]>([]);
  const [allAssignments, setAllAssignments] = useState<JefeEspecialidadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'cohorts' | 'jefes'>('users');
  const [newCohortYear, setNewCohortYear] = useState<number>(new Date().getFullYear());
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [selectedJefe, setSelectedJefe] = useState<string>('');
  const [assigningJefe, setAssigningJefe] = useState(false);

  // Estado para modal de edición de corte
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [savingCohort, setSavingCohort] = useState(false);

  // Estado para modal de edición de cohortes de doctor
  const [editingDoctorCohorts, setEditingDoctorCohorts] = useState<{
    doctorId: string;
    userId: string;
    fullName: string;
  } | null>(null);
  const [doctorAssignedCohortIds, setDoctorAssignedCohortIds] = useState<string[]>([]);
  const [loadingDoctorCohorts, setLoadingDoctorCohorts] = useState(false);
  const [savingDoctorCohorts, setSavingDoctorCohorts] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const specialties = await specialtyService.getSpecialties();
        const found = specialties.find(s => s.id === id);
        if (found) setSpecialty(found);

        const cohortsData = await specialtyService.getCohorts(id);
        setCohorts(cohortsData);

        const usersData = await specialtyService.getUsers(id);
        setUsers(usersData);

        // Cargar jefes asignados a esta especialidad
        const jefesData = await specialtyService.getJefesBySpecialty(id);
        setJefes(jefesData);

        // Cargar todos los usuarios jefe para el selector
        const allUsers = await userService.getAll();
        const jefesOnly = allUsers.filter(u => u.role === 'jefe_especialidad');
        setAllJefes(jefesOnly);

        // Cargar todas las asignaciones para filtrar jefes ya asignados
        const assignments = await specialtyService.getAllJefeAssignments();
        setAllAssignments(assignments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleCreateCohort = async () => {
    if (!newCohortYear) return;
    setCreatingCohort(true);
    try {
      await specialtyService.createCohort(id, newCohortYear);
      // Refresh cohorts
      const cohortsData = await specialtyService.getCohorts(id);
      setCohorts(cohortsData);
      setNewCohortYear(newCohortYear + 1);
    } catch (error) {
      console.error(error);
      alert('Error al crear corte');
    } finally {
      setCreatingCohort(false);
    }
  };

  const handleAssignJefe = async () => {
    if (!selectedJefe) return;
    setAssigningJefe(true);
    try {
      await specialtyService.assignJefe(selectedJefe, id);
      // Refresh jefes list, all assignments, and users (participantes)
      const [jefesData, assignments, usersData] = await Promise.all([
        specialtyService.getJefesBySpecialty(id),
        specialtyService.getAllJefeAssignments(),
        specialtyService.getUsers(id)
      ]);
      setJefes(jefesData);
      setAllAssignments(assignments);
      setUsers(usersData);
      setSelectedJefe('');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al asignar jefe');
    } finally {
      setAssigningJefe(false);
    }
  };

  const handleUnassignJefe = async (userId: string) => {
    if (!confirm('¿Estás seguro de desasignar este jefe de la especialidad?')) return;
    try {
      await specialtyService.unassignJefe(userId, id);
      // Refresh jefes list, all assignments, and users (participantes)
      const [jefesData, assignments, usersData] = await Promise.all([
        specialtyService.getJefesBySpecialty(id),
        specialtyService.getAllJefeAssignments(),
        specialtyService.getUsers(id)
      ]);
      setJefes(jefesData);
      setAllAssignments(assignments);
      setUsers(usersData);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al desasignar jefe');
    }
  };

  // Filtrar jefes que NO están ya asignados a ESTA especialidad específica
  // Un jefe puede tener múltiples especialidades (ej: mismo nombre, diferentes años)
  const availableJefes = allJefes.filter(
    jefe => !jefes.some(j => j.userId === jefe.id)
  );

  // Funciones para editar cohort
  const openEditCohortModal = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setEditStartDate(formatDateForInput(cohort.startDate));
    setEditEndDate(formatDateForInput(cohort.endDate));
  };

  const closeEditCohortModal = () => {
    setEditingCohort(null);
    setEditStartDate('');
    setEditEndDate('');
  };

  const handleSaveCohortDates = async () => {
    if (!editingCohort) return;

    if (!editStartDate || !editEndDate) {
      alert('Por favor ingresa ambas fechas');
      return;
    }

    const start = new Date(editStartDate);
    const end = new Date(editEndDate);

    if (end <= start) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setSavingCohort(true);
    try {
      await specialtyService.updateCohort(editingCohort.id, editStartDate, editEndDate);
      // Refresh cohorts
      const cohortsData = await specialtyService.getCohorts(id);
      setCohorts(cohortsData);
      closeEditCohortModal();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar las fechas del corte');
    } finally {
      setSavingCohort(false);
    }
  };

  // Funciones para editar cohortes de doctor
  const openDoctorCohortsModal = async (user: any) => {
    // El campo 'id' en users es el doctorProfile.id para doctores
    // y el campo 'userId' es el auth user id
    const doctorId = user.id;

    setEditingDoctorCohorts({
      doctorId,
      userId: user.userId,
      fullName: user.fullName
    });
    setLoadingDoctorCohorts(true);

    try {
      const assignments = await doctorCohortService.getDoctorCohorts(doctorId);

      // Filter to only include cohorts that belong to THIS specialty
      // This prevents showing counts/checks for cohorts from other specialties
      const currentSpecialtyCohortIds = cohorts.map(c => c.id);
      const filteredAssignments = assignments.filter(a =>
        currentSpecialtyCohortIds.includes(a.cohortId)
      );

      setDoctorAssignedCohortIds(filteredAssignments.map(a => a.cohortId));
    } catch (error) {
      console.error('Error loading doctor cohorts:', error);
      setDoctorAssignedCohortIds([]);
    } finally {
      setLoadingDoctorCohorts(false);
    }
  };

  const closeDoctorCohortsModal = () => {
    setEditingDoctorCohorts(null);
    setDoctorAssignedCohortIds([]);
  };

  const handleDoctorCohortToggle = (cohortId: string) => {
    setDoctorAssignedCohortIds(prev =>
      prev.includes(cohortId)
        ? prev.filter(id => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const handleSelectAllDoctorCohorts = () => {
    if (doctorAssignedCohortIds.length === cohorts.length) {
      setDoctorAssignedCohortIds([]);
    } else {
      setDoctorAssignedCohortIds(cohorts.map(c => c.id));
    }
  };

  const handleSaveDoctorCohorts = async () => {
    if (!editingDoctorCohorts || !specialty) return;

    setSavingDoctorCohorts(true);
    try {
      await doctorCohortService.updateSpecialtyCohorts(editingDoctorCohorts.doctorId, specialty.id, doctorAssignedCohortIds);
      closeDoctorCohortsModal();
      // Mostrar feedback de éxito
      alert('Cohortes asignados correctamente');
    } catch (error: any) {
      console.error('Error saving doctor cohorts:', error);
      alert(error.message || 'Error al guardar los cohortes');
    } finally {
      setSavingDoctorCohorts(false);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!specialty) return <div className="p-6">Especialidad no encontrada</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/specialties')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <span className="mr-2">←</span>
          Volver a Especialidades
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{specialty.name}{specialty.startYear ? ` (${specialty.startYear})` : ''}</h1>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'users'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center">
            <span className="mr-2">👥</span>
            Participantes
          </div>
        </button>
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'jefes'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('jefes')}
        >
          <div className="flex items-center">
            <span className="mr-2">👔</span>
            Jefes de Especialidad
          </div>
        </button>
        <button
          className={`pb-2 px-4 font-medium ${activeTab === 'cohorts'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('cohorts')}
        >
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            Cortes (Cohorts)
          </div>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Doctores y Becados</h2>
            <button
              onClick={() => router.push(`/admin/users/new?specialtyId=${id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
            >
              <span className="mr-2">+</span>
              Crear Usuario
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay usuarios asignados a esta especialidad.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.photoUrl ? (
                          <img className="h-8 w-8 rounded-full mr-3" src={user.photoUrl} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-500">{user.fullName.charAt(0)}</span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.rut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'jefe_especialidad' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'doctor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role === 'jefe_especialidad' ? 'Jefe de Especialidad' :
                          user.role === 'doctor' ? 'Doctor' : 'Becado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.role === 'doctor' && (
                        <button
                          onClick={() => openDoctorCohortsModal(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          title="Configurar cohortes que puede evaluar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Cohortes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="space-y-6">
          {(!specialty.cohortCount) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Corte</h3>
              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="number"
                    value={newCohortYear}
                    onChange={(e) => setNewCohortYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleCreateCohort}
                  disabled={creatingCohort}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <span className="mr-2">+</span>
                  Crear Corte
                </button>
              </div>
            </div>
          )}

          {specialty.cohortCount && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
              <p>Esta especialidad tiene definidas <strong>{specialty.cohortCount}</strong> cortes a partir del año <strong>{specialty.startYear}</strong>.</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Cortes Existentes</h2>
              <p className="text-sm text-gray-500 mt-1">Haz clic en ⚙️ para configurar las fechas del período académico</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {cohorts.length === 0 ? (
                <li className="p-6 text-center text-gray-500">No hay cortes registradas.</li>
              ) : (
                cohorts.sort((a, b) => b.year - a.year).map((cohort) => {
                  const statusBadge = getStatusBadge(cohort.status);
                  return (
                    <li key={cohort.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="mr-3 text-xl">📅</span>
                          <div>
                            <span className="text-lg font-medium text-gray-900">Corte {cohort.year}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                              </span>
                              {cohort.startDate && cohort.endDate && (
                                <span className="text-xs text-gray-500">
                                  {new Date(cohort.startDate).toLocaleDateString('es-CL')} - {new Date(cohort.endDate).toLocaleDateString('es-CL')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditCohortModal(cohort)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Configurar fechas del corte"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* Modal para editar fechas del corte */}
          {editingCohort && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configurar Corte {editingCohort.year}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Define el período en que los becados pueden subir evidencias
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Los becados pueden comenzar a subir evidencias desde esta fecha
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Después de esta fecha el corte estará cerrado
                    </p>
                  </div>

                  {/* Preview del estado */}
                  {editStartDate && editEndDate && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Estado actual:</strong>{' '}
                        {(() => {
                          const now = new Date();
                          const start = new Date(editStartDate);
                          const end = new Date(editEndDate);
                          if (now < start) return <span className="text-yellow-600">Próximo</span>;
                          if (now > end) return <span className="text-gray-600">Completado</span>;
                          return <span className="text-green-600">Activo</span>;
                        })()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={closeEditCohortModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCohortDates}
                    disabled={savingCohort}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {savingCohort ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Fechas'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jefes' && (
        <div className="space-y-6">
          {/* Asignar nuevo jefe */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar Jefe de Especialidad</h3>
            {availableJefes.length === 0 ? (
              <div className="text-gray-500">
                <p>No hay jefes disponibles para asignar.</p>
                <button
                  onClick={() => router.push('/admin/users/new')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Crear nuevo usuario con rol Jefe de Especialidad
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Jefe</label>
                  <select
                    value={selectedJefe}
                    onChange={(e) => setSelectedJefe(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option key="empty" value="">-- Seleccionar --</option>
                    {availableJefes.map((jefe) => (
                      <option key={jefe.id} value={jefe.id} className="text-gray-900">
                        {jefe.fullName} ({jefe.rut})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignJefe}
                  disabled={!selectedJefe || assigningJefe}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  <span className="mr-2">+</span>
                  Asignar
                </button>
              </div>
            )}
          </div>

          {/* Lista de jefes asignados */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Jefes Asignados</h2>
            </div>
            {jefes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay jefes asignados a esta especialidad.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {jefes.map((jefe) => {
                  const jefeUser = allJefes.find(u => u.id === jefe.userId);
                  return (
                    <li key={jefe.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                          <span className="text-purple-600 font-medium">
                            {jefeUser?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{jefeUser?.fullName || 'Usuario no encontrado'}</p>
                          <p className="text-sm text-gray-500">{jefeUser?.rut || jefe.userId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnassignJefe(jefe.userId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Desasignar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal para editar cohortes de doctor */}
      {editingDoctorCohorts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Configurar Cohortes para {editingDoctorCohorts.fullName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Seleccione los cohortes que este doctor podrá evaluar
              </p>
            </div>

            <div className="p-6">
              {loadingDoctorCohorts ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600">Cargando cohortes...</span>
                </div>
              ) : cohorts.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
                  No hay cohortes disponibles para esta especialidad.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {doctorAssignedCohortIds.length} de {cohorts.length} cohortes seleccionados
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllDoctorCohorts}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {doctorAssignedCohortIds.length === cohorts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {cohorts
                      .sort((a, b) => a.year - b.year)
                      .map(cohort => (
                        <label
                          key={cohort.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${doctorAssignedCohortIds.includes(cohort.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={doctorAssignedCohortIds.includes(cohort.id)}
                            onChange={() => handleDoctorCohortToggle(cohort.id)}
                            className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="font-medium">Cohorte {cohort.year}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeDoctorCohortsModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDoctorCohorts}
                disabled={savingDoctorCohorts || loadingDoctorCohorts}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {savingDoctorCohorts ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
