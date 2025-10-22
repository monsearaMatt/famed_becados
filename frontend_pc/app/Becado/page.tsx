"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Fila {
    id: number;
    nombre: string;
}

interface BecadoProps {
    filasIniciales?: Fila[];
}

export default function Becado({ filasIniciales }: BecadoProps) {
    const router = useRouter();
    const [filas, setFilas] = useState<Fila[]>(
        filasIniciales || [
            { id: 1, nombre: "Intubación" },
            { id: 2, nombre: "Medicación" },
            { id: 3, nombre: "Cateter" }
        ]
    );
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalArchivos, setMostrarModalArchivos] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [archivoSubido, setArchivoSubido] = useState<File | null>(null);
    const [estaArrastrando, setEstaArrastrando] = useState(false);

    const abrirModal = () => {
        setMostrarModal(true);
        setNuevoNombre("");
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setNuevoNombre("");
    };

    const abrirModalArchivos = () => {
        setMostrarModalArchivos(true);
        setArchivoSubido(null);
    };

    const cerrarModalArchivos = () => {
        setMostrarModalArchivos(false);
        setArchivoSubido(null);
        setEstaArrastrando(false);
    };

    const agregarFila = () => {
        if (nuevoNombre.trim() === "") {
            alert("Por favor ingresa un nombre para el procedimiento");
            return;
        }

        const nuevaFila = {
            id: Date.now(),
            nombre: nuevoNombre.trim()
        };
        
        setFilas([...filas, nuevaFila]);
        cerrarModal();
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
        
        const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!tiposPermitidos.includes(archivo.type)) {
            alert("Por favor sube solo archivos PDF o Word (.doc, .docx)");
            return;
        }

    
        const tamanoMaximo = 10 * 1024 * 1024; 
        if (archivo.size > tamanoMaximo) {
            alert("El archivo es demasiado grande. Máximo 10MB permitido.");
            return;
        }

        setArchivoSubido(archivo);
    };

    const subirArchivo = () => {
        if (!archivoSubido) {
            alert("Por favor selecciona un archivo primero");
            return;
        }

        
        console.log("Subiendo archivo:", archivoSubido);
        
      
        alert(`Archivo "${archivoSubido.name}" subido exitosamente`);
        cerrarModalArchivos();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            agregarFila();
        }
    };

    const handleProfileClick = () => {
        router.push("/Logout");
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            
            
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

           
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-6xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    
                    
                    <div className="flex-1 p-6 flex flex-col">
                       
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Procedimientos Médicos</h1>
                            <p className="text-gray-600 text-sm">Gestiona y realiza seguimiento de los procedimientos</p>
                        </div>

                       
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{filas.length}</div>
                                <div className="text-sm opacity-90">Procedimientos Totales</div>
                            </div>
                        </div>

                        
                        <div className="space-y-3 flex-1">
                            {filas.map((fila) => (
                                <div 
                                    key={fila.id}
                                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-[#3FD0B6]/10 rounded-lg flex items-center justify-center">
                                                <span className="text-[#3FD0B6] text-sm">⚕️</span>
                                            </div>
                                            <span className="text-base font-semibold text-gray-800">
                                                {fila.nombre}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-[#3FD0B6] bg-gray-100 border-gray-300 rounded focus:ring-[#3FD0B6] focus:ring-2"
                                            />
                                            <button 
                                                onClick={abrirModalArchivos}
                                                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-gray-700 hover:bg-gray-50 transition-all duration-300 text-xs font-medium"
                                            >
                                                Subir archivos
                                            </button>
                                            <button className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-gray-700 hover:bg-gray-50 transition-all duration-300 text-xs font-medium">
                                                Comentarios
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Botón Agregar  */}
                            <button 
                                onClick={abrirModal}
                                className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#3FD0B6] hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center"
                            >
                                <div className="text-2xl text-gray-400 mb-1">+</div>
                                <div className="text-gray-500 font-medium text-sm">Agregar Nuevo Procedimiento</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para agregar procedimiento */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Agregar Nuevo Procedimiento
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Nombre del procedimiento:
                            </label>
                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ej: Radiografía, Análisis de sangre..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-black placeholder-gray-500 transition-all duration-300"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cerrarModal}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={agregarFila}
                                className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para subir archivos */}
            {mostrarModalArchivos && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Subir Archivo
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-600 text-sm mb-3">
                                Sube un archivo 
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
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <div className="text-4xl text-gray-400 mb-2"></div>
                                <p className="text-gray-600 mb-1">
                                    {archivoSubido ? archivoSubido.name : "Arrastra y suelta tu archivo aquí"}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    o haz clic para seleccionar
                                </p>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                                                {(archivoSubido.size / 1024 / 1024).toFixed(2)} MB
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
                                onClick={cerrarModalArchivos}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={subirArchivo}
                                disabled={!archivoSubido}
                                className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Subir Archivo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}