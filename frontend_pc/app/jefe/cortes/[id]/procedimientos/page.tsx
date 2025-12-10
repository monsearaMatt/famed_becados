"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { procedureService, MinimumProcedure, CreateProcedureInput } from "@/lib/services/procedureService";
import { specialtyService, Cohort } from "@/lib/services/specialtyService";

interface CohortInfo {
    cohort: Cohort | null;
    specialtyName: string;
}

export default function CohortProceduresConfig() {
    const params = useParams();
    const router = useRouter();
    const cohortId = params.id as string;
    
    const [procedures, setProcedures] = useState<MinimumProcedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohortInfo, setCohortInfo] = useState<CohortInfo>({ cohort: null, specialtyName: "" });
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingProcedure, setEditingProcedure] = useState<MinimumProcedure | null>(null);
    const [formData, setFormData] = useState<CreateProcedureInput>({
        name: "",
        description: "",
        category: "",
        targetCount: 1
    });
    const [saving, setSaving] = useState(false);
    
    // Copy configuration state
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [availableCohorts, setAvailableCohorts] = useState<Cohort[]>([]);
    const [selectedSourceCohort, setSelectedSourceCohort] = useState<string>("");
    const [copying, setCopying] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Load procedures for this cohort
            const procedureData = await procedureService.getCatalogByCohort(cohortId);
            setProcedures(procedureData);
            
            // Try to get cohort info from the specialty service
            // We'll need to find which specialty this cohort belongs to
            const specialties = await specialtyService.getAll();
            
            for (const specialty of specialties) {
                const cohorts = await specialtyService.getCohortsBySpecialty(specialty.id);
                const foundCohort = cohorts.find((c: Cohort) => c.id === cohortId);
                if (foundCohort) {
                    setCohortInfo({
                        cohort: foundCohort,
                        specialtyName: specialty.name
                    });
                    // Get other cohorts from same specialty for copy functionality
                    setAvailableCohorts(cohorts.filter((c: Cohort) => c.id !== cohortId));
                    break;
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [cohortId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            if (editingProcedure) {
                // Update existing
                await procedureService.updateProcedure(editingProcedure.id, formData);
            } else {
                // Create new
                await procedureService.createProcedure(cohortId, formData);
            }
            
            // Reload data
            const updatedProcedures = await procedureService.getCatalogByCohort(cohortId);
            setProcedures(updatedProcedures);
            
            // Reset form
            setShowForm(false);
            setEditingProcedure(null);
            setFormData({ name: "", description: "", category: "", targetCount: 1 });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al guardar el procedimiento');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (procedure: MinimumProcedure) => {
        setEditingProcedure(procedure);
        setFormData({
            name: procedure.name,
            description: procedure.description || "",
            category: procedure.category || "",
            targetCount: procedure.targetCount
        });
        setShowForm(true);
    };

    const handleDelete = async (procedureId: string) => {
        if (!confirm('¿Está seguro de eliminar este procedimiento del catálogo?')) return;
        
        try {
            await procedureService.deleteProcedure(procedureId);
            const updatedProcedures = await procedureService.getCatalogByCohort(cohortId);
            setProcedures(updatedProcedures);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al eliminar el procedimiento');
        }
    };

    const handleCopyConfiguration = async () => {
        if (!selectedSourceCohort) {
            alert('Seleccione un corte origen');
            return;
        }
        
        setCopying(true);
        try {
            const result = await procedureService.copyConfiguration(cohortId, selectedSourceCohort);
            alert(result.message);
            setShowCopyModal(false);
            setSelectedSourceCohort("");
            
            // Reload procedures
            const updatedProcedures = await procedureService.getCatalogByCohort(cohortId);
            setProcedures(updatedProcedures);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al copiar configuración');
        } finally {
            setCopying(false);
        }
    };

    // Group procedures by category
    const groupedProcedures = procedures.reduce((acc, proc) => {
        const category = proc.category || "Sin categoría";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(proc);
        return acc;
    }, {} as Record<string, MinimumProcedure[]>);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Configuración de Procedimientos" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6] mb-4"></div>
                            <p className="text-gray-600">Cargando configuración...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
                <Navbar title="Jefe de Beca" subtitle="Configuración de Procedimientos" />
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
                                    onClick={loadData}
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
            <Navbar title="Jefe de Beca" subtitle="Configuración de Procedimientos Mínimos" />

            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center text-white/80 hover:text-white mb-2 transition-colors"
                            >
                                <span className="mr-2">←</span> Volver
                            </button>
                            <h1 className="text-3xl font-bold text-white">
                                Procedimientos Mínimos
                            </h1>
                            <p className="text-white/80">
                                {cohortInfo.specialtyName} - Cohorte {cohortInfo.cohort?.year || 'N/A'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {availableCohorts.length > 0 && (
                                <button
                                    onClick={() => setShowCopyModal(true)}
                                    className="bg-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center border border-white/30"
                                >
                                    <span className="mr-2">📋</span>
                                    Copiar de otro corte
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setEditingProcedure(null);
                                    setFormData({ name: "", description: "", category: "", targetCount: 1 });
                                    setShowForm(true);
                                }}
                                className="bg-white text-[#2A9D8F] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                            >
                                <span className="mr-2 text-xl">+</span>
                                Nuevo Procedimiento
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-white">
                            <div className="text-4xl font-bold">{procedures.length}</div>
                            <div className="text-white/80">Procedimientos configurados</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-white">
                            <div className="text-4xl font-bold">{Object.keys(groupedProcedures).length}</div>
                            <div className="text-white/80">Categorías</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-white">
                            <div className="text-4xl font-bold">
                                {procedures.reduce((sum, p) => sum + p.targetCount, 0)}
                            </div>
                            <div className="text-white/80">Total requerido</div>
                        </div>
                    </div>

                    {/* Procedures List */}
                    {procedures.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20">
                            <div className="text-6xl mb-4">🏥</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No hay procedimientos configurados</h3>
                            <p className="text-white/80 mb-8">Configure los procedimientos mínimos que los becados deben completar en este corte</p>
                            <div className="flex justify-center gap-4">
                                {availableCohorts.length > 0 && (
                                    <button
                                        onClick={() => setShowCopyModal(true)}
                                        className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                                    >
                                        📋 Copiar de otro corte
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-white text-[#2A9D8F] px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                                >
                                    Crear Procedimiento
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedProcedures).map(([category, procs]) => (
                                <div key={category} className="bg-white rounded-2xl p-6 shadow-xl">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <span className="w-3 h-3 bg-[#3FD0B6] rounded-full mr-3"></span>
                                        {category}
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({procs.length} procedimiento{procs.length !== 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {procs.map((proc) => (
                                            <div 
                                                key={proc.id} 
                                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#3FD0B6] transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-gray-800">{proc.name}</h3>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEdit(proc)}
                                                            className="p-1 text-gray-400 hover:text-[#3FD0B6] transition-colors"
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(proc.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                                {proc.description && (
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{proc.description}</p>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Mínimo requerido:</span>
                                                    <span className="bg-[#3FD0B6] text-white px-3 py-1 rounded-full text-sm font-bold">
                                                        {proc.targetCount}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingProcedure ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingProcedure(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del procedimiento *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800"
                                    placeholder="Ej: Cirugía de Apéndice"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <input
                                    type="text"
                                    value={formData.category || ""}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800"
                                    placeholder="Ej: Cirugías Abdominales"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800 resize-none"
                                    rows={3}
                                    placeholder="Descripción opcional del procedimiento"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cantidad mínima requerida *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.targetCount}
                                    onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Cantidad de veces que el becado debe realizar este procedimiento
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingProcedure(null);
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-[#3FD0B6] text-white rounded-xl font-semibold hover:bg-[#2A9D8F] transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : (editingProcedure ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Copy Configuration Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Copiar Configuración
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCopyModal(false);
                                    setSelectedSourceCohort("");
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Seleccione un corte de la misma especialidad para copiar sus procedimientos configurados.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Corte origen
                            </label>
                            <select
                                value={selectedSourceCohort}
                                onChange={(e) => setSelectedSourceCohort(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800"
                            >
                                <option value="">Seleccione un corte...</option>
                                {availableCohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>
                                        Cohorte {cohort.year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Esta acción copiará todos los procedimientos del corte seleccionado a este corte. 
                                Los procedimientos existentes no serán afectados.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCopyModal(false);
                                    setSelectedSourceCohort("");
                                }}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCopyConfiguration}
                                disabled={copying || !selectedSourceCohort}
                                className="flex-1 py-3 bg-[#3FD0B6] text-white rounded-xl font-semibold hover:bg-[#2A9D8F] transition-colors disabled:opacity-50"
                            >
                                {copying ? 'Copiando...' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
