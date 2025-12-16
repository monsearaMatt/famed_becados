"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { rubricService, Rubric } from "@/lib/services/rubricService";

const GestionRubricas: React.FC = () => {
    const router = useRouter();
    const [rubricas, setRubricas] = useState<Rubric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(null);

    const fetchRubricas = async (specialtyId?: string | null) => {
        try {
            setLoading(true);
            // Si no hay especialidad, pasamos undefined para traer todas (o manejar lógica vacía)
            // Pero según requerimiento, si cambia en navbar, debe filtrar.
            const idToUse = specialtyId === undefined ? selectedSpecialtyId : specialtyId;

            const data = await rubricService.getAll(idToUse || undefined);
            setRubricas(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar rúbricas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Cargar inicial desde localStorage
        const storedSpecialtyId = localStorage.getItem('selectedSpecialtyId');
        setSelectedSpecialtyId(storedSpecialtyId);
        fetchRubricas(storedSpecialtyId);

        // Escuchar cambios en el sistema de eventos del Navbar
        const handleSpecialtyChange = (event: CustomEvent) => {
            const newSpecialtyId = event.detail.specialtyId;
            setSelectedSpecialtyId(newSpecialtyId);
            fetchRubricas(newSpecialtyId);
        };

        window.addEventListener('specialtyChanged', handleSpecialtyChange as EventListener);

        return () => {
            window.removeEventListener('specialtyChanged', handleSpecialtyChange as EventListener);
        };
    }, []);

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await rubricService.delete(id);
            setRubricas(rubricas.filter(r => r.id !== id));
            setShowDeleteConfirm(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al eliminar rúbrica");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            <Navbar title="Jefe de Beca" subtitle="Gestión de Rúbricas" />

            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Rúbricas de Evaluación</h1>
                        <button
                            onClick={() => router.push("/jefe/rubricas/crear")}
                            className="bg-white text-[#2A9D8F] px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                        >
                            <span className="mr-2 text-xl">+</span>
                            Nueva Rúbrica
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-white text-center text-xl">Cargando rúbricas...</div>
                    ) : error ? (
                        <div className="bg-red-100 text-red-600 p-4 rounded-xl text-center">
                            {error}
                        </div>
                    ) : rubricas.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 text-center border border-white/20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No hay rúbricas creadas</h3>
                            <p className="text-white/80 mb-8">Comienza creando tu primera rúbrica de evaluación</p>
                            <button
                                onClick={() => router.push("/jefe/rubricas/crear")}
                                className="bg-white text-[#2A9D8F] px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                            >
                                Crear Rúbrica
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rubricas.map((rubrica) => (
                                <div key={rubrica.id} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-sm font-medium">
                                            {rubrica.specialty || "General"}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/jefe/rubricas/editar/${rubrica.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(rubrica.id!)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{rubrica.nombre}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{rubrica.descripcion}</p>
                                    <div className="flex items-center text-gray-500 text-sm mb-6">
                                        <span className="mr-4">📊 {rubrica.criterios.length} Criterios</span>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/jefe/rubricas/editar/${rubrica.id}`)}
                                        className="w-full py-3 border-2 border-[#3FD0B6] text-[#3FD0B6] rounded-xl font-semibold hover:bg-[#3FD0B6] hover:text-white transition-all duration-300"
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar rúbrica?</h3>
                            <p className="text-gray-600 mb-6">
                                Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta rúbrica?
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    disabled={deletingId === showDeleteConfirm}
                                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    {deletingId === showDeleteConfirm ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRubricas;