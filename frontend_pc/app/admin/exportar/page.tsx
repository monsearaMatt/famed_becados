"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
    exportService, 
    exportUtils,
    ExportFilters, 
    SpecialtyOption, 
    CohortOption,
    ScholarExportData,
    ActivityExportData,
    CommunityExportData,
    ProcedureExportData,
    EvaluationExportData
} from "@/lib/services/exportService";

type ExportType = 'scholars' | 'academic' | 'community' | 'procedures' | 'evaluations';

interface ExportConfig {
    id: ExportType;
    name: string;
    icon: string;
    description: string;
    color: string;
}

const EXPORT_TYPES: ExportConfig[] = [
    {
        id: 'scholars',
        name: 'Becados',
        icon: '👨‍🎓',
        description: 'Exportar información de becados con resumen de actividades',
        color: 'blue'
    },
    {
        id: 'academic',
        name: 'Actividades Académicas',
        icon: '📚',
        description: 'Exportar registros de actividades académicas',
        color: 'green'
    },
    {
        id: 'community',
        name: 'Vinculación Comunitaria',
        icon: '🤝',
        description: 'Exportar actividades de vinculación comunitaria',
        color: 'purple'
    },
    {
        id: 'procedures',
        name: 'Procedimientos Mínimos',
        icon: '🏥',
        description: 'Exportar registros de procedimientos realizados',
        color: 'orange'
    },
    {
        id: 'evaluations',
        name: 'Evaluaciones',
        icon: '⭐',
        description: 'Exportar evaluaciones realizadas por doctores',
        color: 'amber'
    }
];

const STATUS_OPTIONS = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'approved', label: 'Aprobados' },
    { value: 'rejected', label: 'Rechazados' }
];

export default function ExportPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<ExportType | null>(null);
    const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
    const [cohorts, setCohorts] = useState<CohortOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filtros
    const [filters, setFilters] = useState<ExportFilters>({
        specialtyId: '',
        cohortId: '',
        startDate: '',
        endDate: '',
        status: '',
        year: undefined
    });

    // Cargar especialidades al montar
    useEffect(() => {
        loadSpecialties();
    }, []);

    // Cargar cohortes cuando cambia la especialidad
    useEffect(() => {
        if (filters.specialtyId) {
            loadCohorts(filters.specialtyId);
        } else {
            setCohorts([]);
            setFilters(prev => ({ ...prev, cohortId: '' }));
        }
    }, [filters.specialtyId]);

    const loadSpecialties = async () => {
        try {
            setLoading(true);
            const data = await exportService.getSpecialties();
            setSpecialties(data);
        } catch (err) {
            console.error('Error loading specialties:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCohorts = async (specialtyId: string) => {
        try {
            const data = await exportService.getCohorts(specialtyId);
            setCohorts(data);
        } catch (err) {
            console.error('Error loading cohorts:', err);
            setCohorts([]);
        }
    };

    const handleFilterChange = (key: keyof ExportFilters, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleExport = async () => {
        if (!selectedType) {
            setError('Selecciona un tipo de datos para exportar');
            return;
        }

        setExporting(true);
        setError(null);
        setSuccess(null);

        try {
            let csvContent = '';
            let filename = '';

            switch (selectedType) {
                case 'scholars': {
                    const data = await exportService.exportScholars(filters);
                    if (data.length === 0) {
                        setError('No hay datos para exportar con los filtros seleccionados');
                        return;
                    }
                    csvContent = exportUtils.arrayToCSV(data, [
                        { key: 'rut', label: 'RUT' },
                        { key: 'fullName', label: 'Nombre Completo' },
                        { key: 'email', label: 'Email' },
                        { key: 'specialty', label: 'Especialidad' },
                        { key: 'cohortYear', label: 'Año Cohorte' },
                        { key: 'status', label: 'Estado' },
                        { key: 'totalAcademicHours', label: 'Horas Académicas Total' },
                        { key: 'approvedAcademicHours', label: 'Horas Académicas Aprobadas' },
                        { key: 'totalCommunityHours', label: 'Horas Comunitarias' },
                        { key: 'totalProcedures', label: 'Total Procedimientos' },
                        { key: 'averageEvaluationScore', label: 'Promedio Evaluaciones (%)' }
                    ]);
                    filename = 'becados';
                    break;
                }
                case 'academic': {
                    const data = await exportService.exportAcademicActivities(filters);
                    if (data.length === 0) {
                        setError('No hay datos para exportar con los filtros seleccionados');
                        return;
                    }
                    csvContent = exportUtils.arrayToCSV(data, [
                        { key: 'scholarRut', label: 'RUT Becado' },
                        { key: 'scholarName', label: 'Nombre Becado' },
                        { key: 'specialty', label: 'Especialidad' },
                        { key: 'type', label: 'Tipo' },
                        { key: 'title', label: 'Título' },
                        { key: 'date', label: 'Fecha' },
                        { key: 'hours', label: 'Horas' },
                        { key: 'status', label: 'Estado' },
                        { key: 'createdAt', label: 'Fecha Registro' }
                    ]);
                    filename = 'actividades_academicas';
                    break;
                }
                case 'community': {
                    const data = await exportService.exportCommunityActivities(filters);
                    if (data.length === 0) {
                        setError('No hay datos para exportar con los filtros seleccionados');
                        return;
                    }
                    csvContent = exportUtils.arrayToCSV(data, [
                        { key: 'scholarRut', label: 'RUT Becado' },
                        { key: 'scholarName', label: 'Nombre Becado' },
                        { key: 'specialty', label: 'Especialidad' },
                        { key: 'type', label: 'Tipo' },
                        { key: 'title', label: 'Título' },
                        { key: 'location', label: 'Ubicación' },
                        { key: 'beneficiaries', label: 'Beneficiarios' },
                        { key: 'date', label: 'Fecha' },
                        { key: 'hours', label: 'Horas' },
                        { key: 'status', label: 'Estado' },
                        { key: 'createdAt', label: 'Fecha Registro' }
                    ]);
                    filename = 'actividades_comunitarias';
                    break;
                }
                case 'procedures': {
                    const data = await exportService.exportProcedures(filters);
                    if (data.length === 0) {
                        setError('No hay datos para exportar con los filtros seleccionados');
                        return;
                    }
                    csvContent = exportUtils.arrayToCSV(data, [
                        { key: 'scholarRut', label: 'RUT Becado' },
                        { key: 'scholarName', label: 'Nombre Becado' },
                        { key: 'specialty', label: 'Especialidad' },
                        { key: 'procedureName', label: 'Procedimiento' },
                        { key: 'date', label: 'Fecha' },
                        { key: 'patientInitials', label: 'Paciente (Iniciales)' },
                        { key: 'supervisorName', label: 'Supervisor' },
                        { key: 'status', label: 'Estado' },
                        { key: 'createdAt', label: 'Fecha Registro' }
                    ]);
                    filename = 'procedimientos';
                    break;
                }
                case 'evaluations': {
                    const data = await exportService.exportEvaluations(filters);
                    if (data.length === 0) {
                        setError('No hay datos para exportar con los filtros seleccionados');
                        return;
                    }
                    csvContent = exportUtils.arrayToCSV(data, [
                        { key: 'scholarRut', label: 'RUT Becado' },
                        { key: 'scholarName', label: 'Nombre Becado' },
                        { key: 'specialty', label: 'Especialidad' },
                        { key: 'doctorName', label: 'Doctor Evaluador' },
                        { key: 'rubricName', label: 'Rúbrica' },
                        { key: 'date', label: 'Fecha' },
                        { key: 'score', label: 'Puntaje' },
                        { key: 'maxScore', label: 'Puntaje Máximo' },
                        { key: 'percentage', label: 'Porcentaje (%)' },
                        { key: 'comments', label: 'Comentarios' }
                    ]);
                    filename = 'evaluaciones';
                    break;
                }
            }

            exportUtils.downloadCSV(csvContent, filename);
            setSuccess(`Archivo ${filename} exportado exitosamente`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al exportar datos');
        } finally {
            setExporting(false);
        }
    };

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { border: string; bg: string; text: string }> = {
            blue: { border: 'border-blue-500', bg: 'from-blue-500 to-blue-600', text: 'text-blue-600' },
            green: { border: 'border-green-500', bg: 'from-green-500 to-green-600', text: 'text-green-600' },
            purple: { border: 'border-purple-500', bg: 'from-purple-500 to-purple-600', text: 'text-purple-600' },
            orange: { border: 'border-orange-500', bg: 'from-orange-500 to-orange-600', text: 'text-orange-600' },
            amber: { border: 'border-amber-500', bg: 'from-amber-500 to-amber-600', text: 'text-amber-600' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            <Navbar title="Administrador" subtitle="Exportar Datos" />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 rounded-3xl overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Exportar Datos</h1>
                            <p className="text-gray-600 text-lg">
                                Selecciona el tipo de datos y aplica filtros para exportar información del sistema
                            </p>
                        </div>

                        {/* Alertas */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
                                <span className="text-xl">✅</span>
                                <span>{success}</span>
                                <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">✕</button>
                            </div>
                        )}

                        {/* Tipo de exportación */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Selecciona qué exportar</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {EXPORT_TYPES.map((type) => {
                                    const colors = getColorClasses(type.color, selectedType === type.id);
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                                                selectedType === type.id
                                                    ? `${colors.border} bg-gray-50 shadow-md`
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-3`}>
                                                <span className="text-white text-xl">{type.icon}</span>
                                            </div>
                                            <h3 className={`font-semibold ${selectedType === type.id ? colors.text : 'text-gray-800'}`}>
                                                {type.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Aplica filtros (opcional)</h2>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Especialidad */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Especialidad
                                        </label>
                                        <select
                                            value={filters.specialtyId || ''}
                                            onChange={(e) => handleFilterChange('specialtyId', e.target.value || undefined)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                                        >
                                            <option value="">Todas las especialidades</option>
                                            {specialties.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Cohorte */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cohorte
                                        </label>
                                        <select
                                            value={filters.cohortId || ''}
                                            onChange={(e) => handleFilterChange('cohortId', e.target.value || undefined)}
                                            disabled={!filters.specialtyId}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Todas las cohortes</option>
                                            {cohorts.map((c) => (
                                                <option key={c.id} value={c.id}>Año {c.year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Estado (no aplica para becados o evaluaciones) */}
                                    {selectedType && !['scholars', 'evaluations'].includes(selectedType) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Estado
                                            </label>
                                            <select
                                                value={filters.status || ''}
                                                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                                            >
                                                {STATUS_OPTIONS.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Fecha desde */}
                                    {selectedType && selectedType !== 'scholars' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Desde
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.startDate || ''}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                                            />
                                        </div>
                                    )}

                                    {/* Fecha hasta */}
                                    {selectedType && selectedType !== 'scholars' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hasta
                                            </label>
                                            <input
                                                type="date"
                                                value={filters.endDate || ''}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-black"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Limpiar filtros */}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setFilters({
                                            specialtyId: '',
                                            cohortId: '',
                                            startDate: '',
                                            endDate: '',
                                            status: '',
                                            year: undefined
                                        })}
                                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        🔄 Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botón de exportar */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push('/admin/dashboard')}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                ← Volver
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={!selectedType || exporting}
                                className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                                    !selectedType || exporting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white hover:shadow-lg hover:scale-105'
                                }`}
                            >
                                {exporting ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl">📥</span>
                                        Exportar a CSV
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>Los archivos se descargarán en formato CSV compatible con Excel</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
