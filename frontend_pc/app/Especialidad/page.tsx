
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface TecnologiaItem {
    id: number;
    nombre: string;
    link?: string;
}

export default function Tecnologia() {
    const router = useRouter();
    
    const [tecnologias, setTecnologias] = useState<TecnologiaItem[]>([
        { id: 1, nombre: "doctorado", link: "/ListaIn" },
        { id: 2, nombre: "dermatologia" },
        { id: 3, nombre: "internado alessandri" }
    ]);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevaTecnologia, setNuevaTecnologia] = useState("");

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevaTecnologia("");
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevaTecnologia("");
    };

    const agregarTecnologia = () => {
        if (nuevaTecnologia.trim() === "") {
            alert("Por favor ingresa un nombre para la tecnología");
            return;
        }

        const nuevaTecnologiaObj = {
            id: Date.now(),
            nombre: nuevaTecnologia.trim()
        };

        setTecnologias([...tecnologias, nuevaTecnologiaObj]);
        cerrarModal();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            agregarTecnologia();
        }
    };

    const handleClickTecnologia = (tecnologia: TecnologiaItem) => {
        if (tecnologia.link) {
            router.push(tecnologia.link);
        }
        
    };

    return (
        <div className="bg-[#EEEEEE] min-h-screen flex flex-col items-center">
            
           
            <nav className="flex justify-end items-center w-full py-12 bg-[#3FD0B6] border-b-8 border-gray-300">
                <button
                    className="bg-none border-none mr-12 cursor-pointer text-6xl w-20 h-20"
                >
                    <span role="img" aria-label="notifications">
                        🔔
                    </span>
                </button>
                <button
                    className="bg-none border-none cursor-pointer text-6xl w-20 h-20"
                >
                    <span role="img" aria-label="profile">
                        👤
                    </span>
                </button>
            </nav>

            
            <div
                className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-16 w-[calc(100%-4rem)] min-h-screen mt-0 mb-8 relative border-2 border-[#4b867b]"
            >
              
                <div className="flex justify-between items-center mb-12 border-4 border-[#3fd0b6] rounded-lg p-4">
                    <h1 className="text-4xl font-semibold text-gray-800">
                        Especialidad
                    </h1>
                    
                </div>
                
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   
                    {tecnologias.map((tecnologia) => (
                        <div
                            key={tecnologia.id}
                            onClick={() => handleClickTecnologia(tecnologia)}
                            className={`bg-white border-2 border-[#3fd0b6] rounded-2xl p-8 hover:shadow-lg transition-all cursor-pointer min-h-[140px] flex items-center justify-center ${
                                tecnologia.link ? "hover:bg-blue-50 hover:border-blue-500" : ""
                            }`}
                        >
                            <h3 className="text-2xl font-semibold text-gray-800 text-center">
                                {tecnologia.nombre}
                            </h3>
                        </div>
                    ))}
                    
                    
                    <button 
                        onClick={abrirModal}
                        className="bg-white border-2 border-dashed border-gray-400 rounded-2xl p-8 hover:border-[#3fd0b6] hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[140px]"
                    >
                        <div className="text-4xl text-gray-400 mb-3">+</div>
                        <div className="text-gray-500 font-medium text-lg">Agregar</div>
                    </button>
                </div>
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Agregar Nueva Especialización
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Nombre de la especialización
                            </label>
                            <input
                                type="text"
                                value={nuevaTecnologia}
                                onChange={(e) => setNuevaTecnologia(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cerrarModal}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarTecnologia}
                                className="px-6 py-2 bg-[#3FD0B6] text-white rounded-lg hover:bg-[#35b8a0] transition-colors"
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