"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
    fechaCreacion: string;
}

const EvaluacionBecados: React.FC = () => {
    const router = useRouter();
    
    const [becados] = useState<Becado[]>([
        { 
            id: 1, 
            nombre: "María",
            apellido: "García",
            email: "maria.garcia@email.com",
            programa: "Ingeniería de Software"
        },
        { 
            id: 2, 
            nombre: "Ana", 
            apellido: "Rodríguez",
            email: "ana.rodriguez@email.com",
            programa: "Ciencias de la Computación"
        },
        { 
            id: 3, 
            nombre: "Luis",
            apellido: "Martínez",
            email: "luis.martinez@email.com",
            programa: "Inteligencia Artificial"
        },
        { 
            id: 4, 
            nombre: "Carlos",
            apellido: "Hernández",
            email: "carlos.hernandez@email.com",
            programa: "Base de Datos"
        },
        { 
            id: 5, 
            nombre: "Sofía",
            apellido: "López",
            email: "sofia.lopez@email.com",
            programa: "Redes y Comunicaciones"
        }
    ]);

    const [rubricas] = useState<Rubrica[]>([
        {
            id: 1,
            nombre: "Rúbrica de Evaluación Semestral",
            descripcion: "Evaluación integral del desempeño académico y de investigación",
            tipo: "Semestral",
            fechaCreacion: "2024-01-15"
        },
        {
            id: 2,
            nombre: "Rúbrica de Avance de Tesis",
            descripcion: "Evaluación del progreso en el desarrollo de tesis doctoral",
            tipo: "Trimestral",
            fechaCreacion: "2024-01-10"
        },
        {
            id: 3,
            nombre: "Rúbrica de Habilidades Investigación",
            descripcion: "Evaluación de competencias en metodología de investigación",
            tipo: "Anual",
            fechaCreacion: "2024-01-05"
        },
        {
            id: 4,
            nombre: "Rúbrica de Publicaciones",
            descripcion: "Evaluación de producción científica y publicaciones",
            tipo: "Semestral",
            fechaCreacion: "2023-12-20"
        }
    ]);

    const [becadoSeleccionado, setBecadoSeleccionado] = useState<number | null>(null);
    const [rubricaSeleccionada, setRubricaSeleccionada] = useState<number | null>(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const handleEvaluar = () => {
        if (!becadoSeleccionado || !rubricaSeleccionada) {
            alert("Por favor selecciona un becado y una rúbrica para continuar");
            return;
        }
        setMostrarConfirmacion(true);
    };

    const confirmarEvaluacion = () => {
        router.push("/Doctor_rubricas");
    };

    const cancelarEvaluacion = () => {
        setMostrarConfirmacion(false);
    };

    const getBecadoSeleccionado = () => {
        return becados.find(b => b.id === becadoSeleccionado);
    };

    const getRubricaSeleccionada = () => {
        return rubricas.find(r => r.id === rubricaSeleccionada);
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación  */}
            <nav className="flex justify-between items-center py-4 px-6 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                       
                        
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
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Evaluación de Becados</h1>
                            <p className="text-gray-600 text-lg">Selecciona un becado y una rúbrica para comenzar la evaluación</p>
                        </div>

                        {/* Contenido de selección */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            
                            {/* Selección de Becado */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="mr-3">🎓</span>
                                    Seleccionar Becado
                                </h2>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {becados.map((becado) => (
                                        <div
                                            key={becado.id}
                                            onClick={() => setBecadoSeleccionado(becado.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                                becadoSeleccionado === becado.id
                                                    ? 'border-[#3FD0B6] bg-[#3FD0B6]/10 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm">👤</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {becado.nombre} {becado.apellido}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">{becado.email}</p>
                                                    <p className="text-gray-500 text-xs mt-1">{becado.programa}</p>
                                                </div>
                                                {becadoSeleccionado === becado.id && (
                                                    <div className="text-[#3FD0B6]">
                                                        <span className="text-lg">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selección de Rúbrica */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="mr-3">📊</span>
                                    Seleccionar Rúbrica
                                </h2>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {rubricas.map((rubrica) => (
                                        <div
                                            key={rubrica.id}
                                            onClick={() => setRubricaSeleccionada(rubrica.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                                rubricaSeleccionada === rubrica.id
                                                    ? 'border-[#3FD0B6] bg-[#3FD0B6]/10 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-sm">📋</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-800">
                                                        {rubrica.nombre}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {rubrica.descripcion}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                            {rubrica.tipo}
                                                        </span>
                                                        <span className="text-gray-500 text-xs">
                                                            Creada: {rubrica.fechaCreacion}
                                                        </span>
                                                    </div>
                                                </div>
                                                {rubricaSeleccionada === rubrica.id && (
                                                    <div className="text-[#3FD0B6]">
                                                        <span className="text-lg">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Resumen de selección */}
                        {(becadoSeleccionado || rubricaSeleccionada) && (
                            <div className="bg-gradient-to-r from-[#3FD0B6]/10 to-purple-100 rounded-2xl p-6 border border-[#3FD0B6]/20 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Selección</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {becadoSeleccionado && (
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <h4 className="font-medium text-gray-700 mb-2">Becado Seleccionado:</h4>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-[#3FD0B6] rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm">👤</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {getBecadoSeleccionado()?.nombre} {getBecadoSeleccionado()?.apellido}
                                                    </p>
                                                    <p className="text-gray-600 text-sm">{getBecadoSeleccionado()?.programa}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {rubricaSeleccionada && (
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <h4 className="font-medium text-gray-700 mb-2">Rúbrica Seleccionada:</h4>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm">📋</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {getRubricaSeleccionada()?.nombre}
                                                    </p>
                                                    <p className="text-gray-600 text-sm">{getRubricaSeleccionada()?.tipo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botón de evaluación */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleEvaluar}
                                disabled={!becadoSeleccionado || !rubricaSeleccionada}
                                className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl px-8 py-4 hover:shadow-lg transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                Iniciar Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación */}
            {mostrarConfirmacion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-green-600 text-2xl">✓</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Confirmar Evaluación
                            </h3>
                            <p className="text-gray-600">
                                ¿Estás seguro de que deseas evaluar a{' '}
                                <span className="font-semibold text-[#3FD0B6]">
                                    {getBecadoSeleccionado()?.nombre} {getBecadoSeleccionado()?.apellido}
                                </span>{' '}
                                con la rúbrica{' '}
                                <span className="font-semibold text-purple-600">
                                    "{getRubricaSeleccionada()?.nombre}"
                                </span>?
                            </p>
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelarEvaluacion}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEvaluacion}
                                className="px-6 py-3 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluacionBecados;