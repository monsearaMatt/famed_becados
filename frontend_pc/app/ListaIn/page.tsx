"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Integrante {
    id: number;
    nombre: string;
    email: string;
}

interface IntegrantesProps {
    integrantesIniciales?: Integrante[];
}

export default function Integrantes({ integrantesIniciales }: IntegrantesProps) {
    const router = useRouter();
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

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
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

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Gestión de Integrantes</h1>
                            <p className="text-gray-600 text-sm">Administra los miembros</p>
                        </div>

                        {/* Información de estadísticas */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{integrantes.length}</div>
                                <div className="text-sm opacity-90">Integrantes Totales</div>
                            </div>
                        </div>

                        {/* Lista de integrantes*/}
                        <div className="space-y-3 flex-1">
                            {/* Encabezado de la tabla */}
                            <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                <div className="w-2/5">Nombre</div>
                                <div className="w-2/5">Email</div>
                                <div className="w-1/5 text-center">Acciones</div>
                            </div>
                            
                            {/* Integrantes */}
                            {integrantes.map((integrante) => (
                                <div 
                                    key={integrante.id} 
                                    className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="w-2/5">
                                        <button 
                                            onClick={() => handleClickNombre(integrante)}
                                            className="text-gray-800 font-medium hover:text-[#3FD0B6] hover:underline transition-colors text-left flex items-center space-x-2"
                                        >
                                            <div className="w-6 h-6 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center">
                                                <span className="text-[#3FD0B6] text-xs">👤</span>
                                            </div>
                                            <span>{integrante.nombre}</span>
                                        </button>
                                    </div>
                                    <div className="w-2/5">
                                        <span className="text-gray-600 text-sm">
                                            {integrante.email}
                                        </span>
                                    </div>
                                    <div className="w-1/5 flex justify-center">
                                        <button 
                                            onClick={() => eliminarIntegrante(integrante.id)}
                                            className="bg-white border border-red-300 rounded-lg px-3 py-1 text-red-600 text-xs hover:bg-red-50 transition-all duration-300 font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Botón Agregar  */}
                            <button 
                                onClick={abrirModal}
                                className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#3FD0B6] hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center"
                            >
                                <div className="text-2xl text-gray-400 mb-1">+</div>
                                <div className="text-gray-500 font-medium text-sm">Agregar Nuevo Integrante</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

          
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Agregar Nuevo Integrante
                        </h3>
                        
                        <div className="space-y-4 mb-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cerrarModal}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarIntegrante}
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