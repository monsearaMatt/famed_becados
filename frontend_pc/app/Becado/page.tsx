import React from "react";

export default function Becado() {
    return (
        <div className="bg-[#EEEEEE] min-h-screen flex flex-col items-center">
            
            <nav className="flex justify-end items-center w-full py-12 bg-[#3FD0B6] border-b-8 border-gray-300 rounded-t-3xl">
                <button
                    className="bg-none border-none mr-12 cursor-pointer text-6xl w-20 h-20"
                >
                    <span role="img" aria-label="notifications">
                        🔔
                    </span>
                </button>
                <button
                    className="bg-none border-none cursor-pointer text-6xl w-20 h-20"
                >
                    <span role="img" aria-label="profile">
                        👤
                    </span>
                </button>
            </nav>
            <div
                className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-16 w-[calc(100%-4rem)] min-h-screen m-8 relative border-2 border-[#4b867b]"
            >
                {/* Título de la sección y estado de completado */}
                <div className="flex justify-between items-center mb-12 border-4 border-[#3fd0b6] rounded-lg p-4">
                 <h2 className="text-4xl font-semibold text-gray-800">
                  
                  Procedimientos
                 </h2>
                 <div className="border border-gray-400 rounded-lg py-2 px-4 text-sm text-gray-600">
                   Completado %
                 </div>
                </div>
                {/* Contenedor de las filas de tareas */}
                    <div className="flex flex-col space-y-4">
                        <div className="h-8 border-b-2 border-gray-300 w-full" />
                        {/* Fila 1: Intubación */}
                        <div className="flex items-center w-full">
                            <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-800 text-left">
                                Intubación
                            </button>
                            {/* Este contenedor de flexbox mueve todo su contenido a la derecha */}
                            <div className="flex items-center space-x-4 ml-auto">
                                <input type="checkbox" className="h-6 w-6 border-2 border-gray-400 rounded-md" />
                                <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                    Subir archivos
                                </button>
                                <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                    Comentarios
                                </button>
                            </div>
                        </div>
                        <div className=" border-b-2 border-gray-300 w-full" />
                        {/* Fila 2: Medicación */}
                        <div className="flex items-center w-full">
                            <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-800 text-left">
                                Medicación
                            </button>
                            <div className="flex items-center space-x-4 ml-auto">
                               <input type="checkbox" className="h-6 w-6 border-2 border-gray-400 rounded-md" />
                                <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                    Subir archivos
                                </button>
                                <button className="bg-white border border-gray-400 rounded-md py-2 px-4 text-gray-600">
                                    Comentarios
                                </button>
                            </div>
                        </div>
                         <div className=" border-b-2 border-gray-300 w-full" />
                    

                    

                    {/* Botón de "Agregar" */}
                    <button className="mt-4 border border-gray-400 rounded-md py-2 px-4 w-fit text-gray-500">
                        + Agregar
                    </button>

                    
                </div>
            </div>
        </div>
    );
}