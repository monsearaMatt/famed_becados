"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface CorteItem {
    id: number;
    nombre: string;
    link?: string;
}

export default function Cortes() {
    const router = useRouter();
    
    const [cortes, setCortes] = useState<CorteItem[]>([
        { id: 1, nombre: "2023", link: "/Jefe_especialidad" },
        { id: 2, nombre: "2024" },
        { id: 3, nombre: "2025" }
    ]);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoCorte, setNuevoCorte] = useState("");

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoCorte("");
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoCorte("");
    };

    const agregarCorte = () => {
        if (nuevoCorte.trim() === "") {
            alert("Por favor ingresa un año para el corte");
            return;
        }

        const nuevoCorteObj = {
            id: Date.now(),
            nombre: nuevoCorte.trim()
        };

        setCortes([...cortes, nuevoCorteObj]);
        cerrarModal();
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

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
          
            <nav className="flex justify-end items-center py-4 px-6 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
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

            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Cortes</h1>
                            <p className="text-gray-600 text-sm">Gestiona los cortes por año</p>
                        </div>

                    

                        {/* Grid de 3 columnas  */}
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
        </div>
    );
}