"use client";
import React from "react";
import { useRouter } from "next/navigation";

const JefeDashboard: React.FC = () => {
    const router = useRouter();

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const handleCrearRubricas = () => {
        router.push("/Jefe_rubricas");
    };

    const handleVerificarArchivos = () => {
        router.push("/Jefe_verificacion");
    };

    const handleCortes = () => {
        router.push("/Jefe_cortes");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <nav className="flex justify-between items-center py-4 px-6 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">👤</span>
                        </div>
                        <div className="text-white">
                            <div className="font-medium">Jefe de Beca</div>
                            <div className="text-xs opacity-80">Administrador</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-2 text-white text-lg backdrop-blur-sm">
                        <span role="img" aria-label="notifications">
                            🔔
                        </span>
                    </button>
                    <button 
                        onClick={handleProfileClick}
                        className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-2 text-white text-lg backdrop-blur-sm"
                    >
                        <span role="img" aria-label="profile">
                            👤
                        </span>
                    </button>
                </div>
            </nav>

            {/* Contenido Principal */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                        
                        {/* Header  */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel del Jefe de Beca</h1>
                            <p className="text-gray-600 text-lg max-w-2xl">
                                Bienvenido al sistema de gestión de becarios. Gestiona rúbricas, verifica archivos y administra cortes.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                            
                            {/* Botón Crear Rúbricas */}
                            <button 
                                onClick={handleCrearRubricas}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📊</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                    Crear Rúbricas
                                </h3>
                                <p className="text-gray-600 text-sm text-center">
                                    Diseña y gestiona rúbricas de evaluación para los becarios
                                </p>
                                <div className="mt-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Gestionar</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </button>

                            {/* Botón Verificar Archivos */}
                            <button 
                                onClick={handleVerificarArchivos}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-[#3FD0B6] hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📁</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-[#3FD0B6] transition-colors duration-300">
                                    Verificar Archivos
                                </h3>
                                <p className="text-gray-600 text-sm text-center">
                                    Revisa y aprueba documentos enviados por los becarios
                                </p>
                                <div className="mt-4 text-[#3FD0B6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Revisar</span>
                                    <span className="ml-2">→</span>
                                </div>
                            </button>

                            {/* Botón Cortes */}
                            <button 
                                onClick={handleCortes}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-orange-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📅</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                                    Cortes
                                </h3>
                                <p className="text-gray-600 text-sm text-center">
                                    Administra periodos de evaluación y cortes semestrales
                                </p>
                                <div className="mt-4 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Administrar</span>
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
                    Sistema de Gestión de Becarios - MUDIC
                </p>
            </footer>
        </div>
    );
};

export default JefeDashboard;