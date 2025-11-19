"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Criterio {
    id: number;
    nombre: string;
    descripcion: string;
    niveles: Nivel[];
}

interface Nivel {
    id: number;
    nombre: string;
    descripcion: string;
    puntaje: number;
}

const CrearRubrica: React.FC = () => {
    const router = useRouter();
    
    const [rubrica, setRubrica] = useState({
        nombre: "",
        descripcion: "",
        fechaCreacion: new Date().toISOString().split('T')[0]
    });

    const [criterios, setCriterios] = useState<Criterio[]>([
        {
            id: 1,
            nombre: "",
            descripcion: "",
            niveles: [
                { id: 1, nombre: "Excelente", descripcion: "", puntaje: 5 },
                { id: 2, nombre: "Bueno", descripcion: "", puntaje: 4 },
                { id: 3, nombre: "Regular", descripcion: "", puntaje: 3 },
                { id: 4, nombre: "Deficiente", descripcion: "", puntaje: 2 },
                { id: 5, nombre: "No Aplica", descripcion: "", puntaje: 0 }
            ]
        }
    ]);

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const handleInputChange = (field: string, value: string) => {
        setRubrica(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const agregarCriterio = () => {
        const nuevoCriterio: Criterio = {
            id: Date.now(),
            nombre: "",
            descripcion: "",
            niveles: [
                { id: 1, nombre: "Excelente", descripcion: "", puntaje: 5 },
                { id: 2, nombre: "Bueno", descripcion: "", puntaje: 4 },
                { id: 3, nombre: "Regular", descripcion: "", puntaje: 3 },
                { id: 4, nombre: "Deficiente", descripcion: "", puntaje: 2 },
                { id: 5, nombre: "No Aplica", descripcion: "", puntaje: 0 }
            ]
        };
        setCriterios([...criterios, nuevoCriterio]);
    };

    const eliminarCriterio = (id: number) => {
        if (criterios.length > 1) {
            setCriterios(criterios.filter(c => c.id !== id));
        } else {
            alert("La rúbrica debe tener al menos un criterio");
        }
    };

    const actualizarCriterio = (id: number, field: string, value: string) => {
        setCriterios(criterios.map(criterio => 
            criterio.id === id ? { ...criterio, [field]: value } : criterio
        ));
    };

    const actualizarNivel = (criterioId: number, nivelId: number, field: string, value: string) => {
        setCriterios(criterios.map(criterio => 
            criterio.id === criterioId 
                ? {
                    ...criterio,
                    niveles: criterio.niveles.map(nivel =>
                        nivel.id === nivelId ? { ...nivel, [field]: value } : nivel
                    )
                }
                : criterio
        ));
    };

    const agregarNivel = (criterioId: number) => {
        setCriterios(criterios.map(criterio => 
            criterio.id === criterioId 
                ? {
                    ...criterio,
                    niveles: [
                        ...criterio.niveles,
                        { 
                            id: Date.now(), 
                            nombre: "Nuevo Nivel", 
                            descripcion: "", 
                            puntaje: criterio.niveles.length 
                        }
                    ]
                }
                : criterio
        ));
    };

    const eliminarNivel = (criterioId: number, nivelId: number) => {
        setCriterios(criterios.map(criterio => 
            criterio.id === criterioId 
                ? {
                    ...criterio,
                    niveles: criterio.niveles.filter(nivel => nivel.id !== nivelId)
                }
                : criterio
        ));
    };

    const validarRubrica = () => {
        if (!rubrica.nombre.trim()) {
            alert("El nombre de la rúbrica es requerido");
            return false;
        }

        if (!rubrica.descripcion.trim()) {
            alert("La descripción de la rúbrica es requerida");
            return false;
        }

        for (const criterio of criterios) {
            if (!criterio.nombre.trim()) {
                alert("Todos los criterios deben tener un nombre");
                return false;
            }

            if (criterio.niveles.length < 2) {
                alert("Cada criterio debe tener al menos 2 niveles de evaluación");
                return false;
            }

            for (const nivel of criterio.niveles) {
                if (!nivel.nombre.trim()) {
                    alert("Todos los niveles deben tener un nombre");
                    return false;
                }
            }
        }

        return true;
    };

    const handleCrearRubrica = () => {
        if (validarRubrica()) {
            setMostrarConfirmacion(true);
        }
    };

    const confirmarCreacion = () => {
        // Aquí iría la lógica para guardar la rúbrica en la base de datos
        alert("Rúbrica creada exitosamente");
        router.push("/Doctor_dashboard");
    };

    const cancelarCreacion = () => {
        setMostrarConfirmacion(false);
    };

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
                            <div className="text-xs opacity-80">Creador de Rúbricas</div>
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
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-8 flex flex-col">
                        {/* Header  */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Nueva Rúbrica</h1>
                            <p className="text-gray-600 text-lg">Diseña una rúbrica de evaluación personalizada</p>
                        </div>

                        {/* Información de la Rúbrica */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="mr-3">📝</span>
                                Información General
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Nombre de la Rúbrica *
                                    </label>
                                    <input
                                        type="text"
                                        value={rubrica.nombre}
                                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                                        placeholder="Ej: Rúbrica de Evaluación Semestral"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Descripción *
                                    </label>
                                    <textarea
                                        value={rubrica.descripcion}
                                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                        placeholder="Describe el propósito y alcance de esta rúbrica..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Criterios de Evaluación */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <span className="mr-3">📊</span>
                                    Criterios de Evaluación
                                </h2>
                                <div className="text-sm text-gray-600">
                                    Total: {criterios.length} criterio{criterios.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {criterios.map((criterio, index) => (
                                <div key={criterio.id} className="bg-white rounded-2xl p-6 border border-gray-200 mb-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Criterio {index + 1}
                                        </h3>
                                        <button
                                            onClick={() => eliminarCriterio(criterio.id)}
                                            className="bg-red-100 text-red-600 rounded-lg px-3 py-1 text-sm hover:bg-red-200 transition-all duration-300 font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 mb-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                Nombre del Criterio *
                                            </label>
                                            <input
                                                type="text"
                                                value={criterio.nombre}
                                                onChange={(e) => actualizarCriterio(criterio.id, 'nombre', e.target.value)}
                                                placeholder="Ej: Calidad de Investigación"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={criterio.descripcion}
                                                onChange={(e) => actualizarCriterio(criterio.id, 'descripcion', e.target.value)}
                                                placeholder="Describe este criterio de evaluación..."
                                                rows={2}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Niveles de Evaluación */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-semibold text-gray-800">Niveles de Evaluación</h4>
                                            <button
                                                onClick={() => agregarNivel(criterio.id)}
                                                className="bg-green-100 text-green-600 rounded-lg px-3 py-1 text-sm hover:bg-green-200 transition-all duration-300 font-medium"
                                            >
                                                + Agregar Nivel
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {criterio.niveles.map((nivel, nivelIndex) => (
                                                <div key={nivel.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                                Nombre del Nivel *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={nivel.nombre}
                                                                onChange={(e) => actualizarNivel(criterio.id, nivel.id, 'nombre', e.target.value)}
                                                                placeholder="Ej: Excelente"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                                                Puntaje
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={nivel.puntaje}
                                                                onChange={(e) => actualizarNivel(criterio.id, nivel.id, 'puntaje', e.target.value)}
                                                                min="0"
                                                                max="10"
                                                                step="0.5"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black transition-all duration-300"
                                                            />
                                                        </div>
                                                        <div className="flex items-end space-x-2">
                                                            <div className="flex-1">
                                                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                                                    Descripción
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={nivel.descripcion}
                                                                    onChange={(e) => actualizarNivel(criterio.id, nivel.id, 'descripcion', e.target.value)}
                                                                    placeholder="Descripción del nivel..."
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                                                />
                                                            </div>
                                                            {criterio.niveles.length > 2 && (
                                                                <button
                                                                    onClick={() => eliminarNivel(criterio.id, nivel.id)}
                                                                    className="bg-red-100 text-red-600 rounded-lg px-2 py-2 text-sm hover:bg-red-200 transition-all duration-300 font-medium mb-2"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={agregarCriterio}
                                className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-[#3FD0B6] hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center"
                            >
                                <div className="text-2xl text-gray-400 mb-2">+</div>
                                <div className="text-gray-500 font-medium">Agregar Nuevo Criterio</div>
                            </button>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => router.push("/Doctor_dashboard")}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCrearRubrica}
                                className="px-8 py-4 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg"
                            >
                                Crear Rúbrica
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
                                Confirmar Creación
                            </h3>
                            <p className="text-gray-600">
                                ¿Estás seguro de que deseas crear la rúbrica "{rubrica.nombre}"?
                            </p>
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelarCreacion}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarCreacion}
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

export default CrearRubrica;