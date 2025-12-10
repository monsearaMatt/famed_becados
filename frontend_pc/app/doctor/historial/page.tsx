"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Becado {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    programa: string;
}

interface Rubrica {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: string;
}

interface Evaluacion {
    id: number;
    becado: Becado;
    rubrica: Rubrica;
    fechaEvaluacion: string;
    calificacion: number;
    estado: "completada" | "en-progreso" | "pendiente";
    comentarios: string;
}

const HistorialEvaluaciones: React.FC = () => {
    const router = useRouter();
    
    const [evaluaciones] = useState<Evaluacion[]>([
        {
            id: 1,
            becado: {
                id: 1,
                nombre: "María",
                apellido: "García",
                email: "maria.garcia@email.com",
                programa: "Ingeniería de Software"
            },
            rubrica: {
                id: 1,
                nombre: "Rúbrica de Evaluación Semestral",
                descripcion: "Evaluación integral del desempeño académico y de investigación",
                tipo: "Semestral"
            },
            fechaEvaluacion: "2024-01-20",
            calificacion: 4.5,
            estado: "completada",
            comentarios: "Excelente desempeño en todas las áreas evaluadas."
        },
        {
            id: 2,
            becado: {
                id: 2,
                nombre: "Ana",
                apellido: "Rodríguez",
                email: "ana.rodriguez@email.com",
                programa: "Ciencias de la Computación"
            },
            rubrica: {
                id: 2,
                nombre: "Rúbrica de Avance de Tesis",
                descripcion: "Evaluación del progreso en el desarrollo de tesis doctoral",
                tipo: "Trimestral"
            },
            fechaEvaluacion: "2024-01-18",
            calificacion: 3.8,
            estado: "completada",
            comentarios: "Buen progreso, se recomienda enfocarse en la metodología."
        },
        {
            id: 3,
            becado: {
                id: 3,
                nombre: "Luis",
                apellido: "Martínez",
                email: "luis.martinez@email.com",
                programa: "Inteligencia Artificial"
            },
            rubrica: {
                id: 3,
                nombre: "Rúbrica de Habilidades Investigación",
                descripcion: "Evaluación de competencias en metodología de investigación",
                tipo: "Anual"
            },
            fechaEvaluacion: "2024-01-15",
            calificacion: 4.2,
            estado: "completada",
            comentarios: "Destacadas habilidades en análisis de datos."
        },
        {
            id: 4,
            becado: {
                id: 4,
                nombre: "Carlos",
                apellido: "Hernández",
                email: "carlos.hernandez@email.com",
                programa: "Base de Datos"
            },
            rubrica: {
                id: 1,
                nombre: "Rúbrica de Evaluación Semestral",
                descripcion: "Evaluación integral del desempeño académico y de investigación",
                tipo: "Semestral"
            },
            fechaEvaluacion: "2024-01-12",
            calificacion: 3.5,
            estado: "completada",
            comentarios: "Progreso satisfactorio, áreas de mejora identificadas."
        },
        {
            id: 5,
            becado: {
                id: 5,
                nombre: "Sofía",
                apellido: "López",
                email: "sofia.lopez@email.com",
                programa: "Redes y Comunicaciones"
            },
            rubrica: {
                id: 4,
                nombre: "Rúbrica de Publicaciones",
                descripcion: "Evaluación de producción científica y publicaciones",
                tipo: "Semestral"
            },
            fechaEvaluacion: "2024-01-10",
            calificacion: 4.8,
            estado: "completada",
            comentarios: "Excelente producción científica, múltiples publicaciones en revistas indexadas."
        }
    ]);

    const [filtroEstado, setFiltroEstado] = useState<string>("todos");
    const [filtroBecado, setFiltroBecado] = useState<string>("");

    const getColorEstado = (estado: string) => {
        switch(estado) {
            case 'completada':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'en-progreso':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pendiente':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTextoEstado = (estado: string) => {
        switch(estado) {
            case 'completada':
                return 'Completada';
            case 'en-progreso':
                return 'En Progreso';
            case 'pendiente':
                return 'Pendiente';
            default:
                return estado;
        }
    };

    const getColorCalificacion = (calificacion: number) => {
        if (calificacion >= 4.5) return 'text-green-600';
        if (calificacion >= 3.5) return 'text-blue-600';
        if (calificacion >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Filtrar evaluaciones
    const evaluacionesFiltradas = evaluaciones.filter(evaluacion => {
        const coincideEstado = filtroEstado === "todos" || evaluacion.estado === filtroEstado;
        const coincideBecado = evaluacion.becado.nombre.toLowerCase().includes(filtroBecado.toLowerCase()) ||
                             evaluacion.becado.apellido.toLowerCase().includes(filtroBecado.toLowerCase());
        return coincideEstado && coincideBecado;
    });

    const estados = [
        { value: "todos", label: "Todos los estados" },
        { value: "completada", label: "Completadas" },
        { value: "en-progreso", label: "En Progreso" },
        { value: "pendiente", label: "Pendientes" }
    ];

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <Navbar title="Dr. Carlos López" subtitle="Evaluador" />

            {/* Contenedor  */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Historial de Evaluaciones</h1>
                            <p className="text-gray-600 text-lg">Consulta el historial de rúbricas evaluadas</p>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">{evaluaciones.length}</div>
                                <div className="text-sm opacity-90">Total Evaluaciones</div>
                            </div>
                            <div className="bg-green-100 rounded-2xl p-4 text-center border border-green-200">
                                <div className="text-2xl font-bold text-green-800">
                                    {evaluaciones.filter(e => e.estado === 'completada').length}
                                </div>
                                <div className="text-sm text-green-700">Completadas</div>
                            </div>
                            <div className="bg-yellow-100 rounded-2xl p-4 text-center border border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-800">
                                    {evaluaciones.filter(e => e.estado === 'en-progreso').length}
                                </div>
                                <div className="text-sm text-yellow-700">En Progreso</div>
                            </div>
                            
                        </div>

                        {/* Filtros */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                Mostrando {evaluacionesFiltradas.length} de {evaluaciones.length} evaluaciones
                            </div>
                        </div>

                        {/* Lista de evaluaciones */}
                        <div className="space-y-4 flex-1">
                            
                            {/* Evaluaciones */}
                            {evaluacionesFiltradas.length > 0 ? (
                                evaluacionesFiltradas.map((evaluacion) => (
                                    <div 
                                        key={evaluacion.id} 
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                {/* Información del becado */}
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-lg">👤</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 text-lg">
                                                            {evaluacion.becado.nombre} {evaluacion.becado.apellido}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">{evaluacion.becado.email}</p>
                                                        <p className="text-gray-500 text-xs mt-1">{evaluacion.becado.programa}</p>
                                                    </div>
                                                </div>

                                                {/* Información de la rúbrica */}
                                                <div className="flex-1 lg:px-4">
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {evaluacion.rubrica.nombre}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {evaluacion.rubrica.descripcion}
                                                    </p>
                                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                        {evaluacion.rubrica.tipo}
                                                    </span>
                                                </div>

                                                {/* Detalles de la evaluación */}
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(evaluacion.estado)}`}>
                                                        {getTextoEstado(evaluacion.estado)}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className={`text-xl font-bold ${getColorCalificacion(evaluacion.calificacion)}`}>
                                                            {evaluacion.calificacion}/5.0
                                                        </div>
                                                        <div className="text-gray-500 text-sm">
                                                            {evaluacion.fechaEvaluacion}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comentarios adicionales */}
                                            {evaluacion.comentarios && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <p className="text-gray-600 text-sm">
                                                        <span className="font-medium text-gray-700">Comentarios: </span>
                                                        {evaluacion.comentarios}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                                    <div className="text-center text-gray-500">
                                        <div className="text-5xl mb-4">📊</div>
                                        <div className="font-medium text-lg mb-2">No se encontraron evaluaciones</div>
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
};

export default HistorialEvaluaciones;