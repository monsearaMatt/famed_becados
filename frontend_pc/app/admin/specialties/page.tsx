"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { specialtyService, Specialty } from "@/lib/services/specialtyService";

export default function AdminSpecialtiesPage() {
    const router = useRouter();
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSpecialties = async () => {
            try {
                const data = await specialtyService.getSpecialties();
                setSpecialties(data);
            } catch (error) {
                console.error("Error loading specialties", error);
            } finally {
                setLoading(false);
            }
        };
        loadSpecialties();
    }, []);

    return (
        <div className="theme-gradient min-h-screen flex flex-col">
            <Navbar title="Gestión de Especialidades" subtitle="Administración" />

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Especialidades</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/admin/users/new")}
                            className="theme-button-secondary px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform hover:scale-105 flex items-center"
                        >
                            <span className="text-2xl mr-2">👤</span>
                            Nuevo Usuario
                        </button>
                        <button
                            onClick={() => router.push("/admin/specialties/new")}
                            className="theme-button-secondary px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform hover:scale-105 flex items-center"
                        >
                            <span className="text-2xl mr-2">+</span>
                            Nueva Especialidad
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-white text-center text-xl">Cargando...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specialties.map((spec) => (
                            <div
                                key={spec.id}
                                onClick={() => router.push(`/admin/specialties/${spec.id}`)}
                                className="theme-card rounded-2xl p-6 shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#3FD0B6]/20 rounded-xl flex items-center justify-center group-hover:bg-[#3FD0B6] transition-colors duration-300">
                                        <span className="text-2xl">🏥</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block theme-text-muted text-xs font-medium">ID: {spec.id.slice(-4)}</span>
                                        {spec.startYear && (
                                            <span className="block text-[#3FD0B6] font-bold text-sm mt-1">
                                                {spec.startYear}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold theme-text-heading mb-2 group-hover:text-[#3FD0B6] transition-colors">
                                    {spec.name}{spec.startYear ? ` (${spec.startYear})` : ''}
                                </h3>

                                <div className="flex items-center theme-text-muted text-sm font-medium">
                                    <span>Ver detalles y participantes →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

