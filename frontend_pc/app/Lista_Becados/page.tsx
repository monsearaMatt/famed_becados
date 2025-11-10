"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Becado {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
}

interface BecadosProps {
    becadosIniciales?: Becado[];
}

export default function ListaBecados({ becadosIniciales }: BecadosProps) {
    const router = useRouter();
    const [becados, setBecados] = useState<Becado[]>(
        becadosIniciales || [
            { 
                id: 1, 
                nombre: "María",
                apellido: "García",
                email: "maria.garcia@email.com"
            },
            { 
                id: 2, 
                nombre: "Ana", 
                apellido: "Rodríguez",
                email: "ana.rodriguez@email.com"
            },
            { 
                id: 3, 
                nombre: "Luis",
                apellido: "Martínez",
                email: "luis.martinez@email.com"
            },
            { 
                id: 4, 
                nombre: "Carlos",
                apellido: "Hernández",
                email: "carlos.hernandez@email.com"
            },
            { 
                id: 5, 
                nombre: "Sofía",
                apellido: "López",
                email: "sofia.lopez@email.com"
            }
        ]
    );
    
    const [mostrarPopupNavegacion, setMostrarPopupNavegacion] = useState(false);
    const [becadoSeleccionado, setBecadoSeleccionado] = useState<Becado | null>(null);

    const abrirPopupNavegacion = (becado: Becado) => {
        setBecadoSeleccionado(becado);
        setMostrarPopupNavegacion(true);
    };

    const cerrarPopupNavegacion = () => {
        setMostrarPopupNavegacion(false);
        setBecadoSeleccionado(null);
    };

    const navegarA = (ruta: string, becadoId?: number) => {
        if (ruta === "/Perfil" && becadoSeleccionado) {
            router.push(`/Perfil/${becadoSeleccionado.id}`);
        } else {
            router.push(ruta);
        }
        cerrarPopupNavegacion();
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
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Lista de Becados</h1>
                            <p className="text-gray-600 text-sm">Miembros del programa de becas</p>
                        </div>

                        {/* Información de estadísticas */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{becados.length}</div>
                                <div className="text-sm opacity-90">Total de Becados</div>
                            </div>
                        </div>

                        {/* Lista de becados */}
                        <div className="space-y-3 flex-1">
                            {/* Encabezado de la tabla */}
                            <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                <div className="w-1/2">Nombre Completo</div>
                                <div className="w-1/2">Email</div>
                            </div>
                            
                            {/* Becados */}
                            {becados.map((becado) => (
                                <div 
                                    key={becado.id} 
                                    className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="w-1/2">
                                        <button 
                                            onClick={() => abrirPopupNavegacion(becado)}
                                            className="text-gray-800 font-medium hover:text-[#3FD0B6] hover:underline transition-colors text-left flex items-center space-x-2"
                                        >
                                            <div className="w-6 h-6 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center">
                                                <span className="text-[#3FD0B6] text-xs">👤</span>
                                            </div>
                                            <span>{becado.nombre} {becado.apellido}</span>
                                        </button>
                                    </div>
                                    <div className="w-1/2">
                                        <span className="text-gray-600 text-sm">
                                            {becado.email}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup de navegación */}
            {mostrarPopupNavegacion && becadoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {becadoSeleccionado.nombre} {becadoSeleccionado.apellido}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Becado
                            </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <button
                                onClick={() => navegarA("/Perfil", becadoSeleccionado.id)}
                                className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#3FD0B6] hover:bg-blue-50/30 transition-all duration-300 text-left"
                            >
                                <span className="text-xl">👤</span>
                                <div>
                                    <div className="font-medium text-gray-800">Perfil</div>
                                    <div className="text-xs text-gray-500">Ver perfil completo</div>
                                </div>
                            </button>
                            <button
                                onClick={() => navegarA("/Areapersonal")}
                                className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#3FD0B6] hover:bg-blue-50/30 transition-all duration-300 text-left"
                            >
                                <span className="text-xl">🏠</span>
                                <div>
                                    <div className="font-medium text-gray-800">Homepage</div>
                                    <div className="text-xs text-gray-500">Área personal</div>
                                </div>
                            </button>
                        </div>
                        
                        <div className="flex justify-center">
                            <button
                                onClick={cerrarPopupNavegacion}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}