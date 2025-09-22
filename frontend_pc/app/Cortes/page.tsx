import React from "react";

export default function cortes() {
    
        return (
            <div style={{ background: "#EEEEEE", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <nav style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    padding: "3rem 0",
                    background: "#3FD0B6",
                    borderBottom: "8px solid #ddd",
                    borderRadius: "1.5rem 1.5rem 0 0"
                }}>
                    <button style={{
                        background: "none",
                        border: "none",
                        marginRight: "3rem",
                        cursor: "pointer",
                        fontSize: "3rem",
                        width: "5rem",
                        height: "5rem"
                    }}>
                        <span role="img" aria-label="notifications">🔔</span>
                    </button>
                    <button style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "3rem",
                        width: "5rem",
                        height: "5rem"
                    }}>
                        <span role="img" aria-label="profile">👤</span>
                    </button>
                </nav>
                <div style={{ height: "2rem" }} /> {/* Espacio entre navbar y marco */}
                <div style={{
                    background: "#fff",
                    borderRadius: "2rem",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    padding: "4rem",
                    width: "calc(100% - 4rem)",
                    minHeight: "calc(100vh - 12rem)",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: "0 2rem 2rem 2rem",
                    position: "relative",
                    top: "0",
                    border: "2px solid #4b867b"
                }}>
                    <div style={{
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        gap: "2rem"
                    }}>
                        {[1, 2, 3].map((col) => (
                            <div
                                key={col}
                                style={{
                                    flex: 1,
                                    background: "#fff",
                                    borderRadius: "2rem",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                                    padding: "2rem",
                                    border: "2px solid #4b867b",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    minHeight: "200px"
                                }}
                            >
                                {/* Contenido columna {col} */}
                            </div>
                            
                        ))}
                    </div>
                </div>
            </div>
        );


}