"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar, { SELECTED_SPECIALTY_KEY } from "@/components/Navbar";
import { profileService, ProfileUser } from "@/lib/services/profileService";
import { specialtyService, Cohort } from "@/lib/services/specialtyService";
import { doctorCohortService } from "@/lib/services/doctorCohortService";

export default function ListaBecados() {
    const router = useRouter();
    const [users, setUsers] = useState<ProfileUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [specialtyName, setSpecialtyName] = useState<string>("");
    
    const [mostrarPopupNavegacion, setMostrarPopupNavegacion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<ProfileUser | null>(null);

    // Estado para editar cohortes de doctor
    const [editingDoctorCohorts, setEditingDoctorCohorts] = useState<{
        doctorId: string;
        fullName: string;
    } | null>(null);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [doctorAssignedCohortIds, setDoctorAssignedCohortIds] = useState<string[]>([]);
    const [loadingCohorts, setLoadingCohorts] = useState(false);
    const [savingCohorts, setSavingCohorts] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get specialtyId from localStorage
            const selectedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
            const data = await profileService.getSpecialtyUsers(selectedSpecialtyId || undefined);
            setUsers(data);
            
            // Set specialty name from first user if available
            if (data.length > 0 && data[0].specialty) {
                setSpecialtyName(data[0].specialty);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Listen for specialty changes from Navbar
    useEffect(() => {
        const handleSpecialtyChange = () => {
            fetchUsers();
        };

        window.addEventListener('specialtyChanged', handleSpecialtyChange);
        return () => {
            window.removeEventListener('specialtyChanged', handleSpecialtyChange);
        };
    }, [fetchUsers]);

    const abrirPopupNavegacion = (user: ProfileUser) => {
        setUsuarioSeleccionado(user);
        setMostrarPopupNavegacion(true);
    };

    const cerrarPopupNavegacion = () => {
        setMostrarPopupNavegacion(false);
        setUsuarioSeleccionado(null);
    };

    const navegarA = (ruta: string) => {
        if (ruta === "/Perfil" && usuarioSeleccionado) {
            // Clean RUT before navigation (remove dots and hyphens)
            const cleanRut = usuarioSeleccionado.rut.replace(/\./g, '').replace(/-/g, '');
            router.push(`/Perfil/${cleanRut}`);
        } else {
            router.push(ruta);
        }
        cerrarPopupNavegacion();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'becado': return 'bg-blue-100 text-blue-800';
            case 'doctor': return 'bg-green-100 text-green-800';
            case 'jefe_especialidad': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Funciones para editar cohortes de doctor
    const openDoctorCohortsModal = async (user: ProfileUser) => {
        const selectedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
        if (!selectedSpecialtyId) {
            alert('Por favor selecciona una especialidad primero');
            return;
        }

        setEditingDoctorCohorts({
            doctorId: user.id,
            fullName: user.fullName
        });
        setLoadingCohorts(true);
        
        try {
            // Cargar cohortes de la especialidad
            const specialtyCohorts = await specialtyService.getCohorts(selectedSpecialtyId);
            setCohorts(specialtyCohorts);
            
            // Cargar cohortes asignados al doctor
            const assignments = await doctorCohortService.getDoctorCohorts(user.id);
            setDoctorAssignedCohortIds(assignments.map(a => a.cohortId));
        } catch (error) {
            console.error('Error loading cohorts:', error);
            setCohorts([]);
            setDoctorAssignedCohortIds([]);
        } finally {
            setLoadingCohorts(false);
        }
    };

    const closeDoctorCohortsModal = () => {
        setEditingDoctorCohorts(null);
        setCohorts([]);
        setDoctorAssignedCohortIds([]);
    };

    const handleCohortToggle = (cohortId: string) => {
        setDoctorAssignedCohortIds(prev =>
            prev.includes(cohortId)
                ? prev.filter(id => id !== cohortId)
                : [...prev, cohortId]
        );
    };

    const handleSelectAllCohorts = () => {
        if (doctorAssignedCohortIds.length === cohorts.length) {
            setDoctorAssignedCohortIds([]);
        } else {
            setDoctorAssignedCohortIds(cohorts.map(c => c.id));
        }
    };

    const handleSaveDoctorCohorts = async () => {
        if (!editingDoctorCohorts) return;
        
        setSavingCohorts(true);
        try {
            await doctorCohortService.assignCohorts(editingDoctorCohorts.doctorId, doctorAssignedCohortIds);
            closeDoctorCohortsModal();
            alert('Cohortes asignados correctamente');
        } catch (error: any) {
            console.error('Error saving doctor cohorts:', error);
            alert(error.message || 'Error al guardar los cohortes');
        } finally {
            setSavingCohorts(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <Navbar title="Lista de Participantes" subtitle="Gestión" />

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                Lista de Participantes {specialtyName ? `- ${specialtyName}` : ''}
                            </h1>
                            <p className="text-gray-600 text-sm">Miembros del programa (Becados, Doctores, Jefes)</p>
                        </div>

                        {/* Información de estadísticas */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{users.length}</div>
                                <div className="text-sm opacity-90">Total de Usuarios</div>
                            </div>
                        </div>

                        {/* Loading / Error */}
                        {loading && <div className="text-center py-10">Cargando usuarios...</div>}
                        {error && <div className="text-center py-10 text-red-500">{error}</div>}

                        {/* Lista de usuarios */}
                        {!loading && !error && (
                            <div className="space-y-3 flex-1">
                                {/* Encabezado de la tabla */}
                                <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                    <div className="w-1/4">Nombre Completo</div>
                                    <div className="w-1/4">Especialidad</div>
                                    <div className="w-1/4">Rol</div>
                                    <div className="w-1/4">Acciones</div>
                                </div>
                                
                                {/* Usuarios */}
                                {users.map((user) => (
                                    <div 
                                        key={user.rut} 
                                        className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-1/4">
                                            <button 
                                                onClick={() => abrirPopupNavegacion(user)}
                                                className="text-gray-800 font-medium hover:text-[#3FD0B6] hover:underline transition-colors text-left flex items-center space-x-2"
                                            >
                                                <div className="w-6 h-6 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center">
                                                    <span className="text-[#3FD0B6] text-xs">👤</span>
                                                </div>
                                                <span>{user.fullName}</span>
                                            </button>
                                        </div>
                                        <div className="w-1/4">
                                            <span className="text-gray-600 text-sm">
                                                {user.specialty}
                                            </span>
                                        </div>
                                        <div className="w-1/4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="w-1/4">
                                            {user.role === 'doctor' && (
                                                <button
                                                    onClick={() => openDoctorCohortsModal(user)}
                                                    className="text-[#3FD0B6] hover:text-[#2A9D8F] font-medium flex items-center gap-1 text-sm"
                                                    title="Configurar cohortes que puede evaluar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                    </svg>
                                                    Cohortes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup de navegación */}
            {mostrarPopupNavegacion && usuarioSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {usuarioSeleccionado.fullName}
                            </h3>
                            <p className="text-gray-600 text-sm capitalize">
                                {usuarioSeleccionado.role}
                            </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <button
                                onClick={() => navegarA("/Perfil")}
                                className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#3FD0B6] hover:bg-blue-50/30 transition-all duration-300 text-left"
                            >
                                <span className="text-xl">👤</span>
                                <div>
                                    <div className="font-medium text-gray-800">Perfil</div>
                                    <div className="text-xs text-gray-500">Ver perfil completo</div>
                                </div>
                            </button>
                            {/* Removed Homepage button as it might not be relevant for viewing other users */}
                        </div>
                        
                        <div className="flex justify-center">
                            <button
                                onClick={cerrarPopupNavegacion}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para editar cohortes de doctor */}
            {editingDoctorCohorts && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                Configurar Cohortes
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {editingDoctorCohorts.fullName}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Seleccione los cohortes que este doctor podrá evaluar
                            </p>
                        </div>
                        
                        <div className="mb-6">
                            {loadingCohorts ? (
                                <div className="flex items-center justify-center py-8">
                                    <svg className="animate-spin h-8 w-8 text-[#3FD0B6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="ml-2 text-gray-600">Cargando cohortes...</span>
                                </div>
                            ) : cohorts.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-sm text-center">
                                    No hay cohortes disponibles para esta especialidad.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                            {doctorAssignedCohortIds.length} de {cohorts.length} seleccionados
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllCohorts}
                                            className="text-sm text-[#3FD0B6] hover:text-[#2A9D8F] font-medium"
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
                                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                                                        doctorAssignedCohortIds.includes(cohort.id)
                                                            ? 'border-[#3FD0B6] bg-[#3FD0B6]/10 text-[#2A9D8F]'
                                                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={doctorAssignedCohortIds.includes(cohort.id)}
                                                        onChange={() => handleCohortToggle(cohort.id)}
                                                        className="mr-2 h-4 w-4 text-[#3FD0B6] rounded focus:ring-[#3FD0B6]"
                                                    />
                                                    <span className="font-medium">Cohorte {cohort.year}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDoctorCohortsModal}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveDoctorCohorts}
                                disabled={savingCohorts || loadingCohorts}
                                className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 flex items-center"
                            >
                                {savingCohorts ? (
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
