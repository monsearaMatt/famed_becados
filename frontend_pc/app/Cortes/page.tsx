import React from "react";

interface columna {
    id: number;
    nombre: string;
}

const columnas: columna[] = [
    { id: 1, nombre: "Corte 1" },
    { id: 2, nombre: "Corte 2" },
    { id: 3, nombre: "Corte 3" },
    
];

export default function Cortes() {
    return (
        <div className="bg-[#EEEEEE] min-h-screen flex flex-col items-center">
            
            <nav className="flex justify-end items-center w-full  py-12 bg-[#3FD0B6] border-b-8 border-gray-300 rounded-t-3xl">
               
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

           
            <div className="h-8" /> {/* Spacer */}
            <div
                className="bg-white rounded-3xl shadow-lg shadow-gray-200 p-16 w-[calc(100%-4rem)] min-h-screen m-8 relative border-2 border-[#4b867b]"
            >
                <div className="grid grid-cols-3 gap-8 justify-start items-start">
                    {columnas.map(({ id, nombre }) =>(
                        <div
                            key={id}
                            className="flex-1 bg-white rounded-3xl shadow-lg shadow-gray-200 p-8 border-2 border-[#4b867b] flex flex-col items-center justify-center min-h-[200px]"
                        >
                             <h3 className="text-xl text-black font-semibold justify-center ">{nombre}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
