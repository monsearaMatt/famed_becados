"use client";
import React, { useState, useEffect } from "react";
import { specialtyService, ScholarHistory, ScholarActivity, CommunityActivity, ProcedureRecord, ProcedureProgress } from "@/lib/services/specialtyService";

interface ScholarProfileModalProps {
    userId: string;
    scholarName: string;
    scholarRut?: string;
    cohortId?: string;
    isOpen: boolean;
    onClose: () => void;
}

// Evaluation interfaces
interface DoctorEvaluation {
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

// Tab types
type TabType = 'academic' | 'community' | 'procedures' | 'evaluations';

// Helper functions
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const getColorEstado = (estado: string) => {
    switch(estado.toLowerCase()) {
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
    switch(estado.toLowerCase()) {
        case 'approved': return 'Aprobado';
        case 'rejected': return 'Rechazado';
        case 'pending': return 'Pendiente';
        default: return estado;
    }
};

const ACTIVITY_TYPES: Record<string, string> = {
    curso: 'Curso',
    congreso: 'Congreso',
    taller: 'Taller',
    seminario: 'Seminario',
    investigacion: 'Investigación',
    otro: 'Otro'
};

const COMMUNITY_TYPES: Record<string, string> = {
    charla: 'Charla Educativa',
    operativo: 'Operativo de Salud',
    visita: 'Visita Comunitaria',
    taller: 'Taller Comunitario',
    campana: 'Campaña de Salud',
    otro: 'Otro'
};

const getIconoTipo = (tipo: string) => {
    switch(tipo) {
        case 'curso': return '📚';
        case 'congreso': return '🎤';
        case 'taller': return '🛠️';
        case 'seminario': return '📖';
        case 'investigacion': return '🔬';
        case 'charla': return '🎯';
        case 'operativo': return '🏥';
        case 'visita': return '🏠';
        case 'campana': return '📢';
        default: return '📁';
    }
};

export default function ScholarProfileModal({ userId, scholarName, scholarRut, cohortId, isOpen, onClose }: ScholarProfileModalProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ScholarHistory | null>(null);
    const [evaluations, setEvaluations] = useState<DoctorEvaluation[]>([]);
    const [evaluationsLoading, setEvaluationsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('academic');
    const [filterStatus, setFilterStatus] = useState<string>("todos");

    useEffect(() => {
        if (isOpen && userId) {
            loadHistory();
        }
    }, [isOpen, userId, cohortId]);

    // Load evaluations when tab changes to evaluations
    useEffect(() => {
        if (activeTab === 'evaluations' && (scholarRut || history?.profile?.rut)) {
            loadEvaluations();
        }
    }, [activeTab, scholarRut, history?.profile?.rut]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await specialtyService.getScholarHistory(userId, cohortId);
            setHistory(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar historial');
        } finally {
            setLoading(false);
        }
    };

    const loadEvaluations = async () => {
        const rut = scholarRut || history?.profile?.rut;
        if (!rut) return;
        
        try {
            setEvaluationsLoading(true);
            const data = await specialtyService.getScholarEvaluations(rut);
            setEvaluations(data);
        } catch (err) {
            console.error('Error loading evaluations:', err);
            setEvaluations([]);
        } finally {
            setEvaluationsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter activities by status
    const filteredAcademicActivities = history?.academicActivities.activities.filter(activity => {
        if (filterStatus === "todos") return true;
        return activity.status === filterStatus;
    }) || [];

    const filteredCommunityActivities = history?.communityActivities.activities.filter(activity => {
        if (filterStatus === "todos") return true;
        return activity.status === filterStatus;
    }) || [];

    const filteredProcedureRecords = history?.procedureRecords.records.filter(record => {
        if (filterStatus === "todos") return true;
        return record.status.toLowerCase() === filterStatus;
    }) || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-5xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                Perfil Completo: {scholarName}
                            </h3>
                            {history?.profile && (
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>RUT: {history.profile.rut}</span>
                                    {history.profile.email && <span>📧 {history.profile.email}</span>}
                                    {history.profile.specialty && <span>🏥 {history.profile.specialty}</span>}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6] mb-4"></div>
                                <p className="text-gray-600">Cargando historial...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-red-500">
                                <div className="text-5xl mb-4">⚠️</div>
                                <p>{error}</p>
                                <button
                                    onClick={loadHistory}
                                    className="mt-4 px-4 py-2 bg-[#3FD0B6] text-white rounded-lg hover:bg-[#2A9D8F]"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    ) : history ? (
                        <>
                            {/* Tabs */}
                            <div className="border-b border-gray-200 px-6">
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => setActiveTab('academic')}
                                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'academic'
                                                ? 'border-[#3FD0B6] text-[#3FD0B6]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        📚 Actividades Académicas
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                            {history.academicActivities.stats.total}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('community')}
                                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'community'
                                                ? 'border-[#3FD0B6] text-[#3FD0B6]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        🤝 Vinculación Comunitaria
                                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                            {history.communityActivities.stats.total}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('procedures')}
                                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'procedures'
                                                ? 'border-[#3FD0B6] text-[#3FD0B6]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        🔬 Procedimientos Mínimos
                                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                                            {history.procedureRecords.records.length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('evaluations')}
                                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                            activeTab === 'evaluations'
                                                ? 'border-[#3FD0B6] text-[#3FD0B6]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        ⭐ Evaluaciones
                                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                                            {evaluations.length}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Tab content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Academic Activities Tab */}
                                {activeTab === 'academic' && (
                                    <div>
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                                            <div className="bg-blue-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-blue-700">{history.academicActivities.stats.total}</div>
                                                <div className="text-xs text-blue-600">Total</div>
                                            </div>
                                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-green-700">{history.academicActivities.stats.approved}</div>
                                                <div className="text-xs text-green-600">Aprobadas</div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-yellow-700">{history.academicActivities.stats.pending}</div>
                                                <div className="text-xs text-yellow-600">Pendientes</div>
                                            </div>
                                            <div className="bg-red-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-red-700">{history.academicActivities.stats.rejected}</div>
                                                <div className="text-xs text-red-600">Rechazadas</div>
                                            </div>
                                            <div className="bg-purple-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-purple-700">{history.academicActivities.stats.totalHours}</div>
                                                <div className="text-xs text-purple-600">Hrs Total</div>
                                            </div>
                                            <div className="bg-indigo-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-indigo-700">{history.academicActivities.stats.approvedHours}</div>
                                                <div className="text-xs text-indigo-600">Hrs Aprobadas</div>
                                            </div>
                                        </div>

                                        {/* Filter */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-800">Lista de Actividades</h4>
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

                                        {/* Activities list */}
                                        <div className="space-y-3">
                                            {filteredAcademicActivities.length > 0 ? (
                                                filteredAcademicActivities.map((activity) => (
                                                    <div key={activity.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                                                    <p>No hay actividades académicas {filterStatus !== 'todos' ? `con estado "${getTextoEstado(filterStatus)}"` : ''}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Community Activities Tab */}
                                {activeTab === 'community' && (
                                    <div>
                                        {/* Stats */}
                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            <div className="bg-purple-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-purple-700">{history.communityActivities.stats.total}</div>
                                                <div className="text-xs text-purple-600">Total</div>
                                            </div>
                                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-green-700">{history.communityActivities.stats.approved}</div>
                                                <div className="text-xs text-green-600">Aprobadas</div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-yellow-700">{history.communityActivities.stats.pending}</div>
                                                <div className="text-xs text-yellow-600">Pendientes</div>
                                            </div>
                                            <div className="bg-red-50 rounded-xl p-3 text-center">
                                                <div className="text-xl font-bold text-red-700">{history.communityActivities.stats.rejected}</div>
                                                <div className="text-xs text-red-600">Rechazadas</div>
                                            </div>
                                        </div>

                                        {/* Filter */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-800">Actividades de Vinculación</h4>
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

                                        {/* Community activities list */}
                                        <div className="space-y-3">
                                            {filteredCommunityActivities.length > 0 ? (
                                                filteredCommunityActivities.map((activity) => (
                                                    <div key={activity.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-lg">{getIconoTipo(activity.type)}</span>
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-medium text-gray-800">{activity.title}</h5>
                                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                        <span>{COMMUNITY_TYPES[activity.type] || activity.type}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(activity.date)}</span>
                                                                        {activity.location && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>📍 {activity.location}</span>
                                                                            </>
                                                                        )}
                                                                        {activity.beneficiaryCount && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>👥 {activity.beneficiaryCount} beneficiarios</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {activity.description && (
                                                                        <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                                                                    )}
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
                                                    <div className="text-3xl mb-2">🤝</div>
                                                    <p>No hay actividades de vinculación comunitaria {filterStatus !== 'todos' ? `con estado "${getTextoEstado(filterStatus)}"` : ''}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Procedures Tab */}
                                {activeTab === 'procedures' && (
                                    <div>
                                        {/* Progress summary */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-800 mb-3">Progreso de Procedimientos Mínimos</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {history.procedureRecords.progress.length > 0 ? (
                                                    history.procedureRecords.progress.map((proc) => (
                                                        <div key={proc.procedureId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-medium text-gray-800">{proc.procedureName}</h5>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    proc.isComplete 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {proc.isComplete ? '✓ Completado' : 'En progreso'}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                                                <div 
                                                                    className={`h-2.5 rounded-full ${proc.isComplete ? 'bg-green-500' : 'bg-[#3FD0B6]'}`}
                                                                    style={{ width: `${Math.min(100, (proc.approvedCount / proc.targetCount) * 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                                <span>{proc.approvedCount} de {proc.targetCount} aprobados</span>
                                                                <span className="text-yellow-600">{proc.pendingCount} pendientes</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 text-center py-4 text-gray-500">
                                                        No hay procedimientos mínimos definidos para esta especialidad
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Filter */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-800">Registros de Procedimientos</h4>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                                            >
                                                <option value="todos">Todos los estados</option>
                                                <option value="pending">Pendientes</option>
                                                <option value="approved">Aprobados</option>
                                                <option value="rejected">Rechazados</option>
                                            </select>
                                        </div>

                                        {/* Procedure records list */}
                                        <div className="space-y-3">
                                            {filteredProcedureRecords.length > 0 ? (
                                                filteredProcedureRecords.map((record) => (
                                                    <div key={record.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-lg">🔬</span>
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-medium text-gray-800">{record.procedureName || 'Procedimiento'}</h5>
                                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                        <span>{formatDate(record.date)}</span>
                                                                        {record.patientInitials && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>Paciente: {record.patientInitials}</span>
                                                                            </>
                                                                        )}
                                                                        {record.supervisorName && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>Supervisor: {record.supervisorName}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {record.notes && (
                                                                        <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorEstado(record.status)}`}>
                                                                {getTextoEstado(record.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <div className="text-3xl mb-2">🔬</div>
                                                    <p>No hay registros de procedimientos {filterStatus !== 'todos' ? `con estado "${getTextoEstado(filterStatus)}"` : ''}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Evaluations Tab */}
                                {activeTab === 'evaluations' && (
                                    <div>
                                        {evaluationsLoading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="flex flex-col items-center">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3FD0B6] mb-3"></div>
                                                    <p className="text-gray-500 text-sm">Cargando evaluaciones...</p>
                                                </div>
                                            </div>
                                        ) : evaluations.length > 0 ? (
                                            <div className="space-y-4">
                                                {/* Summary stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                                                        <div className="text-xl font-bold text-amber-700">{evaluations.length}</div>
                                                        <div className="text-xs text-amber-600">Total Evaluaciones</div>
                                                    </div>
                                                    <div className="bg-green-50 rounded-xl p-3 text-center">
                                                        <div className="text-xl font-bold text-green-700">
                                                            {evaluations.length > 0 ? Math.round(evaluations.reduce((sum, e) => sum + (e.score / e.maxScore * 100), 0) / evaluations.length) : 0}%
                                                        </div>
                                                        <div className="text-xs text-green-600">Promedio</div>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                                        <div className="text-xl font-bold text-blue-700">
                                                            {evaluations.length > 0 ? Math.max(...evaluations.map(e => Math.round(e.score / e.maxScore * 100))) : 0}%
                                                        </div>
                                                        <div className="text-xs text-blue-600">Mejor Nota</div>
                                                    </div>
                                                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                                                        <div className="text-xl font-bold text-purple-700">
                                                            {new Set(evaluations.map(e => e.doctorName)).size}
                                                        </div>
                                                        <div className="text-xs text-purple-600">Doctores</div>
                                                    </div>
                                                </div>

                                                {/* Evaluations list */}
                                                {evaluations.map((evaluation) => (
                                                    <div key={evaluation.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h5 className="font-medium text-gray-800">{evaluation.rubricName}</h5>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                    <span>👨‍⚕️ {evaluation.doctorName}</span>
                                                                    <span>•</span>
                                                                    <span>📅 {formatDate(evaluation.date)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-[#3FD0B6]">
                                                                    {Math.round(evaluation.score / evaluation.maxScore * 100)}%
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {evaluation.score}/{evaluation.maxScore} pts
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Criteria breakdown */}
                                                        {evaluation.criteria && evaluation.criteria.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <div className="text-sm font-medium text-gray-700 mb-2">Criterios evaluados:</div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {evaluation.criteria.map((criterion, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
                                                                            <span className="text-gray-600">{criterion.name}</span>
                                                                            <span className="font-medium text-gray-800">
                                                                                {criterion.selectedOption} ({criterion.points} pts)
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Comments */}
                                                        {evaluation.comments && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                <div className="text-sm font-medium text-gray-700 mb-1">Comentarios:</div>
                                                                <p className="text-sm text-gray-600 italic">"{evaluation.comments}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-gray-500">
                                                <div className="text-5xl mb-4">⭐</div>
                                                <div className="font-medium text-lg mb-2">Sin evaluaciones</div>
                                                <p className="text-sm">Este becado aún no ha recibido evaluaciones de doctores</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
