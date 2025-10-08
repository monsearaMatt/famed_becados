"use client";
import React, { useState } from "react";
import AgregarIntegranteButton from "./IntegratnteButton";

interface Integrante {
    id: number;
    nombre: string;
    email: string;
}

interface IntegrantesProps {
    integrantesIniciales?: Integrante[];
}

export default function Integrantes({ integrantesIniciales }: IntegrantesProps) {
    const [integrantes, setIntegrantes] = useState<Integrante[]>(
        integrantesIniciales || [
            { 
                id: 1, 
                nombre: "Juan Pérez", 
                email: "juan.perez@email.com"
            },
            { 
                id: 2, 
                nombre: "María García", 
                email: "maria.garcia@email.com"
            },
            { 
                id: 3, 
                nombre: "Carlos López", 
                email: "carlos.lopez@email.com"
            }
        ]
    );
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoIntegrante, setNuevoIntegrante] = useState({
        nombre: "",
        email: ""
    });

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoIntegrante({
            nombre: "",
            email: ""
        });
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoIntegrante({
            nombre: "",
            email: ""
        });
    };

    const agregarIntegrante = () => {
        if (nuevoIntegrante.nombre.trim() === "" || 
            nuevoIntegrante.email.trim() === "") {
            alert("Por favor completa todos los campos");
            return;
        }

        const nuevoIntegranteObj = {
            id: Date.now(),
            nombre: nuevoIntegrante.nombre.trim(),
            email: nuevoIntegrante.email.trim()
        };
        
        setIntegrantes([...integrantes, nuevoIntegranteObj]);
        cerrarModal();
    };

    const eliminarIntegrante = (id: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este integrante?")) {
            setIntegrantes(integrantes.filter(integrante => integrante.id !== id));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            agregarIntegrante();
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setNuevoIntegrante(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClickNombre = (integrante: Integrante) => {
       
        console.log("Clic en:", integrante.nombre);
        
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
                 <h2 className="text-4xl font-semibold text-gray-800">
                  Integrantes
                 </h2>
                 <div className="border border-gray-400 rounded-lg py-2 px-4 text-sm text-gray-600">
                   Total: {integrantes.length}
                 </div>
                </div>
                
              
                <div className="flex flex-col space-y-4">
                    
                    <div className="flex items-center w-full py-4 border-b-2 border-gray-300 font-semibold text-gray-700">
                        <div className="w-1/2">Nombre</div>
                        <div className="w-1/2">Email</div>
                        <div className="w-1/4 text-center"></div>
                    </div>
                    
                   
                    {integrantes.map((integrante) => (
                        <div key={integrante.id} className="flex items-center w-full py-4 border-b border-gray-200">
                            <div className="w-1/2">
                                <button 
                                    onClick={() => handleClickNombre(integrante)}
                                    className="text-gray-800 font-medium hover:text-[#3FD0B6] hover:underline transition-colors text-left"
                                >
                                    {integrante.nombre}
                                </button>
                            </div>
                            <div className="w-1/2">
                                <span className="text-gray-600">
                                    {integrante.email}
                                </span>
                            </div>
                            <div className="w-1/4 flex justify-center">
                                <button 
                                    onClick={() => eliminarIntegrante(integrante.id)}
                                    className="bg-white border border-gray-400 rounded-md py-1 px-3 text-red-600 text-sm hover:bg-red-50 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    
                  
                    <AgregarIntegranteButton onAgregar={abrirModal} />
                </div>
            </div>

           
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                            Agregar Nuevo Integrante
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Nombre completo:
                                </label>
                                <input
                                    type="text"
                                    value={nuevoIntegrante.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: Ana Martínez"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    value={nuevoIntegrante.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: ana.martinez@email.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cerrarModal}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarIntegrante}
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