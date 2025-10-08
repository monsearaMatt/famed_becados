"use client";
import React, { useState } from "react";
import AgregarFilaButton from "./agregarfilabutton";

interface Fila {
    id: number;
    nombre: string;
}

interface BecadoProps {
    filasIniciales?: Fila[];
}

export default function Becado({ filasIniciales }: BecadoProps) {
    const [filas, setFilas] = useState<Fila[]>(
        filasIniciales || [
            { id: 1, nombre: "Intubación" },
            { id: 2, nombre: "Medicación" },
            { id: 3, nombre: "Cateter" }
        ]
    );
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("");

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoNombre("");
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoNombre("");
    };

    const agregarFila = () => {
        if (nuevoNombre.trim() === "") {
            alert("Por favor ingresa un nombre para el procedimiento");
            return;
        }

        const nuevaFila = {
            id: Date.now(),
            nombre: nuevoNombre.trim()
        };
        
        setFilas([...filas, nuevaFila]);
        cerrarModal();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            agregarFila();
        }
    };

    return (
        <div className="bg-[#EEEEEE] min-h-screen flex flex-col items-center">
            
            {/* Navegación */}
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

            {/* Contenedor principal - CORREGIDO */}
            <div
                className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-16 w-[calc(100%-4rem)] min-h-screen mt-0 mb-8 relative border-2 border-[#4b867b]"
            >
                {/* Título de la sección y estado de completado */}
                <div className="flex justify-between items-center mb-12 border-4 border-[#3fd0b6] rounded-lg p-4">
                 <h2 className="text-4xl font-semibold text-gray-800">
                  Procedimientos
                 </h2>
                 <div className="border border-gray-400 rounded-lg py-2 px-4 text-sm text-gray-600">
                   Completado %
                 </div>
                </div>
                
                {/* Contenedor de las filas de tareas */}
                <div className="flex flex-col space-y-4">
                    <div className="h-8 border-b-2 border-gray-300 w-full" />
                    
                    {/* Renderizar filas dinámicamente */}
                    {filas.map((fila) => (
                        <React.Fragment key={fila.id}>
                            <div className="flex items-center w-full">
                                <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-800 text-left">
                                    {fila.nombre}
                                </button>
                                <div className="flex items-center space-x-4 ml-auto">
                                    <input type="checkbox" className="h-6 w-6 border-2 border-gray-400 rounded-md" />
                                    <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                        Subir archivos
                                    </button>
                                    <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                        Comentarios
                                    </button>
                                </div>
                            </div>
                            <div className="border-b-2 border-gray-300 w-full" />
                        </React.Fragment>
                    ))}
                    
                    {/* Botón de "Agregar" */}
                    <AgregarFilaButton onAgregar={abrirModal} />
                </div>
            </div>

            {/* Modal para agregar nueva fila */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                            Agregar Nuevo Procedimiento
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Nombre del procedimiento:
                            </label>
                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ej: Radiografía, Análisis de sangre..."
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
                                onClick={agregarFila}
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