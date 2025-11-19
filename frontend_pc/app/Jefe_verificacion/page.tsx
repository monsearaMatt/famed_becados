"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ArchivoBecado {
    id: number;
    nombre: string;
    tipo: "pdf" | "word" | "imagen";
    fechaEnvio: string;
    tamaño: string;
    estado: "pendiente" | "aprobado" | "rechazado";
    becado: {
        id: number;
        nombre: string;
        apellido: string;
        email: string;
        programa: string;
    };
    comentarios?: string;
}

const VerificarArchivos: React.FC = () => {
    const router = useRouter();
    
    const [archivos, setArchivos] = useState<ArchivoBecado[]>([
        {
            id: 1,
            nombre: "Avance Tesis Capítulo 1.docx",
            tipo: "word",
            fechaEnvio: "2024-01-20",
            tamaño: "2.1 MB",
            estado: "pendiente",
            becado: {
                id: 1,
                nombre: "María",
                apellido: "García",
                email: "maria.garcia@email.com",
                programa: "Ingeniería de Software"
            }
        },
        {
            id: 2,
            nombre: "Artículo Científico.pdf",
            tipo: "pdf",
            fechaEnvio: "2024-01-19",
            tamaño: "3.4 MB",
            estado: "pendiente",
            becado: {
                id: 2,
                nombre: "Ana",
                apellido: "Rodríguez",
                email: "ana.rodriguez@email.com",
                programa: "Ciencias de la Computación"
            }
        },
        {
            id: 3,
            nombre: "Diagramas Investigación.png",
            tipo: "imagen",
            fechaEnvio: "2024-01-18",
            tamaño: "1.8 MB",
            estado: "pendiente",
            becado: {
                id: 3,
                nombre: "Luis",
                apellido: "Martínez",
                email: "luis.martinez@email.com",
                programa: "Inteligencia Artificial"
            }
        },
        {
            id: 4,
            nombre: "Informe Semestral.pdf",
            tipo: "pdf",
            fechaEnvio: "2024-01-17",
            tamaño: "4.2 MB",
            estado: "aprobado",
            becado: {
                id: 4,
                nombre: "Carlos",
                apellido: "Hernández",
                email: "carlos.hernandez@email.com",
                programa: "Base de Datos"
            },
            comentarios: "Documento completo y bien estructurado"
        },
        {
            id: 5,
            nombre: "Propuesta Proyecto.docx",
            tipo: "word",
            fechaEnvio: "2024-01-16",
            tamaño: "1.5 MB",
            estado: "rechazado",
            becado: {
                id: 5,
                nombre: "Sofía",
                apellido: "López",
                email: "sofia.lopez@email.com",
                programa: "Redes y Comunicaciones"
            },
            comentarios: "Falta incluir metodología y cronograma"
        },
        {
            id: 6,
            nombre: "Resultados Experimentales.jpg",
            tipo: "imagen",
            fechaEnvio: "2024-01-15",
            tamaño: "2.8 MB",
            estado: "aprobado",
            becado: {
                id: 1,
                nombre: "María",
                apellido: "García",
                email: "maria.garcia@email.com",
                programa: "Ingeniería de Software"
            },
            comentarios: "Gráficos claros y bien presentados"
        }
    ]);

    const [filtroEstado, setFiltroEstado] = useState<string>("todos");
    const [filtroTipo, setFiltroTipo] = useState<string>("todos");
    const [filtroBecado, setFiltroBecado] = useState<string>("");
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<ArchivoBecado | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [comentarios, setComentarios] = useState("");

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const getIconoTipo = (tipo: string) => {
        switch(tipo) {
            case 'pdf':
                return '📄';
            case 'word':
                return '📝';
            case 'imagen':
                return '🖼️';
            default:
                return '📁';
        }
    };

    const getColorEstado = (estado: string) => {
        switch(estado) {
            case 'aprobado':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rechazado':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTextoEstado = (estado: string) => {
        switch(estado) {
            case 'aprobado':
                return 'Aprobado';
            case 'rechazado':
                return 'Rechazado';
            case 'pendiente':
                return 'Pendiente';
            default:
                return estado;
        }
    };

    const getColorTipo = (tipo: string) => {
        switch(tipo) {
            case 'pdf':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'word':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'imagen':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getNombreTipo = (tipo: string) => {
        switch(tipo) {
            case 'pdf':
                return 'PDF';
            case 'word':
                return 'Word';
            case 'imagen':
                return 'Imagen';
            default:
                return 'Archivo';
        }
    };

    // Filtrar archivos
    const archivosFiltrados = archivos.filter(archivo => {
        const coincideEstado = filtroEstado === "todos" || archivo.estado === filtroEstado;
        const coincideTipo = filtroTipo === "todos" || archivo.tipo === filtroTipo;
        const coincideBecado = archivo.becado.nombre.toLowerCase().includes(filtroBecado.toLowerCase()) ||
                             archivo.becado.apellido.toLowerCase().includes(filtroBecado.toLowerCase());
        return coincideEstado && coincideTipo && coincideBecado;
    });

    const abrirModal = (archivo: ArchivoBecado) => {
        setArchivoSeleccionado(archivo);
        setComentarios(archivo.comentarios || "");
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setArchivoSeleccionado(null);
        setComentarios("");
    };

    const cambiarEstado = (nuevoEstado: "aprobado" | "rechazado") => {
        if (archivoSeleccionado) {
            setArchivos(archivos.map(archivo => 
                archivo.id === archivoSeleccionado.id 
                    ? { ...archivo, estado: nuevoEstado, comentarios: comentarios.trim() || undefined }
                    : archivo
            ));
            cerrarModal();
            alert(`Archivo ${nuevoEstado === 'aprobado' ? 'aprobado' : 'rechazado'} exitosamente`);
        }
    };

    const estados = [
        { value: "todos", label: "Todos los estados" },
        { value: "pendiente", label: "Pendientes" },
        { value: "aprobado", label: "Aprobados" },
        { value: "rechazado", label: "Rechazados" }
    ];

    const tipos = [
        { value: "todos", label: "Todos los tipos" },
        { value: "pdf", label: "PDF" },
        { value: "word", label: "Word" },
        { value: "imagen", label: "Imágenes" }
    ];

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <nav className="flex justify-between items-center py-4 px-6 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">👤</span>
                        </div>
                        <div className="text-white">
                            <div className="font-medium">Dr. Carlos López</div>
                            <div className="text-xs opacity-80">Verificador de Archivos</div>
                        </div>
                    </div>
                </div>
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
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verificación de Archivos</h1>
                            <p className="text-gray-600 text-lg">Revisa y evalúa los archivos enviados por los becados</p>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">{archivos.length}</div>
                                <div className="text-sm opacity-90">Total Archivos</div>
                            </div>
                            <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-800">
                                    {archivos.filter(a => a.estado === 'pendiente').length}
                                </div>
                                <div className="text-sm text-yellow-700">Pendientes</div>
                            </div>
                            <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                <div className="text-2xl font-bold text-green-800">
                                    {archivos.filter(a => a.estado === 'aprobado').length}
                                </div>
                                <div className="text-sm text-green-700">Aprobados</div>
                            </div>
                            <div className="bg-red-100 rounded-2xl p-4 text-center border border-red-200">
                                <div className="text-2xl font-bold text-red-800">
                                    {archivos.filter(a => a.estado === 'rechazado').length}
                                </div>
                                <div className="text-sm text-red-700">Rechazados</div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Buscar por becado:
                                    </label>
                                    <input
                                        type="text"
                                        value={filtroBecado}
                                        onChange={(e) => setFiltroBecado(e.target.value)}
                                        placeholder="Ej: María, Ana, Luis..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Filtrar por estado:
                                    </label>
                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        {estados.map((estado) => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Filtrar por tipo:
                                    </label>
                                    <select
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        {tipos.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                Mostrando {archivosFiltrados.length} de {archivos.length} archivos
                            </div>
                        </div>

                        {/* Lista de archivos */}
                        <div className="space-y-4 flex-1">
                            
                            {/* Archivos */}
                            {archivosFiltrados.length > 0 ? (
                                archivosFiltrados.map((archivo) => (
                                    <div 
                                        key={archivo.id} 
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Información del archivo */}
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-2xl flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-2xl">{getIconoTipo(archivo.tipo)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {archivo.nombre}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorTipo(archivo.tipo)}`}>
                                                                {getNombreTipo(archivo.tipo)}
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                {archivo.tamaño}
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                {archivo.fechaEnvio}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Información del becado */}
                                                <div className="flex-1 lg:px-4">
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {archivo.becado.nombre} {archivo.becado.apellido}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm">
                                                        {archivo.becado.email}
                                                    </p>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {archivo.becado.programa}
                                                    </p>
                                                </div>

                                                {/* Estado y acciones */}
                                                <div className="flex flex-col items-end space-y-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(archivo.estado)}`}>
                                                        {getTextoEstado(archivo.estado)}
                                                    </span>
                                                    {archivo.estado === "pendiente" && (
                                                        <button 
                                                            onClick={() => abrirModal(archivo)}
                                                            className="bg-[#3FD0B6] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#2A9D8F] transition-all duration-300 font-medium"
                                                        >
                                                            Revisar
                                                        </button>
                                                    )}
                                                    {archivo.comentarios && (
                                                        <div className="text-xs text-gray-500 max-w-xs text-right">
                                                            {archivo.comentarios}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                    <div className="text-center text-gray-500">
                                        <div className="text-5xl mb-4">📁</div>
                                        <div className="font-medium text-lg mb-2">No se encontraron archivos</div>
                                        <div className="text-sm">Intenta con otros criterios de búsqueda</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de revisión */}
            {mostrarModal && archivoSeleccionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Revisar Archivo
                            </h3>
                            <p className="text-gray-600">
                                Evaluando: <span className="font-semibold">{archivoSeleccionado.nombre}</span>
                            </p>
                        </div>

                        {/* Información del archivo y becado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-medium text-gray-700 mb-2">Información del Archivo</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipo:</span>
                                        <span className="font-medium">{getNombreTipo(archivoSeleccionado.tipo)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tamaño:</span>
                                        <span className="font-medium">{archivoSeleccionado.tamaño}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Enviado:</span>
                                        <span className="font-medium">{archivoSeleccionado.fechaEnvio}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-medium text-gray-700 mb-2">Información del Becado</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-medium">{archivoSeleccionado.becado.nombre} {archivoSeleccionado.becado.apellido}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Programa:</span>
                                        <span className="font-medium">{archivoSeleccionado.becado.programa}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{archivoSeleccionado.becado.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comentarios */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Comentarios (opcional)
                            </label>
                            <textarea
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                placeholder="Agrega comentarios sobre el archivo..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300 resize-none"
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cerrarModal}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => cambiarEstado("rechazado")}
                                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={() => cambiarEstado("aprobado")}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium"
                            >
                                Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificarArchivos;