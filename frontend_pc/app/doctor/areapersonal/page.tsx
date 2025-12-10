"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const DoctorDashboard: React.FC = () => {
    const router = useRouter();

    const handleEvaluarRubrica = () => {
        router.push("/doctor/selcbecado");
    };

    const handleVerHistorial = () => {
        router.push("/doctor/historial");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <Navbar title="Dr. Carlos López" subtitle="Evaluador" />

            {/* Contenido Principal */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-4xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                        
                        {/* Header  */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel del Evaluador</h1>
                            <p className="text-gray-600 text-lg max-w-md">
                                Bienvenido al sistema de evaluación de becados. Selecciona una opción para comenzar.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                            
                            {/* Botón Evaluar Rúbrica */}
                            <button 
                                onClick={handleEvaluarRubrica}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-[#3FD0B6] hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📊</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#3FD0B6] transition-colors duration-300">
                                    Evaluar Rúbrica
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Selecciona un becado y comienza una nueva evaluación
                                </p>
                                <div className="mt-4 text-[#3FD0B6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Comenzar evaluación</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </button>

                            {/* Botón Ver Historial */}
                            <button 
                                onClick={handleVerHistorial}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📋</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                    Ver Historial
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Consulta el historial completo de evaluaciones realizadas
                                </p>
                                <div className="mt-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Ver historial</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </button>
                        </div>

                        
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-4 px-6 text-center">
                <p className="text-white/70 text-sm">
                    Sistema de Evaluación de Becados - MUDIC
                </p>
            </footer>
        </div>
    );
};

export default DoctorDashboard;