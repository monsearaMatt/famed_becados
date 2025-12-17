"use client";
import React from "react";

interface AgregarIntegranteButtonProps {
    onAgregar: () => void;
}

export default function AgregarIntegranteButton({ onAgregar }: AgregarIntegranteButtonProps) {
    return (
        <button 
            onClick={onAgregar}
            className="mt-4 border-2 border-gray-500 rounded-md py-2 px-4 w-fit text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-700 transition-colors"
        >
            + Agregar Integrante
        </button>
    );
}