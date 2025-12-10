"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Archivo {
    id: number;
    nombre: string;
    tipo: "pdf" | "word" | "imagen" | "rubrica";
    fechaSubida: string;
    tamaño: string;
}

interface GestionArchivosProps {
    archivosIniciales?: Archivo[];
}

export default function GestionArchivos({ archivosIniciales }: GestionArchivosProps) {
    const router = useRouter();
    
    const [archivos, setArchivos] = useState<Archivo[]>(
        archivosIniciales || [
            {
                id: 1,
                nombre: "Informe Final.pdf",
                tipo: "pdf",
                fechaSubida: "2024-01-15",
                tamaño: "2.4 MB"
            },
            {
                id: 2,
                nombre: "Propuesta Tesis.docx",
                tipo: "word",
                fechaSubida: "2024-01-14",
                tamaño: "1.8 MB"
            },
            {
                id: 3,
                nombre: "Diagrama Sistema.png",
                tipo: "imagen",
                fechaSubida: "2024-01-13",
                tamaño: "3.2 MB"
            },
            {
                id: 4,
                nombre: "Rúbrica Evaluación.pdf",
                tipo: "rubrica",
                fechaSubida: "2024-01-12",
                tamaño: "1.1 MB"
            },
            {
                id: 5,
                nombre: "Fotografía Proyecto.jpg",
                tipo: "imagen",
                fechaSubida: "2024-01-11",
                tamaño: "4.5 MB"
            },
            {
                id: 6,
                nombre: "Contrato Becario.docx",
                tipo: "word",
                fechaSubida: "2024-01-10",
                tamaño: "2.1 MB"
            },
            {
                id: 7,
                nombre: "Manual Usuario.pdf",
                tipo: "pdf",
                fechaSubida: "2024-01-09",
                tamaño: "5.2 MB"
            }
        ]
    );

    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");

    // Función para navegar al perfil del becado
    const navegarAlPerfil = () => {
        router.push("/Perfil/1"); // Asumiendo que el ID del becado es 1
    };

    const getIconoTipo = (tipo: string) => {
        switch(tipo) {
            case 'pdf':
                return '📄';
            case 'word':
                return '📝';
            case 'imagen':
                return '🖼️';
            case 'rubrica':
                return '📊';
            default:
                return '📁';
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
            case 'rubrica':
                return 'bg-purple-100 text-purple-800 border-purple-200';
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
            case 'rubrica':
                return 'Rúbrica';
            default:
                return 'Archivo';
        }
    };

    // Filtrar archivos según los criterios
    const archivosFiltrados = archivos.filter(archivo => {
        const coincideNombre = archivo.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
        const coincideTipo = filtroTipo === "todos" || archivo.tipo === filtroTipo;
        return coincideNombre && coincideTipo;
    });

    const tiposArchivos = [
        { value: "todos", label: "Todos los tipos" },
        { value: "pdf", label: "PDF" },
        { value: "word", label: "Word" },
        { value: "imagen", label: "Imágenes" },
        { value: "rubrica", label: "Rúbricas" }
    ];

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <Navbar title="Mis Archivos" subtitle="Gestión" />

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Mis Archivos</h1>
                            <p className="text-gray-600 text-sm">Gestiona tus documentos, imágenes y rúbricas</p>
                        </div>

                        {/* Información de estadísticas con foto del becado en el medio */}
                        <div className="flex justify-between items-center mb-6">
                            {/* Total de Archivos */}
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{archivos.length}</div>
                                <div className="text-sm opacity-90">Total de Archivos</div>
                            </div>
                            
                            {/* Foto del Becado - Clickable */}
                            <div className="flex flex-col items-center">
                                <button 
                                    onClick={navegarAlPerfil}
                                    className="group flex flex-col items-center transition-all duration-300 hover:scale-105"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-full flex items-center justify-center border-4 border-white shadow-lg group-hover:shadow-xl group-hover:border-[#3FD0B6] transition-all duration-300">
                                        <span className="text-white text-2xl">👤</span>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="font-semibold text-gray-800 group-hover:text-[#3FD0B6] transition-colors duration-300">
                                            Juan Pérez
                                        </div>
                                        <div className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                            Becado
                                        </div>
                                        <div className="text-xs text-[#3FD0B6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                                            Ver perfil →
                                        </div>
                                    </div>
                                </button>
                            </div>
                            
                            {/* Resumen por Tipo */}
                            <div className="text-right">
                                <div className="text-sm text-gray-600 mb-2 font-medium">Resumen por tipo</div>
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-end space-x-2">
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            PDF: {archivos.filter(a => a.tipo === 'pdf').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            Word: {archivos.filter(a => a.tipo === 'word').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            Imágenes: {archivos.filter(a => a.tipo === 'imagen').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                            Rúbricas: {archivos.filter(a => a.tipo === 'rubrica').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Buscar por nombre:
                                    </label>
                                    <input
                                        type="text"
                                        value={filtroNombre}
                                        onChange={(e) => setFiltroNombre(e.target.value)}
                                        placeholder="Ej: Informe Final..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Filtrar por tipo:
                                    </label>
                                    <select
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                    >
                                        {tiposArchivos.map((tipo) => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                        </div>

                        {/* Tabla de archivos */}
                        <div className="space-y-3 flex-1">
                            {/* Encabezado de la tabla */}
                            <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                <div className="w-8"></div>
                                <div className="flex-1">Nombre del Archivo</div>
                                <div className="w-32">Tipo</div>
                                <div className="w-32">Fecha</div>
                                <div className="w-24">Tamaño</div>
                            </div>
                            
                            {/* Archivos */}
                            {archivosFiltrados.length > 0 ? (
                                archivosFiltrados.map((archivo) => (
                                    <div 
                                        key={archivo.id} 
                                        className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-8 flex items-center justify-center">
                                            <span className="text-xl">{getIconoTipo(archivo.tipo)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{archivo.nombre}</div>
                                        </div>
                                        <div className="w-32">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorTipo(archivo.tipo)}`}>
                                                {getNombreTipo(archivo.tipo)}
                                            </span>
                                        </div>
                                        <div className="w-32">
                                            <span className="text-gray-600 text-sm">
                                                {archivo.fechaSubida}
                                            </span>
                                        </div>
                                        <div className="w-24">
                                            <span className="text-gray-600 text-sm">
                                                {archivo.tamaño}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-8 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200">
                                    <div className="text-center text-gray-500">
                                        <div className="text-4xl mb-2">📁</div>
                                        <div className="font-medium">No se encontraron archivos</div>
                                        <div className="text-sm">Intenta con otros criterios de búsqueda</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}