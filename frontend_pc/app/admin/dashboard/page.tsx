"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const AdminDashboard: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        if (user?.rol === 'admin_readonly') {
            setIsReadOnly(true);
        }
    }, [user]);

    const handleGestionarUsuarios = () => {
        router.push("/admin/listain");
    };

    const handleVerificarArchivos = () => {
        router.push("/admin/verificacion");
    };

    const handleEspecialidades = () => {
        router.push("/admin/specialties");
    };

    const handleExportar = () => {
        router.push("/admin/exportar");
    };

    const handleDoctorAssignments = () => {
        router.push("/admin/doctors");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">

            {/* Navegación  */}
            <Navbar title="Administrador" subtitle="Panel de Control" />

            {/* Contenido Principal */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">

                    {/* Contenido principal */}
                    <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">

                        {/* Header  */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel de Administrador</h1>
                            <p className="text-gray-600 text-lg max-w-2xl">
                                {isReadOnly
                                    ? 'Bienvenido al sistema. Puedes exportar información del sistema.'
                                    : 'Bienvenido al sistema de gestión. Administra usuarios, verifica archivos y configura la plataforma.'
                                }
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className={`grid grid-cols-1 ${isReadOnly ? 'max-w-md' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8 w-full max-w-6xl`}>

                            {/* Botón Gestionar Usuarios - Solo admin full */}
                            {!isReadOnly && (
                                <button
                                    onClick={handleGestionarUsuarios}
                                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-white text-2xl">👥</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                        Gestionar Usuarios
                                    </h3>
                                    <p className="text-gray-600 text-sm text-center">
                                        Administra becados, doctores y jefes de especialidad
                                    </p>
                                    <div className="mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                        <span className="text-sm">Gestionar</span>
                                        <span className="ml-2">→</span>
                                    </div>
                                </button>
                            )}

                            {/* Botón Verificar Archivos - Solo admin full */}
                            {!isReadOnly && (
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
                                        Visualiza y gestiona archivos del sistema
                                    </p>
                                    <div className="mt-4 text-[#3FD0B6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                        <span className="text-sm">Verificar</span>
                                        <span className="ml-2">→</span>
                                    </div>
                                </button>
                            )}

                            {/* Botón Especialidades - Solo admin full */}
                            {!isReadOnly && (
                                <button
                                    onClick={handleEspecialidades}
                                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-white text-2xl">🎓</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                        Especialidades
                                    </h3>
                                    <p className="text-gray-600 text-sm text-center">
                                        Gestiona especialidades y cohortes
                                    </p>
                                    <div className="mt-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                        <span className="text-sm">Gestionar</span>
                                        <span className="ml-2">→</span>
                                    </div>
                                </button>
                            )}

                            {/* Botón Asignaciones de Doctores - Solo admin full */}
                            {!isReadOnly && (
                                <button
                                    onClick={handleDoctorAssignments}
                                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <span className="text-white text-2xl">👨‍⚕️</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-300">
                                        Asignaciones de Doctores
                                    </h3>
                                    <p className="text-gray-600 text-sm text-center">
                                        Asigna doctores a especialidades y cohortes
                                    </p>
                                    <div className="mt-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                        <span className="text-sm">Configurar</span>
                                        <span className="ml-2">→</span>
                                    </div>
                                </button>
                            )}

                            {/* Botón Exportar Datos - Disponible para admin y admin_readonly */}
                            <button
                                onClick={handleExportar}
                                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-amber-500 hover:shadow-2xl transition-all duration-500 flex flex-col items-center justify-center h-64"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-white text-2xl">📥</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">
                                    Exportar Datos
                                </h3>
                                <p className="text-gray-600 text-sm text-center">
                                    Exporta información del sistema a CSV
                                </p>
                                <div className="mt-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                                    <span className="text-sm">Exportar</span>
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
                    Sistema de Gestión - MUDIC
                </p>
            </footer>
        </div>
    );
};

export default AdminDashboard;
