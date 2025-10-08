import React from "react";
import Becado from "./page";

const filasIniciales = [
    { id: 1, nombre: "Intubación" },
    { id: 2, nombre: "Medicación" }
];

export default function BecadoPage() {
    return <Becado filasIniciales={filasIniciales} />;
}

export const dynamic = "force-dynamic";