"use client";
import React from "react";

interface AgregarFilaButtonProps {
    onAgregar: () => void;
}

export default function AgregarFilaButton({ onAgregar }: AgregarFilaButtonProps) {
    return (
        <button 
            onClick={onAgregar}
            className="mt-4 border border-gray-400 rounded-md py-2 px-4 w-fit text-gray-500 hover:bg-gray-50 transition-colors"
        >
            + Agregar
        </button>
    );
}