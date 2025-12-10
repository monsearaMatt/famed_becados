"use client";
import React from "react";

interface AgregarIntegranteButtonProps {
    onAgregar: () => void;
}

export default function AgregarIntegranteButton({ onAgregar }: AgregarIntegranteButtonProps) {
    return (
        <button 
            onClick={onAgregar}
            className="mt-4 border border-gray-400 rounded-md py-2 px-4 w-fit text-gray-500 hover:bg-gray-50 transition-colors"
        >
            + Agregar Integrante
        </button>
    );
}