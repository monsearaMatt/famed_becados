"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NivelPuntuacion {
    nivel: string;
    puntaje: number;
    descripcion: string;
}

interface ItemRubrica {
    id: number;
    criterio: string;
    descripcion: string;
    puntajeMaximo: number;
    niveles: NivelPuntuacion[];
}

interface RespuestaItem {
    itemId: number;
    puntaje: number;
}

export default function Rubrica() {
    const router = useRouter();
    const [itemsRubrica, setItemsRubrica] = useState<ItemRubrica[]>([]);
    const [respuestas, setRespuestas] = useState<RespuestaItem[]>([]);
    const [puntajeTotal, setPuntajeTotal] = useState(0);
    const [puntajeMaximoTotal, setPuntajeMaximoTotal] = useState(0);
    const [porcentaje, setPorcentaje] = useState(0);
    const [mostrarModalArchivo, setMostrarModalArchivo] = useState(false);
    const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
    const [estaArrastrando, setEstaArrastrando] = useState(false);

    // Datos de ejemplo para la rúbrica 
    const rubricaEjemplo: ItemRubrica[] = [
        {
            id: 1,
            criterio: "Conocimiento teórico",
            descripcion: "Dominio de los conceptos y fundamentos teóricos",
            puntajeMaximo: 7,
            niveles: [
                {
                    nivel: "Muy bajo",
                    puntaje: 1,
                    descripcion: "No demuestra comprensión de los conceptos teóricos fundamentales"
                },
                {
                    nivel: "Bajo",
                    puntaje: 2,
                    descripcion: "Demuestra comprensión limitada de algunos conceptos teóricos"
                },
                {
                    nivel: "Medio",
                    puntaje: 3,
                    descripcion: "Comprende los conceptos teóricos básicos pero con algunas lagunas"
                },
                {
                    nivel: "Alto",
                    puntaje: 4,
                    descripcion: "Domina la mayoría de los conceptos teóricos relevantes"
                },
                {
                    nivel: "Muy alto",
                    puntaje: 5,
                    descripcion: "Domina completamente los conceptos teóricos y sus aplicaciones"
                },
                {
                    nivel: "Excelente",
                    puntaje: 6,
                    descripcion: "Domina los conceptos teóricos y puede relacionarlos con otros campos"
                },
                {
                    nivel: "Excepcional",
                    puntaje: 7,
                    descripcion: "Domina los conceptos teóricos y puede generar nuevo conocimiento"
                }
        },
        {
            id: 2,
            criterio: "Habilidades prácticas",
            descripcion: "Aplicación correcta de técnicas y procedimientos",
            puntajeMaximo: 6,
            niveles: [
                {
                    nivel: "Muy bajo",
                    puntaje: 1,
                    descripcion: "No aplica correctamente las técnicas y procedimientos requeridos"
                },
                {
                    nivel: "Bajo",
                    puntaje: 2,
                    descripcion: "Aplica algunas técnicas básicas pero con numerosos errores"
                },
                {
                    nivel: "Medio",
                    puntaje: 3,
                    descripcion: "Aplica técnicas básicas correctamente pero con dificultades en las avanzadas"
                },
                {
                    nivel: "Alto",
                    puntaje: 4,
                    descripcion: "Aplica la mayoría de las técnicas correctamente y con precisión"
                },
                {
                    nivel: "Muy alto",
                    puntaje: 5,
                    descripcion: "Aplica todas las técnicas correctamente y con alta precisión"
                },
                {
                    nivel: "Excepcional",
                    puntaje: 6,
                    descripcion: "Aplica técnicas con maestría y puede adaptarlas a situaciones nuevas"
                }
            ]
        },
        {
            id: 3,
            criterio: "Comunicación efectiva",
            descripcion: "Claridad en la exposición y capacidad de explicación",
            puntajeMaximo: 5,
            niveles: [
                {
                    nivel: "Muy bajo",
                    puntaje: 1,
                    descripcion: "La comunicación es confusa y poco clara"
                },
                {
                    nivel: "Bajo",
                    puntaje: 2,
                    descripcion: "Comunica ideas básicas pero con falta de claridad y estructura"
                },
                {
                    nivel: "Medio",
                    puntaje: 3,
                    descripcion: "Comunica ideas de manera clara pero con algunas imprecisiones"
                },
                {
                    nivel: "Alto",
                    puntaje: 4,
                    descripcion: "Comunica ideas de manera clara, estructurada y precisa"
                },
                {
                    nivel: "Muy alto",
                    puntaje: 5,
                    descripcion: "Comunica con excelente claridad, persuasión y adaptación al público"
                }
            ]
        }
    ];

    useEffect(() => {
        // Inicializar con la rúbrica de ejemplo
        setItemsRubrica(rubricaEjemplo);
        setPuntajeMaximoTotal(rubricaEjemplo.reduce((sum, item) => sum + item.puntajeMaximo, 0));
        
        // Inicializar respuestas vacías
        const respuestasIniciales = rubricaEjemplo.map(item => ({
            itemId: item.id,
            puntaje: 0
        }));
        setRespuestas(respuestasIniciales);
    }, []);

    const handlePuntajeChange = (itemId: number, puntaje: number) => {
        const nuevasRespuestas = respuestas.map(respuesta =>
            respuesta.itemId === itemId ? { ...respuesta, puntaje } : respuesta
        );
        setRespuestas(nuevasRespuestas);

        // Calcular puntaje total
        const total = nuevasRespuestas.reduce((sum, respuesta) => sum + respuesta.puntaje, 0);
        setPuntajeTotal(total);
        
        // Calcular porcentaje
        const porcentajeCalc = (total / puntajeMaximoTotal) * 100;
        setPorcentaje(Math.round(porcentajeCalc));
    };

    const abrirModalArchivo = () => {
        setMostrarModalArchivo(true);
        setArchivoSubido(null);
    };

    const cerrarModalArchivo = () => {
        setMostrarModalArchivo(false);
        setArchivoSubido(null);
        setEstaArrastrando(false);
    };

    const manejarArrastrar = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEstaArrastrando(true);
    };

    const manejarArrastrarSalida = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEstaArrastrando(false);
    };

    const manejarSoltar = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEstaArrastrando(false);
        
        const archivos = e.dataTransfer.files;
        if (archivos.length > 0) {
            procesarArchivo(archivos[0]);
        }
    };

    const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivos = e.target.files;
        if (archivos && archivos.length > 0) {
            procesarArchivo(archivos[0]);
        }
    };

    const procesarArchivo = (archivo: File) => {
        // Validar tipo de archivo
        const tiposPermitidos = ['application/json', 'text/plain'];
        
        if (!tiposPermitidos.includes(archivo.type) && !archivo.name.endsWith('.json')) {
            alert("Por favor sube solo archivos JSON con la definición de la rúbrica");
            return;
        }

        // Validar tamaño (máximo 1MB)
        const tamanoMaximo = 1 * 1024 * 1024;
        if (archivo.size > tamanoMaximo) {
            alert("El archivo es demasiado grande. Máximo 1MB permitido.");
            return;
        }

        setArchivoSubido(archivo);
        
        // Simular lectura del archivo (en implementación real usarías FileReader)
        setTimeout(() => {
            alert(`Rúbrica "${archivo.name}" cargada exitosamente`);
            // Aquí procesarías el contenido del archivo y actualizarías itemsRubrica
            cerrarModalArchivo();
        }, 1000);
    };

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    const enviarEvaluacion = () => {
        if (puntajeTotal === 0) {
            alert("Por favor completa la rúbrica antes de enviar");
            return;
        }

        // Aquí iría la lógica para enviar la evaluación
        console.log("Evaluación enviada:", { respuestas, puntajeTotal, porcentaje });
        alert(`Evaluación enviada exitosamente\nPuntaje: ${puntajeTotal}/${puntajeMaximoTotal} (${porcentaje}%)`);
    };

    const getColorPuntaje = (puntaje: number, maximo: number) => {
        const porcentaje = (puntaje / maximo) * 100;
        if (porcentaje >= 80) return "text-green-600";
        if (porcentaje >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getPuntajeSeleccionado = (itemId: number): number => {
        const respuesta = respuestas.find(r => r.itemId === itemId);
        return respuesta?.puntaje || 0;
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            {/* Navegación */}
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

            {/* Contenedor principal */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 p-6 flex flex-col">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Evaluación de Rúbrica</h1>
                            <p className="text-gray-600 text-sm">Selecciona el puntaje directamente en la tabla de cada criterio</p>
                        </div>

                        {/* Panel de estadísticas */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{puntajeTotal}</div>
                                <div className="text-sm opacity-90">Puntaje Obtenido</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{puntajeMaximoTotal}</div>
                                <div className="text-sm opacity-90">Puntaje Máximo</div>
                            </div>
                            <div className={`bg-gradient-to-r rounded-2xl p-4 text-white text-center backdrop-blur-sm ${
                                porcentaje >= 80 ? "from-green-500 to-green-600" :
                                porcentaje >= 60 ? "from-yellow-500 to-yellow-600" :
                                "from-red-500 to-red-600"
                            }`}>
                                <div className="text-2xl font-bold">{porcentaje}%</div>
                                <div className="text-sm opacity-90">Porcentaje</div>
                            </div>
                        </div>

                        {/* Botón para cargar rúbrica desde archivo */}
                        <div className="flex justify-center mb-6">
                            <button 
                                onClick={abrirModalArchivo}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl px-6 py-3 hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2"
                            >
                                <span>📁</span>
                                <span>Cargar Rúbrica desde Archivo</span>
                            </button>
                        </div>

                        {/* Formulario de rúbrica */}
                        <div className="space-y-6 flex-1 overflow-y-auto max-h-96">
                            {itemsRubrica.map((item) => {
                                const puntajeSeleccionado = getPuntajeSeleccionado(item.id);
                                
                                return (
                                    <div 
                                        key={item.id}
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        {/* Header del criterio */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                    {item.criterio}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {item.descripcion}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-bold ${getColorPuntaje(puntajeSeleccionado, item.puntajeMaximo)}`}>
                                                    {puntajeSeleccionado}/{item.puntajeMaximo}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Puntaje seleccionado
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Tabla de rúbrica con selección integrada */}
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse border border-gray-300">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 w-1/6">
                                                            Nivel
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 w-1/6">
                                                            Puntaje
                                                        </th>
                                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 w-2/3">
                                                            Descripción
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.niveles.map((nivel, index) => (
                                                        <tr 
                                                            key={nivel.puntaje} 
                                                            className={`cursor-pointer transition-all duration-200 ${
                                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                            } ${
                                                                puntajeSeleccionado === nivel.puntaje
                                                                    ? 'bg-[#3FD0B6] bg-opacity-10 border-l-4 border-l-[#3FD0B6]'
                                                                    : 'hover:bg-gray-100'
                                                            }`}
                                                            onClick={() => handlePuntajeChange(item.id, nivel.puntaje)}
                                                        >
                                                            <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800">
                                                                {nivel.nivel}
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-center">
                                                                <div className={`font-semibold text-lg ${
                                                                    puntajeSeleccionado === nivel.puntaje
                                                                        ? 'text-[#3FD0B6]'
                                                                        : 'text-gray-800'
                                                                }`}>
                                                                    {nivel.puntaje}
                                                                </div>
                                                            </td>
                                                            <td className="border border-gray-300 px-4 py-3 text-gray-600">
                                                                {nivel.descripcion}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Indicador de selección actual */}
                                        {puntajeSeleccionado > 0 && (
                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <strong>Selección actual: Nivel {puntajeSeleccionado} - {
                                                        item.niveles.find(n => n.puntaje === puntajeSeleccionado)?.nivel
                                                    }</strong>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {item.niveles.find(n => n.puntaje === puntajeSeleccionado)?.descripcion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón de enviar */}
                        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={enviarEvaluacion}
                                disabled={puntajeTotal === 0}
                                className="px-8 py-3 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <span>📤</span>
                                <span>Enviar Evaluación</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para cargar archivo de rúbrica */}
            {mostrarModalArchivo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Cargar Rúbrica desde Archivo
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-600 text-sm mb-3">
                                Sube un archivo JSON con la definición de la rúbrica (máximo 1MB)
                            </p>
                            
                            {/* Área de arrastrar y soltar */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                                    estaArrastrando 
                                        ? 'border-[#3FD0B6] bg-[#3FD0B6]/10' 
                                        : 'border-gray-300 hover:border-[#3FD0B6] hover:bg-gray-50'
                                }`}
                                onDragOver={manejarArrastrar}
                                onDragEnter={manejarArrastrar}
                                onDragLeave={manejarArrastrarSalida}
                                onDrop={manejarSoltar}
                                onClick={() => document.getElementById('rubrica-file-input')?.click()}
                            >
                                <div className="text-4xl text-gray-400 mb-2">📋</div>
                                <p className="text-gray-600 mb-1">
                                    {archivoSubido ? archivoSubido.name : "Arrastra y suelta tu archivo JSON aquí"}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    o haz clic para seleccionar
                                </p>
                                <input
                                    id="rubrica-file-input"
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={manejarSeleccionArchivo}
                                    className="hidden"
                                />
                            </div>

                            {/* Información del archivo seleccionado */}
                            {archivoSubido && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-800 font-medium text-sm">
                                                {archivoSubido.name}
                                            </p>
                                            <p className="text-green-600 text-xs">
                                                {(archivoSubido.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setArchivoSubido(null)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cerrarModalArchivo}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => archivoSubido && procesarArchivo(archivoSubido)}
                                disabled={!archivoSubido}
                                className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cargar Rúbrica
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}