"use client";
import { useState } from "react";

    export default function BotonAgregar() {
        const [boxes, setBoxes] = useState<string[]>([]);

        const handleAddBox = () => {
            setBoxes([...boxes, "Especialidad"]);
        };

        return (
            <div>
                <button
                    style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginBottom: "12px",
                    }}
                    onClick={handleAddBox}
                >
                    Agregar Especialidad
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {boxes.map((box, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: "#f5f5f5",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "12px",
                            }}
                        >
                            {box}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
