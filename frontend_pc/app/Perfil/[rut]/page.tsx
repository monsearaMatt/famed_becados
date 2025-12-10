"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { userService, User } from "@/lib/services/userService";
import { evaluationService, Evaluation } from "@/lib/services/evaluationService";
import { profileService, ProfileUser } from "@/lib/services/profileService";
import { specialtyService, JefeEspecialidadData } from "@/lib/services/specialtyService";
import { useAuth } from "@/hooks/useAuth";

export default function PerfilUsuario() {
    const params = useParams();
    const rut = params.rut as string;
    const { user: currentUser } = useAuth();
    const [usuario, setUsuario] = useState<User | null>(null);
    const [scholarProfile, setScholarProfile] = useState<ProfileUser | null>(null);
    const [jefeSpecialties, setJefeSpecialties] = useState<JefeEspecialidadData[]>([]);
    const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Quota management state
    const [isEditingQuota, setIsEditingQuota] = useState(false);
    const [newQuota, setNewQuota] = useState<string>("");
    const [quotaUnit, setQuotaUnit] = useState<string>("MB");
    const [quotaError, setQuotaError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userService.getByRut(rut);
                setUsuario(data);
                
                // If user is becado, fetch detailed profile for quota info
                if (data.role === 'becado') {
                    // We need the userId from the user data to fetch the profile
                    if (data.id) {
                        const profile = await profileService.getProfileByUserId(data.id);
                        setScholarProfile(profile);
                    }
                }
                
                // If user is jefe_especialidad, fetch their assigned specialties
                if (data.role === 'jefe_especialidad' && data.id) {
                    const specialties = await specialtyService.getSpecialtiesByJefeUserId(data.id);
                    setJefeSpecialties(specialties);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar usuario');
            } finally {
                setLoading(false);
            }
        };

        if (rut) {
            fetchUser();
        }
    }, [rut]);

    useEffect(() => {
        const fetchEvaluations = async () => {
            if (usuario?.role === 'becado') {
                try {
                    const data = await evaluationService.getByStudentRut(rut);
                    setEvaluaciones(data);
                } catch (error) {
                    console.error('Error al cargar evaluaciones:', error);
                }
            }
        };

        if (usuario) {
            fetchEvaluations();
        }
    }, [usuario, rut]);

    const handleUpdateQuota = async () => {
        if (!scholarProfile || !usuario) return;
        
        try {
            const quotaValue = parseFloat(newQuota);
            if (isNaN(quotaValue) || quotaValue < 0) {
                setQuotaError("Ingrese un valor válido");
                return;
            }

            let multiplier = 1;
            switch (quotaUnit) {
                case "KB": multiplier = 1024; break;
                case "MB": multiplier = 1024 * 1024; break;
                case "GB": multiplier = 1024 * 1024 * 1024; break;
            }

            const quotaInBytes = Math.floor(quotaValue * multiplier);
            
            // We need the userId. If scholarProfile has userId, use it.
            await profileService.updateStorageQuota(scholarProfile.userId, quotaInBytes);
            
            // Refresh profile
            const updatedProfile = await profileService.getProfileByUserId(scholarProfile.userId);
            setScholarProfile(updatedProfile);
            setIsEditingQuota(false);
            setQuotaError(null);
            setNewQuota("");
        } catch (err) {
            setQuotaError(err instanceof Error ? err.message : "Error al actualizar cuota");
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6]"></div>
            </div>
        );
    }

    if (error || !usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
                <div className="text-red-500 text-xl mb-4">{error || 'Usuario no encontrado'}</div>
                <Navbar title="Perfil" subtitle="Error" />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            <Navbar title="Perfil de Usuario" subtitle="Detalle" />

            {/* Contenedor principal */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white shadow-2xl w-full max-w-4xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    
                    <div className="w-1/3 bg-gradient-to-b from-[#3FD0B6] to-[#2A9D8F] p-8 flex flex-col items-center justify-center rounded-l-3xl">
                        <div className="text-center">
                            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30 backdrop-blur-sm">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#2A9D8F]">
                                    {usuario.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <h2 className="text-white text-xl font-semibold mb-2">{usuario.fullName}</h2>
                            <p className="text-white/80 text-sm capitalize">{usuario.role}</p>
                        </div>
                    </div>

                    
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header del perfil */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Perfil de Usuario</h1>
                            <p className="text-gray-600">Información detallada</p>
                        </div>

                        {/* Información del perfil*/}
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                        <span className="text-[#3FD0B6] text-xl">👤</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Nombre Completo
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                            {usuario.fullName}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            RUT
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                            {usuario.rut}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Rol
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent capitalize">
                                            {usuario.role}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Fecha de Registro
                                        </label>
                                        <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                            {new Date(usuario.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Especialidades Asignadas (Solo para Jefes de Especialidad) */}
                            {usuario.role === 'jefe_especialidad' && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <span className="text-purple-600 text-xl">👔</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Especialidades a Cargo</h3>
                                    </div>
                                    
                                    {jefeSpecialties.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            No tiene especialidades asignadas.
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {jefeSpecialties.map((spec) => (
                                                <div 
                                                    key={spec.id} 
                                                    className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-2 rounded-xl font-medium text-sm flex items-center"
                                                >
                                                    <span className="mr-2">🏥</span>
                                                    {spec.specialtyName}
                                                    {spec.startYear && (
                                                        <span className="ml-2 bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                                                            {spec.startYear}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Información Académica (Solo para Becados) */}
                            {usuario.role === 'becado' && scholarProfile && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                            <span className="text-[#3FD0B6] text-xl">🎓</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Información Académica</h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                                Especialidad
                                            </label>
                                            <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                {(scholarProfile as any).specialty || 'Sin asignar'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                                Año de Ingreso / Cohorte
                                            </label>
                                            <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                {(scholarProfile as any).scholarshipStartYear || (scholarProfile as any).cohort || 'Sin asignar'}
                                            </div>
                                        </div>

                                        {(scholarProfile as any).hospital && (
                                            <div>
                                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                                    Hospital
                                                </label>
                                                <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                    {(scholarProfile as any).hospital}
                                                </div>
                                            </div>
                                        )}

                                        {(scholarProfile as any).scholarshipSupervisor && (
                                            <div>
                                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                                    Tutor / Supervisor
                                                </label>
                                                <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                    {(scholarProfile as any).scholarshipSupervisor}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Storage Quota Section (Only for Becados and visible to Admins) */}
                            {usuario.role === 'becado' && scholarProfile && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                            <span className="text-[#3FD0B6] text-xl">💾</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Almacenamiento</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-gray-700 text-sm font-medium">
                                                Almacenamiento de Evidencia
                                            </label>
                                            {currentUser?.rol === 'admin' && (
                                                <button 
                                                    onClick={() => setIsEditingQuota(!isEditingQuota)}
                                                    className="text-sm text-[#2A9D8F] hover:text-[#3FD0B6] font-medium"
                                                >
                                                    {isEditingQuota ? 'Cancelar' : 'Editar Cuota'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                            <div 
                                                className="bg-[#3FD0B6] h-2.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min(100, ((scholarProfile.usedStorage || 0) / (scholarProfile.storageQuota || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Uso: {formatBytes(scholarProfile.usedStorage || 0)}</span>
                                            <span>Límite: {formatBytes(scholarProfile.storageQuota || 0)}</span>
                                        </div>

                                        {isEditingQuota && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <label className="block text-xs font-medium text-gray-700 mb-2">Nueva Cuota</label>
                                                <div className="flex space-x-2">
                                                    <input 
                                                        type="number" 
                                                        value={newQuota}
                                                        onChange={(e) => setNewQuota(e.target.value)}
                                                        placeholder="Ej: 500"
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6]"
                                                    />
                                                    <select 
                                                        value={quotaUnit}
                                                        onChange={(e) => setQuotaUnit(e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6]"
                                                    >
                                                        <option value="MB">MB</option>
                                                        <option value="GB">GB</option>
                                                    </select>
                                                    <button 
                                                        onClick={handleUpdateQuota}
                                                        className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#238276] transition-colors"
                                                    >
                                                        Guardar
                                                    </button>
                                                </div>
                                                {quotaError && (
                                                    <p className="text-red-500 text-xs mt-2">{quotaError}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Historial Académico (Solo para Becados) */}
                            {usuario.role === 'becado' && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                            <span className="text-[#3FD0B6] text-xl">📚</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Historial Académico</h3>
                                    </div>
                                    
                                    {evaluaciones.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            No hay evaluaciones registradas.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {evaluaciones.map((evaluacion) => (
                                                <div key={evaluacion.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{evaluacion.rotation || 'Rotación General'}</h4>
                                                            <p className="text-sm text-gray-500">Evaluado por: {evaluacion.evaluatorRole || 'Doctor'}</p>
                                                        </div>
                                                        <div className="bg-[#3FD0B6]/20 text-[#2A9D8F] px-3 py-1 rounded-full font-bold text-sm">
                                                            {evaluacion.totalPoints} pts
                                                        </div>
                                                    </div>
                                                    {evaluacion.comments && (
                                                        <p className="text-gray-600 text-sm mt-2 italic">"{evaluacion.comments}"</p>
                                                    )}
                                                    <div className="mt-3 text-xs text-gray-400 text-right">
                                                        {new Date(evaluacion.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
