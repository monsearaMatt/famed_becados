"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScholarProfileModal from "@/components/ScholarProfileModal";
import { specialtyService, ScholarWithActivities, ScholarActivity } from "@/lib/services/specialtyService";

// Mapeo de tipos de actividad
const ACTIVITY_TYPES: Record<string, string> = {
    curso: 'Curso',
    congreso: 'Congreso',
    taller: 'Taller',
    seminario: 'Seminario',
    investigacion: 'Investigación',
    otro: 'Otro'
};

const getIconoTipo = (tipo: string) => {
    switch(tipo) {
        case 'curso': return '📚';
        case 'congreso': return '🎤';
        case 'taller': return '🛠️';
        case 'seminario': return '📖';
        case 'investigacion': return '🔬';
        default: return '📁';
    }
};

const getColorEstado = (estado: string) => {
    switch(estado) {
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'rejected':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getTextoEstado = (estado: string) => {
    switch(estado) {
        case 'approved': return 'Aprobado';
        case 'rejected': return 'Rechazado';
        case 'pending': return 'Pendiente';
        default: return estado;
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export default function CohortDetail() {
    const params = useParams();
    const router = useRouter();
    const cohortId = params.id as string;
    
    const [scholars, setScholars] = useState<ScholarWithActivities[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedScholar, setSelectedScholar] = useState<ScholarWithActivities | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("todos");

    useEffect(() => {
        loadScholars();
    }, [cohortId]);

    const loadScholars = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await specialtyService.getScholarsByCohort(cohortId);
            setScholars(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar becados');
        } finally {
            setLoading(false);
        }
    };

    const openScholarDetails = (scholar: ScholarWithActivities) => {
        setSelectedScholar(scholar);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedScholar(null);
    };

    const filteredActivities = selectedScholar?.activities.filter(activity => {
        if (filterStatus === "todos") return true;
        return activity.status === filterStatus;
    }) || [];

    // Calcular estadísticas globales del cohorte
    const cohortStats = {
        totalScholars: scholars.length,
        totalActivities: scholars.reduce((sum, s) => sum + s.activityStats.total, 0),
        totalApproved: scholars.reduce((sum, s) => sum + s.activityStats.approved, 0),
        totalPending: scholars.reduce((sum, s) => sum + s.activityStats.pending, 0),
        totalRejected: scholars.reduce((sum, s) => sum + s.activityStats.rejected, 0),
        totalHours: scholars.reduce((sum, s) => sum + s.activityStats.totalHours, 0),
        totalApprovedHours: scholars.reduce((sum, s) => sum + s.activityStats.approvedHours, 0),
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Detalle de Cohorte" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6] mb-4"></div>
                            <p className="text-gray-600">Cargando becados...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Detalle de Cohorte" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={loadScholars}
                                    className="bg-[#3FD0B6] text-white px-6 py-2 rounded-lg hover:bg-[#2A9D8F] transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            <Navbar title="Jefe de Beca" subtitle="Detalle de Cohorte" />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <button 
                                    onClick={() => router.back()}
                                    className="flex items-center text-gray-600 hover:text-gray-800 mb-2 transition-colors"
                                >
                                    <span className="mr-2">←</span> Volver a Cortes
                                </button>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    Cohorte {scholars[0]?.cohortYear || ''}
                                </h1>
                                <p className="text-gray-600">Becados y sus actividades académicas</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.push(`/jefe/cortes/${cohortId}/procedimientos`)}
                                    className="text-sm text-[#3FD0B6] hover:text-[#2A9D8F] font-medium flex items-center gap-1 px-4 py-2 border border-[#3FD0B6] rounded-lg hover:bg-[#3FD0B6]/10 transition-colors"
                                >
                                    🏥 Procedimientos Mínimos
                                </button>
                                <button
                                    onClick={loadScholars}
                                    className="text-sm text-[#3FD0B6] hover:text-[#2A9D8F] font-medium flex items-center gap-1 px-4 py-2 border border-[#3FD0B6] rounded-lg hover:bg-[#3FD0B6]/10 transition-colors"
                                >
                                    🔄 Actualizar
                                </button>
                            </div>
                        </div>

                        {/* Estadísticas del cohorte */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">{cohortStats.totalScholars}</div>
                                <div className="text-xs opacity-90">Becados</div>
                            </div>
                            <div className="bg-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                                <div className="text-2xl font-bold text-blue-800">{cohortStats.totalActivities}</div>
                                <div className="text-xs text-blue-700">Actividades</div>
                            </div>
                            <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-800">{cohortStats.totalPending}</div>
                                <div className="text-xs text-yellow-700">Pendientes</div>
                            </div>
                            <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                <div className="text-2xl font-bold text-green-800">{cohortStats.totalApproved}</div>
                                <div className="text-xs text-green-700">Aprobadas</div>
                            </div>
                            <div className="bg-red-100 rounded-2xl p-4 text-center border border-red-200">
                                <div className="text-2xl font-bold text-red-800">{cohortStats.totalRejected}</div>
                                <div className="text-xs text-red-700">Rechazadas</div>
                            </div>
                            <div className="bg-purple-100 rounded-2xl p-4 text-center border border-purple-200">
                                <div className="text-2xl font-bold text-purple-800">{cohortStats.totalHours}</div>
                                <div className="text-xs text-purple-700">Horas Total</div>
                            </div>
                            <div className="bg-indigo-100 rounded-2xl p-4 text-center border border-indigo-200">
                                <div className="text-2xl font-bold text-indigo-800">{cohortStats.totalApprovedHours}</div>
                                <div className="text-xs text-indigo-700">Horas Aprobadas</div>
                            </div>
                        </div>

                        {/* Lista de becados */}
                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                            {scholars.length > 0 ? (
                                scholars.map((scholar) => (
                                    <div 
                                        key={scholar.id}
                                        onClick={() => openScholarDetails(scholar)}
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Info del becado */}
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-xl font-bold">
                                                            {scholar.fullName.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {scholar.fullName}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                            <span>RUT: {scholar.rut}</span>
                                                            {scholar.email && <span>📧 {scholar.email}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Estadísticas del becado */}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className="text-center px-3 py-1 bg-blue-50 rounded-lg">
                                                        <div className="text-lg font-bold text-blue-700">{scholar.activityStats.total}</div>
                                                        <div className="text-xs text-blue-600">Total</div>
                                                    </div>
                                                    <div className="text-center px-3 py-1 bg-green-50 rounded-lg">
                                                        <div className="text-lg font-bold text-green-700">{scholar.activityStats.approved}</div>
                                                        <div className="text-xs text-green-600">Aprobadas</div>
                                                    </div>
                                                    <div className="text-center px-3 py-1 bg-yellow-50 rounded-lg">
                                                        <div className="text-lg font-bold text-yellow-700">{scholar.activityStats.pending}</div>
                                                        <div className="text-xs text-yellow-600">Pendientes</div>
                                                    </div>
                                                    <div className="text-center px-3 py-1 bg-purple-50 rounded-lg">
                                                        <div className="text-lg font-bold text-purple-700">{scholar.activityStats.approvedHours}</div>
                                                        <div className="text-xs text-purple-600">Horas</div>
                                                    </div>
                                                    <div className="text-[#3FD0B6] font-medium text-sm">
                                                        Ver detalles →
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                    <div className="text-center text-gray-500">
                                        <div className="text-5xl mb-4">👥</div>
                                        <div className="font-medium text-lg mb-2">No hay becados en este cohorte</div>
                                        <div className="text-sm">
                                            Aún no se han asignado becados a este cohorte
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de actividades del becado */}
            {showModal && selectedScholar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                    {selectedScholar.fullName}
                                </h3>
                                <p className="text-gray-600">RUT: {selectedScholar.rut}</p>
                                {selectedScholar.email && (
                                    <p className="text-gray-500 text-sm">{selectedScholar.email}</p>
                                )}
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Estadísticas del becado */}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                            <div className="bg-blue-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-blue-700">{selectedScholar.activityStats.total}</div>
                                <div className="text-xs text-blue-600">Total</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-green-700">{selectedScholar.activityStats.approved}</div>
                                <div className="text-xs text-green-600">Aprobadas</div>
                            </div>
                            <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-yellow-700">{selectedScholar.activityStats.pending}</div>
                                <div className="text-xs text-yellow-600">Pendientes</div>
                            </div>
                            <div className="bg-red-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-red-700">{selectedScholar.activityStats.rejected}</div>
                                <div className="text-xs text-red-600">Rechazadas</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-purple-700">{selectedScholar.activityStats.totalHours}</div>
                                <div className="text-xs text-purple-600">Hrs Total</div>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-indigo-700">{selectedScholar.activityStats.approvedHours}</div>
                                <div className="text-xs text-indigo-600">Hrs Aprobadas</div>
                            </div>
                        </div>

                        {/* Filtro de actividades */}
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-800">Actividades Académicas</h4>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="pending">Pendientes</option>
                                <option value="approved">Aprobadas</option>
                                <option value="rejected">Rechazadas</option>
                            </select>
                        </div>

                        {/* Lista de actividades */}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map((activity) => (
                                    <div 
                                        key={activity.id}
                                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-[#3FD0B6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-lg">{getIconoTipo(activity.type)}</span>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-gray-800">{activity.title}</h5>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span>{ACTIVITY_TYPES[activity.type] || activity.type}</span>
                                                        <span>•</span>
                                                        <span>{activity.hours} horas</span>
                                                        <span>•</span>
                                                        <span>{formatDate(activity.date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorEstado(activity.status)}`}>
                                                {getTextoEstado(activity.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-3xl mb-2">📋</div>
                                    <p>No hay actividades {filterStatus !== 'todos' ? `con estado "${getTextoEstado(filterStatus)}"` : ''}</p>
                                </div>
                            )}
                        </div>

                        {/* Botones del modal */}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setShowProfileModal(true);
                                }}
                                className="px-6 py-2 bg-[#3FD0B6] text-white rounded-lg hover:bg-[#2A9D8F] transition-colors font-medium flex items-center gap-2"
                            >
                                📋 Ver Perfil Completo
                            </button>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de perfil completo del becado */}
            <ScholarProfileModal
                userId={selectedScholar?.userId || ''}
                scholarName={selectedScholar?.fullName || ''}
                scholarRut={selectedScholar?.rut}
                cohortId={cohortId}
                isOpen={showProfileModal}
                onClose={() => {
                    setShowProfileModal(false);
                    setSelectedScholar(null);
                }}
            />
        </div>
    );
}
