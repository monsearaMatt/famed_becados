"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar, { SELECTED_SPECIALTY_KEY } from "@/components/Navbar";
import { specialtyService, Specialty, Cohort } from "@/lib/services/specialtyService";
import { procedureService } from "@/lib/services/procedureService";
import { useAuth } from "@/hooks/useAuth";

interface CorteItem {
    id: string;
    nombre: string;
    link?: string;
}

export default function Cortes() {
    const router = useRouter();
    const { user: authUser } = useAuth();
    
    const [cortes, setCortes] = useState<CorteItem[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [specialty, setSpecialty] = useState<Specialty | null>(null);
    const [loading, setLoading] = useState(true);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoCorte, setNuevoCorte] = useState("");

    // Copy configuration modal state
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [newCohortId, setNewCohortId] = useState<string | null>(null);
    const [selectedSourceCohort, setSelectedSourceCohort] = useState<string>("");
    const [copying, setCopying] = useState(false);

    const loadData = useCallback(async () => {
        if (!authUser) return;
        
        setLoading(true);
        try {
            // Get selected specialty from localStorage
            const selectedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
            
            if (!selectedSpecialtyId) {
                console.warn("No specialty selected");
                setLoading(false);
                return;
            }

            // Get all specialties to find the selected one
            const allSpecialties = await specialtyService.getSpecialties();
            const found = allSpecialties.find(s => s.id === selectedSpecialtyId);
            
            if (found) {
                setSpecialty(found);
                // Get Cohorts for the selected specialty
                const cohortsData = await specialtyService.getCohorts(found.id);
                setCohorts(cohortsData);
                // Map to CorteItem
                const mappedCortes = cohortsData.map(c => ({
                    id: c.id,
                    nombre: c.year.toString(),
                    link: `/jefe/cortes/${c.id}`
                }));
                setCortes(mappedCortes);
            } else {
                console.warn("Especialidad no encontrada:", selectedSpecialtyId);
                setSpecialty(null);
                setCohorts([]);
                setCortes([]);
            }
        } catch (err) {
            console.error("Error loading cortes:", err);
        } finally {
            setLoading(false);
        }
    }, [authUser]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Listen for specialty changes from Navbar
    useEffect(() => {
        const handleSpecialtyChange = () => {
            loadData();
        };

        window.addEventListener('specialtyChanged', handleSpecialtyChange);
        return () => {
            window.removeEventListener('specialtyChanged', handleSpecialtyChange);
        };
    }, [loadData]);

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoCorte("");
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoCorte("");
    };

    const agregarCorte = async () => {
        if (nuevoCorte.trim() === "") {
            alert("Por favor ingresa un año para el corte");
            return;
        }
        
        if (!specialty) {
            alert("No se ha identificado la especialidad. Contacte al administrador.");
            return;
        }

        const year = parseInt(nuevoCorte.trim());
        if (isNaN(year)) {
            alert("El año debe ser un número válido");
            return;
        }

        try {
            const newCohort = await specialtyService.createCohort(specialty.id, year);
            
            const nuevoCorteObj: CorteItem = {
                id: newCohort.id,
                nombre: newCohort.year.toString(),
                link: `/jefe/cortes/${newCohort.id}`
            };

            setCortes([...cortes, nuevoCorteObj]);
            setCohorts([...cohorts, newCohort]);
            cerrarModal();

            // Check if there are other cohorts with procedure configurations to copy from
            if (cohorts.length > 0) {
                setNewCohortId(newCohort.id);
                setShowCopyModal(true);
            }
        } catch (err) {
            alert("Error al crear el corte. Verifique que no exista ya.");
        }
    };

    const handleCopyConfiguration = async () => {
        if (!selectedSourceCohort || !newCohortId) return;
        
        setCopying(true);
        try {
            const result = await procedureService.copyConfiguration(newCohortId, selectedSourceCohort);
            alert(result.message);
            setShowCopyModal(false);
            setSelectedSourceCohort("");
            setNewCohortId(null);
            
            // Navigate to the new cohort's procedure configuration
            router.push(`/jefe/cortes/${newCohortId}/procedimientos`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al copiar configuración');
        } finally {
            setCopying(false);
        }
    };

    const skipCopyConfiguration = () => {
        setShowCopyModal(false);
        setSelectedSourceCohort("");
        setNewCohortId(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            agregarCorte();
        }
    };

    const handleClickCorte = (corte: CorteItem) => {
        if (corte.link) {
            router.push(corte.link);
        }
    };

    // Get cohorts that could have procedures to copy (excluding the newly created one)
    const availableSourceCohorts = cohorts.filter(c => c.id !== newCohortId);

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
          
            <Navbar title="Jefe de Beca" subtitle="Administrador" showProfile={false} />

            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Cortes {specialty ? `- ${specialty.name}` : ''}</h1>
                            <p className="text-gray-600 text-sm">Gestiona los cortes por año</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-10">Cargando...</div>
                        ) : (
                            /* Grid de 3 columnas  */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                                
                                {cortes.map((corte) => (
                                    <div
                                        key={corte.id}
                                        onClick={() => handleClickCorte(corte)}
                                        className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer min-h-[120px] flex flex-col items-center justify-center ${
                                            corte.link ? "hover:border-[#3FD0B6] hover:bg-blue-50/30" : "hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center mb-3">
                                            <span className="text-[#3FD0B6] text-lg">📅</span>
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-800 text-center">
                                            {corte.nombre}
                                        </h3>
                                        {corte.link && (
                                            <div className="mt-2 text-xs text-[#3FD0B6] font-medium">
                                                Click para acceder →
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Botón para agregar nuevo corte con diseño mejorado */}
                                <button 
                                    onClick={abrirModal}
                                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#3FD0B6] hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[120px]"
                                >
                                    <div className="text-2xl text-gray-400 mb-2">+</div>
                                    <div className="text-gray-500 font-medium text-sm text-center">Agregar Nuevo Corte</div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Agregar Nuevo Corte
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Año de Corte:
                            </label>
                            <input
                                type="text"
                                value={nuevoCorte}
                                onChange={(e) => setNuevoCorte(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ej: 2026, 2027..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cerrarModal}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarCorte}
                                className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para copiar configuración de procedimientos */}
            {showCopyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                ¡Corte Creado!
                            </h3>
                            <p className="text-gray-600">
                                ¿Desea copiar la configuración de procedimientos mínimos de otro corte?
                            </p>
                        </div>

                        {availableSourceCohorts.length > 0 ? (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Copiar procedimientos desde:
                                    </label>
                                    <select
                                        value={selectedSourceCohort}
                                        onChange={(e) => setSelectedSourceCohort(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] text-gray-800"
                                    >
                                        <option value="">Seleccione un corte...</option>
                                        {availableSourceCohorts.map((cohort) => (
                                            <option key={cohort.id} value={cohort.id}>
                                                Cohorte {cohort.year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={skipCopyConfiguration}
                                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Omitir
                                    </button>
                                    <button
                                        onClick={handleCopyConfiguration}
                                        disabled={copying || !selectedSourceCohort}
                                        className="flex-1 py-3 bg-[#3FD0B6] text-white rounded-xl font-semibold hover:bg-[#2A9D8F] transition-colors disabled:opacity-50"
                                    >
                                        {copying ? 'Copiando...' : 'Copiar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-500 mb-4">
                                    No hay otros cortes con configuración disponible para copiar.
                                </p>
                                <button
                                    onClick={() => {
                                        skipCopyConfiguration();
                                        if (newCohortId) {
                                            router.push(`/jefe/cortes/${newCohortId}/procedimientos`);
                                        }
                                    }}
                                    className="w-full py-3 bg-[#3FD0B6] text-white rounded-xl font-semibold hover:bg-[#2A9D8F] transition-colors"
                                >
                                    Configurar Procedimientos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
