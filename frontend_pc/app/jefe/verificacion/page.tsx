"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { verificationService, PendingActivity, PendingCommunityActivity, PendingProcedureRecord } from "@/lib/services/verificationService";

// Mapeo de tipos de actividad académica
const ACTIVITY_TYPES: Record<string, string> = {
    curso: 'Curso',
    congreso: 'Congreso',
    taller: 'Taller',
    seminario: 'Seminario',
    investigacion: 'Investigación',
    otro: 'Otro'
};

// Mapeo de tipos de actividad comunitaria
const COMMUNITY_TYPES: Record<string, string> = {
    charla: 'Charla comunitaria',
    taller: 'Taller',
    campana_salud: 'Campaña de salud',
    voluntariado: 'Voluntariado',
    educacion_comunitaria: 'Educación comunitaria',
    otro: 'Otro'
};

type TabType = 'academic' | 'community' | 'procedures';

interface ActivityDisplay extends PendingActivity {
    displayType: string;
}

interface CommunityDisplay extends PendingCommunityActivity {
    displayType: string;
}

const VerificarActividades: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('academic');
    
    // Estado para actividades académicas
    const [activities, setActivities] = useState<ActivityDisplay[]>([]);
    // Estado para actividades comunitarias
    const [communityActivities, setCommunityActivities] = useState<CommunityDisplay[]>([]);
    // Estado para procedimientos
    const [procedureRecords, setProcedureRecords] = useState<PendingProcedureRecord[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [filtroEstado, setFiltroEstado] = useState<string>("todos");
    const [filtroTipo, setFiltroTipo] = useState<string>("todos");
    const [filtroBecado, setFiltroBecado] = useState<string>("");
    const [actividadSeleccionada, setActividadSeleccionada] = useState<ActivityDisplay | null>(null);
    const [communitySeleccionada, setCommunitySeleccionada] = useState<CommunityDisplay | null>(null);
    const [procedureSeleccionado, setProcedureSeleccionado] = useState<PendingProcedureRecord | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Cargar actividades al montar el componente
    useEffect(() => {
        loadAllData();
    }, []);

    // Escuchar cambios de especialidad desde el Navbar
    useEffect(() => {
        const handleSpecialtyChange = () => {
            loadAllData();
        };

        window.addEventListener('specialtyChanged', handleSpecialtyChange);
        return () => window.removeEventListener('specialtyChanged', handleSpecialtyChange);
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Obtener especialidad seleccionada del localStorage
            const selectedSpecialtyId = typeof window !== 'undefined' 
                ? localStorage.getItem('selectedSpecialtyId') || undefined 
                : undefined;
            
            // Cargar todos los tipos en paralelo, manejando errores individualmente
            const [academicResult, communityResult, proceduresResult] = await Promise.allSettled([
                verificationService.getPendingActivities(undefined, selectedSpecialtyId),
                verificationService.getPendingCommunityActivities(undefined, selectedSpecialtyId),
                verificationService.getPendingProcedureRecords(undefined, selectedSpecialtyId)
            ]);
            
            // Mapear actividades académicas
            if (academicResult.status === 'fulfilled') {
                const mappedAcademic: ActivityDisplay[] = academicResult.value.activities.map(activity => ({
                    ...activity,
                    displayType: activity.customType || ACTIVITY_TYPES[activity.type] || activity.type
                }));
                setActivities(mappedAcademic);
            } else {
                console.error('Error cargando actividades académicas:', academicResult.reason);
                setActivities([]);
            }
            
            // Mapear actividades comunitarias
            if (communityResult.status === 'fulfilled') {
                const mappedCommunity: CommunityDisplay[] = communityResult.value.activities.map(activity => ({
                    ...activity,
                    displayType: COMMUNITY_TYPES[activity.type] || activity.type
                }));
                setCommunityActivities(mappedCommunity);
            } else {
                console.error('Error cargando actividades comunitarias:', communityResult.reason);
                setCommunityActivities([]);
            }
            
            // Procedimientos
            if (proceduresResult.status === 'fulfilled') {
                setProcedureRecords(proceduresResult.value.records);
            } else {
                console.error('Error cargando procedimientos:', proceduresResult.reason);
                setProcedureRecords([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const getIconoTipo = (tipo: string) => {
        switch(tipo) {
            case 'curso':
                return '📚';
            case 'congreso':
                return '🎤';
            case 'taller':
                return '🛠️';
            case 'seminario':
                return '📖';
            case 'investigacion':
                return '🔬';
            case 'otro':
                return '📋';
            default:
                return '📁';
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
            case 'approved':
                return 'Aprobado';
            case 'rejected':
                return 'Rechazado';
            case 'pending':
                return 'Pendiente';
            default:
                return estado;
        }
    };

    const getColorTipo = (tipo: string) => {
        switch(tipo) {
            case 'curso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'congreso':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'taller':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'seminario':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'investigacion':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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

    // Filtrar actividades
    const actividadesFiltradas = activities.filter(activity => {
        const estado = activity.status === 'pending' ? 'pendiente' : 
                       activity.status === 'approved' ? 'aprobado' : 
                       activity.status === 'rejected' ? 'rechazado' : activity.status;
        
        const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;
        const coincideTipo = filtroTipo === "todos" || activity.type === filtroTipo;
        const coincideBecado = activity.scholarName.toLowerCase().includes(filtroBecado.toLowerCase());
        return coincideEstado && coincideTipo && coincideBecado;
    });

    const abrirModal = (activity: ActivityDisplay) => {
        setActividadSeleccionada(activity);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setActividadSeleccionada(null);
    };

    const handleVerify = async (status: 'approved' | 'rejected') => {
        if (!actividadSeleccionada) return;

        try {
            setActionLoading(actividadSeleccionada.id);
            await verificationService.verifyActivity(actividadSeleccionada.id, status);
            
            // Actualizar la lista local
            setActivities(prev => prev.map(act => 
                act.id === actividadSeleccionada.id 
                    ? { ...act, status } 
                    : act
            ));
            
            cerrarModal();
            
            // Mostrar mensaje de éxito
            alert(`Actividad ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al verificar la actividad');
        } finally {
            setActionLoading(null);
        }
    };

    // Verificar actividad comunitaria
    const handleVerifyCommunity = async (status: 'approved' | 'rejected') => {
        if (!communitySeleccionada) return;

        try {
            setActionLoading(communitySeleccionada.id);
            await verificationService.verifyCommunityActivity(communitySeleccionada.id, status);
            
            setCommunityActivities(prev => prev.map(act => 
                act.id === communitySeleccionada.id 
                    ? { ...act, status } 
                    : act
            ));
            
            setMostrarModal(false);
            setCommunitySeleccionada(null);
            alert(`Actividad comunitaria ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al verificar la actividad');
        } finally {
            setActionLoading(null);
        }
    };

    // Verificar procedimiento
    const handleVerifyProcedure = async (status: 'approved' | 'rejected') => {
        if (!procedureSeleccionado) return;

        try {
            setActionLoading(procedureSeleccionado.id);
            await verificationService.verifyProcedureRecord(procedureSeleccionado.id, status);
            
            setProcedureRecords(prev => prev.map(rec => 
                rec.id === procedureSeleccionado.id 
                    ? { ...rec, status } 
                    : rec
            ));
            
            setMostrarModal(false);
            setProcedureSeleccionado(null);
            alert(`Procedimiento ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al verificar el procedimiento');
        } finally {
            setActionLoading(null);
        }
    };

    // Iconos para actividades comunitarias
    const getIconoCommunity = (tipo: string) => {
        switch(tipo) {
            case 'charla':
                return '🎤';
            case 'taller':
                return '🛠️';
            case 'campana_salud':
                return '❤️';
            case 'voluntariado':
                return '🤝';
            case 'educacion_comunitaria':
                return '📚';
            case 'otro':
                return '📋';
            default:
                return '🏥';
        }
    };

    const estados = [
        { value: "todos", label: "Todos los estados" },
        { value: "pendiente", label: "Pendientes" },
        { value: "aprobado", label: "Aprobados" },
        { value: "rechazado", label: "Rechazados" }
    ];

    const tipos = [
        { value: "todos", label: "Todos los tipos" },
        { value: "curso", label: "Cursos" },
        { value: "congreso", label: "Congresos" },
        { value: "taller", label: "Talleres" },
        { value: "seminario", label: "Seminarios" },
        { value: "investigacion", label: "Investigación" },
        { value: "otro", label: "Otros" }
    ];

    // Calcular estadísticas
    const totalActivities = activities.length;
    const pendingCount = activities.filter(a => a.status === 'pending').length;
    const approvedCount = activities.filter(a => a.status === 'approved').length;
    const rejectedCount = activities.filter(a => a.status === 'rejected').length;

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Verificación de Actividades" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6] mb-4"></div>
                            <p className="text-gray-600">Cargando actividades...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Verificación de Actividades" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={loadAllData}
                                className="bg-[#3FD0B6] text-white px-6 py-2 rounded-lg hover:bg-[#2A9D8F] transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <Navbar title="Jefe de Beca" subtitle="Verificación de Actividades" />

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verificación de Actividades</h1>
                            <p className="text-gray-600 text-lg">Revisa y evalúa las actividades enviadas por los becados</p>
                        </div>

                        {/* Tabs de navegación */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('academic')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === 'academic'
                                            ? 'bg-white text-[#3FD0B6] shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    📚 Académicas
                                    {activities.filter(a => a.status === 'pending').length > 0 && (
                                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                                            {activities.filter(a => a.status === 'pending').length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('community')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === 'community'
                                            ? 'bg-white text-[#3FD0B6] shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    🤝 Comunitarias
                                    {communityActivities.filter(a => a.status === 'pending').length > 0 && (
                                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                                            {communityActivities.filter(a => a.status === 'pending').length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('procedures')}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === 'procedures'
                                            ? 'bg-white text-[#3FD0B6] shadow-md'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    🏥 Procedimientos
                                    {procedureRecords.filter(p => p.status === 'pending').length > 0 && (
                                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">
                                            {procedureRecords.filter(p => p.status === 'pending').length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Contenido según tab activo */}
                        {activeTab === 'academic' && (
                            <>
                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">{totalActivities}</div>
                                <div className="text-sm opacity-90">Total Actividades</div>
                            </div>
                            <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
                                <div className="text-sm text-yellow-700">Pendientes</div>
                            </div>
                            <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                <div className="text-2xl font-bold text-green-800">{approvedCount}</div>
                                <div className="text-sm text-green-700">Aprobadas</div>
                            </div>
                            <div className="bg-red-100 rounded-2xl p-4 text-center border border-red-200">
                                <div className="text-2xl font-bold text-red-800">{rejectedCount}</div>
                                <div className="text-sm text-red-700">Rechazadas</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Buscar por becado:
                                    </label>
                                    <input
                                        type="text"
                                        value={filtroBecado}
                                        onChange={(e) => setFiltroBecado(e.target.value)}
                                        placeholder="Nombre del becado..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Filtrar por estado:
                                    </label>
                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        {estados.map((estado) => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Filtrar por tipo:
                                    </label>
                                    <select
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        {tipos.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Mostrando {actividadesFiltradas.length} de {totalActivities} actividades
                                </span>
                                <button
                                    onClick={loadAllData}
                                    className="text-sm text-[#3FD0B6] hover:text-[#2A9D8F] font-medium flex items-center gap-1"
                                >
                                    🔄 Actualizar
                                </button>
                            </div>
                        </div>

                        {/* Lista de actividades */}
                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                            
                            {actividadesFiltradas.length > 0 ? (
                                actividadesFiltradas.map((activity) => (
                                    <div 
                                        key={activity.id} 
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Información de la actividad */}
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-2xl flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-2xl">{getIconoTipo(activity.type)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {activity.title}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorTipo(activity.type)}`}>
                                                                {activity.displayType}
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                {activity.hours} horas
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                {formatDate(activity.date)}
                                                            </span>
                                                            {activity.attachments.length > 0 && (
                                                                <span className="text-gray-500 text-sm">
                                                                    📎 {activity.attachments.length} archivo(s)
                                                                </span>
                                                            )}
                                                        </div>
                                                        {activity.description && (
                                                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                                {activity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Información del becado */}
                                                <div className="flex-1 lg:px-4">
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {activity.scholarName}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm">
                                                        RUT: {activity.scholarRut}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Enviado: {formatDate(activity.createdAt)}
                                                    </p>
                                                </div>

                                                {/* Estado y acciones */}
                                                <div className="flex flex-col items-end space-y-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(activity.status)}`}>
                                                        {getTextoEstado(activity.status)}
                                                    </span>
                                                    {activity.status === "pending" && (
                                                        <button 
                                                            onClick={() => abrirModal(activity)}
                                                            className="bg-[#3FD0B6] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#2A9D8F] transition-all duration-300 font-medium"
                                                        >
                                                            Revisar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                    <div className="text-center text-gray-500">
                                        <div className="text-5xl mb-4">📋</div>
                                        <div className="font-medium text-lg mb-2">No se encontraron actividades</div>
                                        <div className="text-sm">
                                            {totalActivities === 0 
                                                ? "No hay actividades académicas pendientes de verificación"
                                                : "Intenta con otros criterios de búsqueda"
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                            </>
                        )}

                        {/* Tab: Actividades Comunitarias */}
                        {activeTab === 'community' && (
                            <>
                                {/* Estadísticas comunitarias */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                        <div className="text-2xl font-bold">{communityActivities.length}</div>
                                        <div className="text-sm opacity-90">Total Actividades</div>
                                    </div>
                                    <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                        <div className="text-2xl font-bold text-yellow-800">{communityActivities.filter(a => a.status === 'pending').length}</div>
                                        <div className="text-sm text-yellow-700">Pendientes</div>
                                    </div>
                                    <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                        <div className="text-2xl font-bold text-green-800">{communityActivities.filter(a => a.status === 'approved').length}</div>
                                        <div className="text-sm text-green-700">Aprobadas</div>
                                    </div>
                                    <div className="bg-red-100 rounded-2xl p-4 text-center border border-red-200">
                                        <div className="text-2xl font-bold text-red-800">{communityActivities.filter(a => a.status === 'rejected').length}</div>
                                        <div className="text-sm text-red-700">Rechazadas</div>
                                    </div>
                                </div>

                                {/* Lista de actividades comunitarias */}
                                <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                                    {communityActivities.length > 0 ? (
                                        communityActivities.map((activity) => (
                                            <div 
                                                key={activity.id} 
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                                <span className="text-white text-2xl">{getIconoCommunity(activity.type)}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-800 text-lg">
                                                                    {activity.title}
                                                                </h3>
                                                                <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                                                                        {activity.displayType}
                                                                    </span>
                                                                    <span className="text-gray-500 text-sm">
                                                                        {activity.hours} horas
                                                                    </span>
                                                                    <span className="text-gray-500 text-sm">
                                                                        {formatDate(activity.date)}
                                                                    </span>
                                                                    {activity.attachments && activity.attachments.length > 0 && (
                                                                        <span className="text-gray-500 text-sm">
                                                                            📎 {activity.attachments.length} archivo(s)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {activity.description && (
                                                                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                                        {activity.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 lg:px-4">
                                                            <h4 className="font-medium text-gray-800 mb-1">
                                                                {activity.scholarName}
                                                            </h4>
                                                            <p className="text-gray-600 text-sm">
                                                                RUT: {activity.scholarRut}
                                                            </p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                Enviado: {formatDate(activity.createdAt)}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end space-y-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(activity.status)}`}>
                                                                {getTextoEstado(activity.status)}
                                                            </span>
                                                            {activity.status === "pending" && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setCommunitySeleccionada(activity);
                                                                        setMostrarModal(true);
                                                                    }}
                                                                    className="bg-purple-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-purple-600 transition-all duration-300 font-medium"
                                                                >
                                                                    Revisar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                            <div className="text-center text-gray-500">
                                                <div className="text-5xl mb-4">🤝</div>
                                                <div className="font-medium text-lg mb-2">No hay actividades comunitarias</div>
                                                <div className="text-sm">No hay actividades de vinculación comunitaria pendientes</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Tab: Procedimientos */}
                        {activeTab === 'procedures' && (
                            <>
                                {/* Estadísticas procedimientos */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                        <div className="text-2xl font-bold">{procedureRecords.length}</div>
                                        <div className="text-sm opacity-90">Total Registros</div>
                                    </div>
                                    <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                        <div className="text-2xl font-bold text-yellow-800">{procedureRecords.filter(p => p.status === 'pending').length}</div>
                                        <div className="text-sm text-yellow-700">Pendientes</div>
                                    </div>
                                    <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                        <div className="text-2xl font-bold text-green-800">{procedureRecords.filter(p => p.status === 'approved').length}</div>
                                        <div className="text-sm text-green-700">Aprobados</div>
                                    </div>
                                    <div className="bg-red-100 rounded-2xl p-4 text-center border border-red-200">
                                        <div className="text-2xl font-bold text-red-800">{procedureRecords.filter(p => p.status === 'rejected').length}</div>
                                        <div className="text-sm text-red-700">Rechazados</div>
                                    </div>
                                </div>

                                {/* Lista de procedimientos */}
                                <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                                    {procedureRecords.length > 0 ? (
                                        procedureRecords.map((record) => (
                                            <div 
                                                key={record.id} 
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                                <span className="text-white text-2xl">🏥</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-gray-800 text-lg">
                                                                    {record.procedureName}
                                                                </h3>
                                                                <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                                                                    <span className="text-gray-500 text-sm">
                                                                        {formatDate(record.date)}
                                                                    </span>
                                                                    {record.patientInitials && (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                                                                            Paciente: {record.patientInitials}
                                                                        </span>
                                                                    )}
                                                                    {record.supervisorName && (
                                                                        <span className="text-gray-500 text-sm">
                                                                            Supervisor: {record.supervisorName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {record.notes && (
                                                                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                                                        {record.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 lg:px-4">
                                                            <h4 className="font-medium text-gray-800 mb-1">
                                                                {record.scholarName}
                                                            </h4>
                                                            <p className="text-gray-600 text-sm">
                                                                RUT: {record.scholarRut}
                                                            </p>
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                Enviado: {formatDate(record.createdAt)}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end space-y-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(record.status)}`}>
                                                                {getTextoEstado(record.status)}
                                                            </span>
                                                            {record.status === "pending" && (
                                                                <button 
                                                                    onClick={() => {
                                                                        setProcedureSeleccionado(record);
                                                                        setMostrarModal(true);
                                                                    }}
                                                                    className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600 transition-all duration-300 font-medium"
                                                                >
                                                                    Revisar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                            <div className="text-center text-gray-500">
                                                <div className="text-5xl mb-4">🏥</div>
                                                <div className="font-medium text-lg mb-2">No hay procedimientos</div>
                                                <div className="text-sm">No hay registros de procedimientos pendientes</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>

            {/* Modal de revisión */}
            {mostrarModal && actividadSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Revisar Actividad Académica
                            </h3>
                            <p className="text-gray-600">
                                <span className="font-semibold">{actividadSeleccionada.title}</span>
                            </p>
                        </div>

                        {/* Información de la actividad y becado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información de la Actividad</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Tipo:</span>
                                        <span className="font-semibold text-gray-800">{actividadSeleccionada.displayType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Horas:</span>
                                        <span className="font-semibold text-gray-800">{actividadSeleccionada.hours} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Fecha:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(actividadSeleccionada.date)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Archivos:</span>
                                        <span className="font-semibold text-gray-800">{actividadSeleccionada.attachments.length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información del Becado</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Nombre:</span>
                                        <span className="font-semibold text-gray-800">{actividadSeleccionada.scholarName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">RUT:</span>
                                        <span className="font-semibold text-gray-800">{actividadSeleccionada.scholarRut}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Enviado:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(actividadSeleccionada.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        {actividadSeleccionada.description && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Descripción</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-gray-700 text-sm">{actividadSeleccionada.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Archivos adjuntos */}
                        {actividadSeleccionada.attachments.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Archivos Adjuntos</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <ul className="space-y-3">
                                        {actividadSeleccionada.attachments.map((att) => (
                                            <li key={att.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {att.mimeType.includes('pdf') ? '📄' : 
                                                         att.mimeType.includes('image') ? '🖼️' : 
                                                         att.mimeType.includes('word') ? '📝' : '📎'}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">{att.name}</p>
                                                        <p className="text-gray-500 text-xs">{att.mimeType}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        try {
                                                            // Verificar si hay contenido base64 válido
                                                            if (!att.contentBase64 || att.contentBase64.includes('...')) {
                                                                alert('Este archivo de prueba no tiene contenido descargable');
                                                                return;
                                                            }
                                                            
                                                            // Convertir base64 a blob
                                                            const byteCharacters = atob(att.contentBase64);
                                                            const byteNumbers = new Array(byteCharacters.length);
                                                            for (let i = 0; i < byteCharacters.length; i++) {
                                                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                            }
                                                            const byteArray = new Uint8Array(byteNumbers);
                                                            const blob = new Blob([byteArray], { type: att.mimeType });
                                                            
                                                            // Crear URL y descargar
                                                            const url = window.URL.createObjectURL(blob);
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.download = att.name;
                                                            link.style.display = 'none';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            
                                                            // Limpiar
                                                            setTimeout(() => {
                                                                document.body.removeChild(link);
                                                                window.URL.revokeObjectURL(url);
                                                            }, 100);
                                                        } catch (error) {
                                                            console.error('Error al descargar:', error);
                                                            alert('Error al descargar el archivo. El contenido puede estar corrupto.');
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Descargar archivo"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cerrarModal}
                                disabled={actionLoading === actividadSeleccionada.id}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleVerify('rejected')}
                                disabled={actionLoading === actividadSeleccionada.id}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === actividadSeleccionada.id ? (
                                    <span className="animate-spin">⏳</span>
                                ) : null}
                                Rechazar
                            </button>
                            <button
                                onClick={() => handleVerify('approved')}
                                disabled={actionLoading === actividadSeleccionada.id}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === actividadSeleccionada.id ? (
                                    <span className="animate-spin">⏳</span>
                                ) : null}
                                Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de revisión - Actividad Comunitaria */}
            {mostrarModal && communitySeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Revisar Actividad Comunitaria
                            </h3>
                            <p className="text-gray-600">
                                <span className="font-semibold">{communitySeleccionada.title}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información de la Actividad</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Tipo:</span>
                                        <span className="font-semibold text-gray-800">{communitySeleccionada.displayType}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Horas:</span>
                                        <span className="font-semibold text-gray-800">{communitySeleccionada.hours} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Fecha:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(communitySeleccionada.date)}</span>
                                    </div>
                                    {communitySeleccionada.location && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Ubicación:</span>
                                            <span className="font-semibold text-gray-800">{communitySeleccionada.location}</span>
                                        </div>
                                    )}
                                    {communitySeleccionada.beneficiaries && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Beneficiarios:</span>
                                            <span className="font-semibold text-gray-800">{communitySeleccionada.beneficiaries}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información del Becado</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Nombre:</span>
                                        <span className="font-semibold text-gray-800">{communitySeleccionada.scholarName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">RUT:</span>
                                        <span className="font-semibold text-gray-800">{communitySeleccionada.scholarRut}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Enviado:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(communitySeleccionada.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {communitySeleccionada.description && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Descripción</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-gray-700 text-sm">{communitySeleccionada.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => { setMostrarModal(false); setCommunitySeleccionada(null); }}
                                disabled={actionLoading === communitySeleccionada.id}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleVerifyCommunity('rejected')}
                                disabled={actionLoading === communitySeleccionada.id}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === communitySeleccionada.id ? <span className="animate-spin">⏳</span> : null}
                                Rechazar
                            </button>
                            <button
                                onClick={() => handleVerifyCommunity('approved')}
                                disabled={actionLoading === communitySeleccionada.id}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === communitySeleccionada.id ? <span className="animate-spin">⏳</span> : null}
                                Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de revisión - Procedimiento */}
            {mostrarModal && procedureSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Revisar Registro de Procedimiento
                            </h3>
                            <p className="text-gray-600">
                                <span className="font-semibold">{procedureSeleccionado.procedureName}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información del Procedimiento</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Procedimiento:</span>
                                        <span className="font-semibold text-gray-800">{procedureSeleccionado.procedureName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Fecha:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(procedureSeleccionado.date)}</span>
                                    </div>
                                    {procedureSeleccionado.patientInitials && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Paciente:</span>
                                            <span className="font-semibold text-gray-800">{procedureSeleccionado.patientInitials}</span>
                                        </div>
                                    )}
                                    {procedureSeleccionado.supervisorName && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Supervisor:</span>
                                            <span className="font-semibold text-gray-800">{procedureSeleccionado.supervisorName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-800 mb-3">Información del Becado</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Nombre:</span>
                                        <span className="font-semibold text-gray-800">{procedureSeleccionado.scholarName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">RUT:</span>
                                        <span className="font-semibold text-gray-800">{procedureSeleccionado.scholarRut}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Enviado:</span>
                                        <span className="font-semibold text-gray-800">{formatDate(procedureSeleccionado.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {procedureSeleccionado.notes && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-2">Notas</h4>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-gray-700 text-sm">{procedureSeleccionado.notes}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => { setMostrarModal(false); setProcedureSeleccionado(null); }}
                                disabled={actionLoading === procedureSeleccionado.id}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleVerifyProcedure('rejected')}
                                disabled={actionLoading === procedureSeleccionado.id}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === procedureSeleccionado.id ? <span className="animate-spin">⏳</span> : null}
                                Rechazar
                            </button>
                            <button
                                onClick={() => handleVerifyProcedure('approved')}
                                disabled={actionLoading === procedureSeleccionado.id}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {actionLoading === procedureSeleccionado.id ? <span className="animate-spin">⏳</span> : null}
                                Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificarActividades;
