"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { verificationService, PendingActivity, AvailableSpecialty } from "@/lib/services/verificationService";

// Mapeo de tipos de actividad
const ACTIVITY_TYPES: Record<string, string> = {
    curso: 'Curso',
    congreso: 'Congreso',
    taller: 'Taller',
    seminario: 'Seminario',
    investigacion: 'Investigación',
    otro: 'Otro'
};

interface ActivityDisplay extends PendingActivity {
    displayType: string;
}

const AdminVerificarArchivos: React.FC = () => {
    const [activities, setActivities] = useState<ActivityDisplay[]>([]);
    const [availableSpecialties, setAvailableSpecialties] = useState<AvailableSpecialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [filtroEstado, setFiltroEstado] = useState<string>("todos");
    const [filtroTipo, setFiltroTipo] = useState<string>("todos");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>("all");
    const [filtroBecado, setFiltroBecado] = useState<string>("");
    const [actividadSeleccionada, setActividadSeleccionada] = useState<ActivityDisplay | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState<{ url: string; mimeType: string; name: string } | null>(null);

    // Cargar actividades al montar el componente
    useEffect(() => {
        loadActivities();
    }, []);

    // Recargar cuando cambie el filtro de especialidad (se hace en el backend)
    useEffect(() => {
        loadActivities();
    }, [filtroEspecialidad]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await verificationService.getPendingActivities(undefined, filtroEspecialidad);
            
            // Mapear los datos para incluir el tipo de display
            const mappedData: ActivityDisplay[] = result.activities.map(activity => ({
                ...activity,
                displayType: activity.customType || ACTIVITY_TYPES[activity.type] || activity.type
            }));
            
            setActivities(mappedData);
            
            // Solo actualizar especialidades si es la primera carga o si hay más disponibles
            if (result.availableSpecialties.length > 0) {
                setAvailableSpecialties(prev => {
                    // Mantener las especialidades existentes si la nueva lista es solo un subconjunto
                    if (filtroEspecialidad === 'all' || prev.length === 0) {
                        return result.availableSpecialties;
                    }
                    return prev;
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar actividades');
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

    // Filtrar actividades localmente (por estado, tipo y nombre del becado)
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
        setVistaPrevia(null);
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

    // Función para descargar archivo
    const descargarArchivo = (attachment: { name: string; mimeType: string; contentBase64: string }) => {
        try {
            if (!attachment.contentBase64 || attachment.contentBase64.includes('...')) {
                alert('Este archivo de prueba no tiene contenido descargable');
                return;
            }
            
            // Convertir base64 a blob
            const byteCharacters = atob(attachment.contentBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: attachment.mimeType });
            
            // Crear URL y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.name;
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
    };

    // Función para previsualizar archivo
    const previsualizarArchivo = (attachment: { name: string; mimeType: string; contentBase64: string }) => {
        try {
            if (!attachment.contentBase64 || attachment.contentBase64.includes('...')) {
                alert('Este archivo de prueba no tiene contenido para visualizar');
                return;
            }

            // Convertir base64 a blob
            const byteCharacters = atob(attachment.contentBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: attachment.mimeType });
            
            const url = window.URL.createObjectURL(blob);
            setVistaPrevia({ url, mimeType: attachment.mimeType, name: attachment.name });
        } catch (error) {
            console.error('Error al previsualizar:', error);
            alert('Error al previsualizar el archivo.');
        }
    };

    const cerrarVistaPrevia = () => {
        if (vistaPrevia?.url) {
            window.URL.revokeObjectURL(vistaPrevia.url);
        }
        setVistaPrevia(null);
    };

    const getIconoArchivo = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('image')) return '🖼️';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
        return '📎';
    };

    const puedePrevisualizar = (mimeType: string) => {
        return mimeType.includes('pdf') || mimeType.includes('image');
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
    const totalArchivos = activities.reduce((sum, a) => sum + a.attachments.length, 0);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Administrador" subtitle="Verificación de Archivos" />
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
                <Navbar title="Administrador" subtitle="Verificación de Archivos" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={loadActivities}
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
            <Navbar title="Administrador" subtitle="Verificación de Archivos" />

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verificación de Archivos</h1>
                            <p className="text-gray-600 text-lg">Navega y visualiza los archivos de las actividades académicas</p>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                            <div className="bg-blue-100 rounded-2xl p-4 text-center border border-blue-200">
                                <div className="text-2xl font-bold text-blue-800">{totalArchivos}</div>
                                <div className="text-sm text-blue-700">Total Archivos</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Filtro por especialidad */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        🎓 Filtrar por especialidad:
                                    </label>
                                    <select
                                        value={filtroEspecialidad}
                                        onChange={(e) => setFiltroEspecialidad(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        <option value="all">Todas las especialidades</option>
                                        {availableSpecialties.map((spec) => (
                                            <option key={spec.id} value={spec.id}>
                                                {spec.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                    {filtroEspecialidad !== 'all' && availableSpecialties.find(s => s.id === filtroEspecialidad) && (
                                        <span className="ml-2 text-[#3FD0B6] font-medium">
                                            • {availableSpecialties.find(s => s.id === filtroEspecialidad)?.name}
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={loadActivities}
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
                                                            {activity.specialtyName && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                                    🎓 {activity.specialtyName}
                                                                </span>
                                                            )}
                                                            <span className="text-gray-500 text-sm">
                                                                {activity.hours} horas
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                {formatDate(activity.date)}
                                                            </span>
                                                            {activity.attachments.length > 0 && (
                                                                <span className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-0.5 rounded">
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
                                                    <button 
                                                        onClick={() => abrirModal(activity)}
                                                        className="bg-[#3FD0B6] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#2A9D8F] transition-all duration-300 font-medium flex items-center gap-2"
                                                    >
                                                        📁 Ver Archivos
                                                    </button>
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
                                                ? "No hay actividades académicas registradas"
                                                : "Intenta con otros criterios de búsqueda"
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de archivos */}
            {mostrarModal && actividadSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-3xl mx-4 border-2 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Archivos de Actividad
                            </h3>
                            <p className="text-gray-600">
                                <span className="font-semibold">{actividadSeleccionada.title}</span>
                            </p>
                            {actividadSeleccionada.specialtyName && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 mt-2">
                                    🎓 {actividadSeleccionada.specialtyName}
                                </span>
                            )}
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
                                        <span className="text-gray-500 font-medium">Estado:</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorEstado(actividadSeleccionada.status)}`}>
                                            {getTextoEstado(actividadSeleccionada.status)}
                                        </span>
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
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                📁 Archivos Adjuntos
                                <span className="text-sm font-normal text-gray-500">
                                    ({actividadSeleccionada.attachments.length} archivo{actividadSeleccionada.attachments.length !== 1 ? 's' : ''})
                                </span>
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4">
                                {actividadSeleccionada.attachments.length > 0 ? (
                                    <ul className="space-y-3">
                                        {actividadSeleccionada.attachments.map((att) => (
                                            <li key={att.id} className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-[#3FD0B6] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">
                                                        {getIconoArchivo(att.mimeType)}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{att.name}</p>
                                                        <p className="text-gray-500 text-xs">{att.mimeType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {puedePrevisualizar(att.mimeType) && (
                                                        <button
                                                            onClick={() => previsualizarArchivo(att)}
                                                            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Ver archivo"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span className="text-sm">Ver</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => descargarArchivo(att)}
                                                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Descargar archivo"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span className="text-sm">Descargar</span>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">📭</div>
                                        <p>No hay archivos adjuntos en esta actividad</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cerrarModal}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Cerrar
                            </button>
                            {actividadSeleccionada.status === "pending" && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de vista previa */}
            {vistaPrevia && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
                    <div className="relative w-full max-w-5xl h-[90vh] mx-4">
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center rounded-t-xl">
                            <span className="font-medium truncate">{vistaPrevia.name}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = vistaPrevia.url;
                                        link.download = vistaPrevia.name;
                                        link.click();
                                    }}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                    title="Descargar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={cerrarVistaPrevia}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                    title="Cerrar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="w-full h-full pt-16 bg-gray-900 rounded-xl overflow-hidden">
                            {vistaPrevia.mimeType.includes('pdf') ? (
                                <iframe
                                    src={vistaPrevia.url}
                                    className="w-full h-full"
                                    title={vistaPrevia.name}
                                />
                            ) : vistaPrevia.mimeType.includes('image') ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={vistaPrevia.url}
                                        alt={vistaPrevia.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">📎</div>
                                        <p>Este tipo de archivo no se puede previsualizar</p>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = vistaPrevia.url;
                                                link.download = vistaPrevia.name;
                                                link.click();
                                            }}
                                            className="mt-4 px-6 py-2 bg-[#3FD0B6] rounded-lg hover:bg-[#2A9D8F] transition-colors"
                                        >
                                            Descargar archivo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerificarArchivos;
