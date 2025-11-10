"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Integrante {
    id: number;
    nombre: string;
    apellido: string;
    password: string;
    rol: string;
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
                nombre: "Juan",
                apellido: "Pérez",
                password: "password123",
                rol: "admin",
                email: "juan.perez@email.com"
            },
            { 
                id: 2, 
                nombre: "María", 
                apellido: "García",
                password: "password456",
                rol: "becado",
                email: "maria.garcia@email.com"
            },
            { 
                id: 3, 
                nombre: "Carlos",
                apellido: "López",
                password: "password789",
                rol: "doctor", 
                email: "carlos.lopez@email.com"
            },
            { 
                id: 4, 
                nombre: "Antony",
                apellido: "Marin",
                password: "password789",
                rol: "jefeBeca", 
                email: "antony.Mmarin@email.com"
            }
        ]
    );
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarPopupNavegacion, setMostrarPopupNavegacion] = useState(false);
    const [integranteSeleccionado, setIntegranteSeleccionado] = useState<Integrante | null>(null);
    const [nuevoIntegrante, setNuevoIntegrante] = useState({
        nombre: "",
        apellido: "",
        password: "",
        rol: "",    
        email: ""
    });
    const [exportando, setExportando] = useState(false);

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoIntegrante({
            nombre: "",
            apellido: "",
            password: "",
            rol: "",
            email: ""
        });
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoIntegrante({
            nombre: "",
            apellido: "",
            password: "",
            rol: "",
            email: ""
        });
    };

    const abrirPopupNavegacion = (integrante: Integrante) => {
        setIntegranteSeleccionado(integrante);
        setMostrarPopupNavegacion(true);
    };

    const cerrarPopupNavegacion = () => {
        setMostrarPopupNavegacion(false);
        setIntegranteSeleccionado(null);
    };

    const navegarA = (ruta: string, integranteId?: number) => {
        if (ruta === "/Perfil" && integranteSeleccionado) {
            // Navegar al perfil específico del usuario
            router.push(`/Perfil/${integranteSeleccionado.id}`);
        } else {
            router.push(ruta);
        }
        cerrarPopupNavegacion();
    };

    const exportarArchivoComprimido = async () => {
        setExportando(true);
        try {
            // Llamar al endpoint del backend que genera el archivo comprimido
            const response = await fetch('/api/export/compressed', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Obtener el blob del archivo comprimido
            const blob = await response.blob();
            
            // Crear URL para descargar
            const url = URL.createObjectURL(blob);
            
            // Obtener el nombre del archivo del header Content-Disposition o usar uno por defecto
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `backup_integrantes_${new Date().toISOString().split('T')[0]}.zip`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            
            // Crear elemento de descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // Simular click para descargar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Liberar memoria
            URL.revokeObjectURL(url);
            
            alert(`Archivo comprimido exportado exitosamente!\nTotal de integrantes: ${integrantes.length}`);
            
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar el archivo comprimido. Por favor, intenta nuevamente.');
        } finally {
            setExportando(false);
        }
    };

    // Función alternativa si el backend no está listo - simula la exportación
    const exportarArchivoComprimidoSimulado = async () => {
        setExportando(true);
        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Crear datos para exportar
            const datosExportar = {
                fechaExportacion: new Date().toISOString(),
                totalIntegrantes: integrantes.length,
                integrantes: integrantes,
                estadisticas: {
                    porRol: {
                        admin: integrantes.filter(i => i.rol === 'admin').length,
                        jefeBeca: integrantes.filter(i => i.rol === 'jefeBeca').length,
                        doctor: integrantes.filter(i => i.rol === 'doctor').length,
                        becado: integrantes.filter(i => i.rol === 'becado').length
                    }
                }
            };

            // Convertir a JSON
            const datosJSON = JSON.stringify(datosExportar, null, 2);
            
            // Crear blob (simulando un archivo comprimido)
            const blob = new Blob([datosJSON], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            
            // Crear elemento de descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_integrantes_${new Date().toISOString().split('T')[0]}.zip`;
            
            // Simular click para descargar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Liberar memoria
            URL.revokeObjectURL(url);
            
            alert(`Archivo comprimido exportado exitosamente!\nTotal de integrantes: ${integrantes.length}`);
            
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar el archivo comprimido. Por favor, intenta nuevamente.');
        } finally {
            setExportando(false);
        }
    };

    const agregarIntegrante = () => {
        if (nuevoIntegrante.nombre.trim() === "" || 
            nuevoIntegrante.apellido.trim() === "" ||
            nuevoIntegrante.password.trim() === "" ||
            nuevoIntegrante.rol.trim() === "" ||
            nuevoIntegrante.email.trim() === "") {
            alert("Por favor completa todos los campos");
            return;
        }

        const nuevoIntegranteObj = {
            id: Date.now(),
            nombre: nuevoIntegrante.nombre.trim(),
            apellido: nuevoIntegrante.apellido.trim(),
            password: nuevoIntegrante.password.trim(),
            rol: nuevoIntegrante.rol.trim(),
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

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const getColorRol = (rol: string) => {
        switch(rol.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'jefebeca':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'doctor':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'becado':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getOpcionesNavegacion = (rol: string) => {
        switch(rol.toLowerCase()) {
            case 'becado':
                return [
                    { ruta: "/Perfil", nombre: "Perfil", icono: "👤" },
                    { ruta: "/Areapersonal", nombre: "Homepage", icono: "🏠" }
                ];
            case 'doctor':
                return [
                    { ruta: "/Perfil", nombre: "Perfil", icono: "👤" },
                    { ruta: "/Areapersonal", nombre: "Homepage", icono: "🏠" }
                ];
            case 'jefebeca':
                return [
                    { ruta: "/Perfil", nombre: "Perfil", icono: "👤" },
                    { ruta: "/Cortes", nombre: "Homepage", icono: "🏠" }
                ];
            case 'admin':
                return [
                    { ruta: "/Perfil", nombre: "Perfil", icono: "👤" },
                    { ruta: "/admin", nombre: "Panel Admin", icono: "⚙️" }
                ];
            default:
                return [
                    { ruta: "/Perfil", nombre: "Perfil", icono: "👤" }
                ];
        }
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
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Gestión de Integrantes</h1>
                            <p className="text-gray-600 text-sm">Administra los miembros del equipo</p>
                        </div>

                        {/* Información de estadísticas con botón de exportar */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{integrantes.length}</div>
                                <div className="text-sm opacity-90">Integrantes Totales</div>
                            </div>
                            
                            {/* Botón único de exportar archivo comprimido */}
                            <div className="flex space-x-2">
                                <button 
                                    onClick={exportarArchivoComprimido} // Cambia a exportarArchivoComprimidoSimulado si el backend no está listo
                                    disabled={exportando}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-4 py-3 hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportando ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            <span>Exportando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📦</span>
                                            <span>Exportar Backup</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Lista de integrantes*/}
                        <div className="space-y-3 flex-1">
                            {/* Encabezado de la tabla */}
                            <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                <div className="w-1/4">Nombre</div>
                                <div className="w-1/4">Email</div>
                                <div className="w-1/4">Rol</div>
                                <div className="w-1/4 text-center">Acciones</div>
                            </div>
                            
                            {/* Integrantes */}
                            {integrantes.map((integrante) => (
                                <div 
                                    key={integrante.id} 
                                    className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="w-1/4">
                                        <button 
                                            onClick={() => abrirPopupNavegacion(integrante)}
                                            className="text-gray-800 font-medium hover:text-[#3FD0B6] hover:underline transition-colors text-left flex items-center space-x-2"
                                        >
                                            <div className="w-6 h-6 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center">
                                                <span className="text-[#3FD0B6] text-xs">👤</span>
                                            </div>
                                            <span>{integrante.nombre} {integrante.apellido}</span>
                                        </button>
                                    </div>
                                    <div className="w-1/4">
                                        <span className="text-gray-600 text-sm">
                                            {integrante.email}
                                        </span>
                                    </div>
                                    <div className="w-1/4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorRol(integrante.rol)}`}>
                                            {integrante.rol}
                                        </span>
                                    </div>
                                    <div className="w-1/4 flex justify-center">
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

            {/* Modal para agregar integrante */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Agregar Nuevo Integrante
                        </h3>
                        
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Nombre:
                                </label>
                                <input
                                    type="text"
                                    value={nuevoIntegrante.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: Ana"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Apellido:
                                </label>
                                <input
                                    type="text"
                                    value={nuevoIntegrante.apellido}
                                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: Manzano"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Contraseña:
                                </label>
                                <input
                                    type="password"
                                    value={nuevoIntegrante.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: akj1A29Qa@d123"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Rol:
                                </label>
                                <select
                                    value={nuevoIntegrante.rol}
                                    onChange={(e) => handleInputChange('rol', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                >
                                    <option value="">Selecciona un rol</option>
                                    <option value="admin">Administrador</option>
                                    <option value="jefeBeca">Jefe de Beca</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="becado">Becado</option>
                                </select>
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

            {/* Popup de navegación */}
            {mostrarPopupNavegacion && integranteSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {integranteSeleccionado.nombre} {integranteSeleccionado.apellido}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorRol(integranteSeleccionado.rol)}`}>
                                    {integranteSeleccionado.rol}
                                </span>
                            </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            {getOpcionesNavegacion(integranteSeleccionado.rol).map((opcion, index) => (
                                <button
                                    key={index}
                                    onClick={() => navegarA(opcion.ruta, integranteSeleccionado.id)}
                                    className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#3FD0B6] hover:bg-blue-50/30 transition-all duration-300 text-left"
                                >
                                    <span className="text-xl">{opcion.icono}</span>
                                    <div>
                                        <div className="font-medium text-gray-800">{opcion.nombre}</div>
                                        <div className="text-xs text-gray-500">{opcion.ruta}</div>
                                    </div>
                                </button>
                            ))}
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