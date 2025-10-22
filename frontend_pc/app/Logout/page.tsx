"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Usuario {
    nombre: string;
    email: string;
    telefono: string;
}

export default function Perfil() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [editando, setEditando] = useState(false);
    const [usuario, setUsuario] = useState<Usuario>({
        nombre: user?.nombre || "Juan Pérez",
        email: user?.email || "juan.perez@email.com",
        telefono: "+569 2567 8900"
    });

    const [usuarioEditado, setUsuarioEditado] = useState<Usuario>(usuario);

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/Login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Actualizar usuario cuando cargue
    useEffect(() => {
        if (user) {
            const updatedUsuario = {
                nombre: `${user.nombre} ${user.apellido}`,
                email: user.email,
                telefono: "+569 2567 8900"
            };
            setUsuario(updatedUsuario);
            setUsuarioEditado(updatedUsuario);
        }
    }, [user]);

    const iniciarEdicion = () => {
        setUsuarioEditado(usuario);
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setUsuarioEditado(usuario);
    };

    const guardarCambios = () => {
        setUsuario(usuarioEditado);
        setEditando(false);
        alert("Cambios guardados exitosamente");
    };

    const handleInputChange = (field: keyof Usuario, value: string) => {
        setUsuarioEditado(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            logout();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3FD0B6]"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            
            <nav className="flex justify-end items-center py-6 px-8 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
                <div className="flex items-center space-x-4">
                    <button className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-3 text-white text-xl backdrop-blur-sm">
                        <span role="img" aria-label="notifications">
                            🔔
                        </span>
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-3 text-white text-xl backdrop-blur-sm">
                        <span role="img" aria-label="profile">
                            👤
                        </span>
                    </button>
                </div>
            </nav>

            {/* Contenedor principal */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-white shadow-2xl w-full max-w-4xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    
                    <div className="w-1/3 bg-gradient-to-b from-[#3FD0B6] to-[#2A9D8F] p-8 flex flex-col items-center justify-center rounded-l-3xl">
                        <div className="text-center">
                            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30 backdrop-blur-sm">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#2A9D8F]">
                                    {usuario.nombre.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <h2 className="text-white text-xl font-semibold mb-2">{usuario.nombre}</h2>
                            <p className="text-white/80 text-sm">Usuario</p>
                        </div>
                    </div>

                    
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header del perfil */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
                            <p className="text-gray-600">Gestiona tu información personal</p>
                        </div>

                        {/* Información del perfil*/}
                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                        <span className="text-[#3FD0B6] text-xl">👤</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-3">
                                            Nombre Completo
                                        </label>
                                        {editando ? (
                                            <input
                                                type="text"
                                                value={usuarioEditado.nombre}
                                                onChange={(e) => handleInputChange('nombre', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                                placeholder="Ingresa tu nombre completo"
                                            />
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                {usuario.nombre}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-3">
                                            Correo Electrónico
                                        </label>
                                        {editando ? (
                                            <input
                                                type="email"
                                                value={usuarioEditado.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                                placeholder="Ingresa tu correo electrónico"
                                            />
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                {usuario.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-3">
                                            Teléfono
                                        </label>
                                        {editando ? (
                                            <input
                                                type="tel"
                                                value={usuarioEditado.telefono}
                                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                                placeholder="Ingresa tu número de teléfono"
                                            />
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 border border-transparent">
                                                {usuario.telefono}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-center space-x-4 pt-4">
                                {editando ? (
                                    <>
                                        <button
                                            onClick={cancelarEdicion}
                                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={guardarCambios}
                                            className="px-8 py-3 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={iniciarEdicion}
                                            className="px-8 py-3 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2"
                                        >
                                            <span>✏️</span>
                                            <span>Editar Perfil</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2"
                                        >
                                            <span>🚪</span>
                                            <span>Cerrar Sesión</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}