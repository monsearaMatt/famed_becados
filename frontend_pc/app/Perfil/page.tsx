"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { userService } from "@/lib/services/userService";
import { profileService } from "@/lib/services/profileService";

interface Usuario {
    nombre: string;
    email: string;
    telefono: string;
    rut: string;
    rol: string;
}

export default function Perfil() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const [editando, setEditando] = useState(false);
    const [usuario, setUsuario] = useState<Usuario>({
        nombre: "",
        email: "",
        telefono: "",
        rut: "",
        rol: ""
    });

    const [usuarioEditado, setUsuarioEditado] = useState<Usuario>(usuario);

    // Actualizar usuario cuando cargue
    useEffect(() => {
        const fetchMyProfile = async () => {
            if (user?.rut) {
                console.log("Fetching profile for user:", user);
                try {
                    // Try to fetch full profile from becado-service (includes email, phone)
                    console.log("Calling profileService.getMyProfile with role:", user.rol);
                    const fullProfile = await profileService.getMyProfile(user.rol);
                    console.log("Full profile fetched successfully:", fullProfile);
                    
                    const profileData = {
                        nombre: fullProfile.fullName,
                        email: fullProfile.email || user.email || "",
                        telefono: fullProfile.phone || "+569 2567 8900",
                        rut: fullProfile.rut,
                        rol: user.rol // Keep role from auth context as profile might not have it explicitly
                    };
                    
                    setUsuario(profileData);
                    setUsuarioEditado(profileData);
                } catch (error) {
                    console.error("Error fetching profile from service, falling back to auth:", error);
                    
                    // Fallback to userService (Auth service)
                    try {
                        console.log("Attempting fallback to userService...");
                        const authUser = await userService.getByRut(user.rut);
                        console.log("Fallback auth user fetched:", authUser);
                        const fallbackData = {
                            nombre: authUser.fullName,
                            email: user.email || "",
                            telefono: "+569 2567 8900",
                            rut: authUser.rut,
                            rol: authUser.role
                        };
                        setUsuario(fallbackData);
                        setUsuarioEditado(fallbackData);
                    } catch (authError) {
                        console.error("Error fetching from auth service:", authError);
                        // Final fallback to local storage data
                        const localData = {
                            nombre: `${user.nombre} ${user.apellido}`,
                            email: user.email,
                            telefono: "+569 2567 8900",
                            rut: user.rut,
                            rol: user.rol
                        };
                        setUsuario(localData);
                        setUsuarioEditado(localData);
                    }
                }
            }
        };

        if (!isLoading && user) {
            fetchMyProfile();
        }
    }, [user, isLoading]);

    const iniciarEdicion = () => {
        setUsuarioEditado(usuario);
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setUsuarioEditado(usuario);
    };

    const guardarCambios = async () => {
        try {
            // Map UI fields to API fields
            // Note: We map 'nombre' to 'fullName' and 'telefono' to 'phone'
            const updateData = {
                fullName: usuarioEditado.nombre,
                email: usuarioEditado.email,
                phone: usuarioEditado.telefono,
            };
            
            console.log("Guardando cambios...", updateData);
            await profileService.updateProfile(usuario.rol, updateData);
            console.log("Cambios guardados exitosamente en el backend");
            
            setUsuario(usuarioEditado);
            setEditando(false);
            alert("Cambios guardados exitosamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al guardar los cambios: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
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
            
            <Navbar title="Mi Perfil" subtitle="Cuenta" />

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

                                    {/* Solo mostrar email y teléfono si NO es admin */}
                                    {usuario.rol !== 'admin' && usuario.rol !== 'admin_readonly' && (
                                        <>
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
                                        </>
                                    )}

                                    {/* Nota para admin */}
                                    {(usuario.rol === 'admin' || usuario.rol === 'admin_readonly') && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-blue-700 text-sm">
                                                💡 Como administrador, solo puedes modificar tu nombre. 
                                                Para cambiar la contraseña, contacta a otro administrador.
                                            </p>
                                        </div>
                                    )}
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