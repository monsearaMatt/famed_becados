"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { profileService, ProfileUser } from "@/lib/services/profileService";
import { specialtyService, Cohort } from "@/lib/services/specialtyService";

export default function Integrantes() {
    const router = useRouter();
    const [integrantes, setIntegrantes] = useState<ProfileUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Menu state
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ProfileUser | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Status management state
    const [editingStatusUser, setEditingStatusUser] = useState<ProfileUser | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [newCohortId, setNewCohortId] = useState<string>('');
    const [savingStatus, setSavingStatus] = useState(false);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [loadingCohorts, setLoadingCohorts] = useState(false);

    const [exportando, setExportando] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await profileService.getAllUsers();
                setIntegrantes(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (userId: string) => {
        if (activeMenuId === userId) {
            setActiveMenuId(null);
        } else {
            setActiveMenuId(userId);
        }
    };

    const handleViewProfile = (user: ProfileUser) => {
        setActiveMenuId(null);
        const cleanRut = user.rut.replace(/\./g, '').replace(/-/g, '');
        router.push(`/Perfil/${cleanRut}`);
    };

    const handleEditProfile = (user: ProfileUser) => {
        setActiveMenuId(null);
        router.push(`/admin/users/${user.userId}/edit?role=${user.role}`);
    };

    const handleDeleteClick = (user: ProfileUser) => {
        setActiveMenuId(null);
        setUserToDelete(user);
        setDeleteConfirmationText("");
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        if (deleteConfirmationText !== "ELIMINAR") return;

        setIsDeleting(true);
        try {
            // TODO: Implement delete user in profileService and backend
            // await profileService.deleteUser(userToDelete.userId);
            alert("Funcionalidad de eliminar en desarrollo (Backend pendiente).");

            // Mock removal from list for now
            // setIntegrantes(prev => prev.filter(u => u.id !== userToDelete.id));

            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (err) {
            alert("Error al eliminar usuario");
        } finally {
            setIsDeleting(false);
        }
    };

    const exportarArchivoComprimido = async () => {
        setExportando(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const datosExportar = {
                fechaExportacion: new Date().toISOString(),
                totalIntegrantes: integrantes.length,
                integrantes: integrantes,
                estadisticas: {
                    porRol: {
                        admin: integrantes.filter(i => i.role === 'admin').length,
                        jefe_especialidad: integrantes.filter(i => i.role === 'jefe_especialidad').length,
                        doctor: integrantes.filter(i => i.role === 'doctor').length,
                        becado: integrantes.filter(i => i.role === 'becado').length
                    }
                }
            };
            const datosJSON = JSON.stringify(datosExportar, null, 2);
            const blob = new Blob([datosJSON], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_integrantes_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert(`Archivo comprimido exportado exitosamente!\nTotal de integrantes: ${integrantes.length}`);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar el archivo comprimido.');
        } finally {
            setExportando(false);
        }
    };

    const handleAgregarUsuario = () => {
        router.push('/admin/users/new');
    };

    const openStatusModal = async (user: ProfileUser) => {
        setActiveMenuId(null);
        setEditingStatusUser(user);
        setNewStatus(user.status || 'ACTIVE');
        setNewCohortId('');

        // Load cohorts if user has specialtyId
        if (user.specialtyId) {
            setLoadingCohorts(true);
            try {
                const specialtyCohorts = await specialtyService.getCohorts(user.specialtyId);
                setCohorts(specialtyCohorts);
            } catch (error) {
                console.error('Error loading cohorts:', error);
                setCohorts([]);
            } finally {
                setLoadingCohorts(false);
            }
        } else {
            console.warn('User does not have specialtyId, cannot load cohorts');
            setCohorts([]);
        }
    };

    const closeStatusModal = () => {
        setEditingStatusUser(null);
        setNewStatus('');
        setNewCohortId('');
        setCohorts([]);
    };

    const handleSaveStatus = async () => {
        if (!editingStatusUser) return;
        setSavingStatus(true);
        try {
            const payload: any = { status: newStatus };
            if (newStatus === 'ACTIVE' && newCohortId) {
                payload.cohortId = newCohortId;
            }

            // Using standard updateProfile, assuming admin permissions handled in backend?
            // Actually jefe page used adminUpdateProfile. Let's use that one.
            await profileService.adminUpdateProfile(
                editingStatusUser.id,
                payload,
                editingStatusUser.role
            );

            // Update local state
            setIntegrantes(prev => prev.map(u =>
                u.id === editingStatusUser.id
                    ? { ...u, status: newStatus as any }
                    : u
            ));

            closeStatusModal();
            alert('Estado actualizado correctamente');
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert(error.message || 'Error al actualizar el estado');
        } finally {
            setSavingStatus(false);
        }
    };

    const getColorRol = (rol: string) => {
        switch (rol.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'admin_readonly': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'jefe_especialidad': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'doctor': return 'bg-green-100 text-green-800 border-green-200';
            case 'becado': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            <Navbar title="Gestión de Integrantes" subtitle="Administración" />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-7xl border-2 border-white/30 flex rounded-3xl overflow-hidden">
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Gestión de Integrantes</h1>
                            <p className="text-gray-800 text-sm font-medium">Administra los miembros del equipo</p>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] rounded-2xl p-4 text-white text-center backdrop-blur-sm">
                                <div className="text-2xl font-bold">{integrantes.length}</div>
                                <div className="text-sm opacity-90">Integrantes Totales</div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={exportarArchivoComprimido}
                                    disabled={exportando || loading}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-4 py-3 hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportando ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            <span>Exportando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📦</span>
                                            <span>Exportar Backup</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {loading && <div className="text-center py-10">Cargando usuarios...</div>}
                        {error && <div className="text-center py-10 text-red-500">{error}</div>}

                        {!loading && !error && (
                            <div className="space-y-3 flex-1 pb-20"> {/* Added padding bottom for menu space */}
                                <div className="flex items-center w-full py-3 px-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm">
                                    <div className="w-1/4">Nombre</div>
                                    <div className="w-1/4">Email</div>
                                    <div className="w-1/5">Rol</div>
                                    <div className="w-1/5 text-center">Estado</div>
                                    <div className="w-1/5 text-center">Acciones</div>
                                </div>

                                {integrantes.map((integrante) => (
                                    <div
                                        key={integrante.id}
                                        className="relative flex items-center w-full py-3 px-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-1/4 flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-[#3FD0B6]/10 rounded-full flex items-center justify-center text-[#3FD0B6]">
                                                👤
                                            </div>
                                            <span className="font-medium text-gray-800">{integrante.fullName}</span>
                                        </div>
                                        <div className="w-1/4">
                                            <span className="text-gray-800 text-sm font-medium">
                                                {integrante.email || 'Sin email'}
                                            </span>
                                        </div>
                                        <div className="w-1/5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorRol(integrante.role)}`}>
                                                {integrante.role}
                                            </span>
                                        </div>
                                        <div className="w-1/5 flex justify-center">
                                            {integrante.role === 'becado' && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${integrante.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                    integrante.status === 'FROZEN' ? 'bg-blue-100 text-blue-800' :
                                                        integrante.status === 'GRADUATED' ? 'bg-purple-100 text-purple-800' :
                                                            integrante.status === 'WITHDRAWN' ? 'bg-red-100 text-red-800' :
                                                                integrante.status === 'RESIGNED' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {integrante.status || 'ACTIVE'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-1/5 flex justify-center relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(integrante.id);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 font-bold text-xl"
                                            >
                                                ⋮
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenuId === integrante.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-10 top-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
                                                >
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleViewProfile(integrante)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-[#3FD0B6] flex items-center space-x-2 font-medium"
                                                        >
                                                            <span>👁️</span>
                                                            <span>Ver Perfil</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditProfile(integrante)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-blue-600 flex items-center space-x-2 font-medium"
                                                        >
                                                            <span>✏️</span>
                                                            <span>Editar Perfil</span>
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        {integrante.role === 'becado' && (
                                                            <button
                                                                onClick={() => openStatusModal(integrante)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-purple-600 flex items-center space-x-2 font-medium"
                                                            >
                                                                <span>⚙️</span>
                                                                <span>Gestionar Estado</span>
                                                            </button>
                                                        )}
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <button
                                                            onClick={() => handleDeleteClick(integrante)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                        >
                                                            <span>🗑️</span>
                                                            <span>Eliminar</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAgregarUsuario}
                                    className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#3FD0B6] hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center"
                                >
                                    <div className="text-2xl text-gray-400 mb-1">+</div>
                                    <div className="text-gray-500 font-medium text-sm">Agregar Nuevo Integrante</div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                ¿Eliminar Usuario?
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Estás a punto de eliminar a <span className="font-bold">{userToDelete.fullName}</span>.
                                Esta acción no se puede deshacer.
                            </p>
                            <p className="text-gray-500 text-xs mb-4">
                                Para confirmar, escribe <span className="font-mono font-bold text-red-600">ELIMINAR</span> en el campo de abajo.
                            </p>

                            <input
                                type="text"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                placeholder="Escribe ELIMINAR"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-mono focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setUserToDelete(null);
                                    setDeleteConfirmationText("");
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirmationText !== "ELIMINAR" || isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal para editar estado de becado */}
            {
                editingStatusUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 border-2 border-white/30 shadow-2xl">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    Gestionar Estado
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {editingStatusUser.fullName}
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Actual</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#3FD0B6] focus:border-[#3FD0B6]"
                                    >
                                        <option value="ACTIVE">Activo</option>
                                        <option value="FROZEN">Congelado</option>
                                        <option value="GRADUATED">Egresado</option>
                                        <option value="WITHDRAWN">Retirado</option>
                                        <option value="RESIGNED">Renunciado</option>
                                    </select>
                                </div>

                                {/* Mostrar selector de cohorte si se reactiva o si está activo */}
                                {(newStatus === 'ACTIVE') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Nuevo Cohorte (Reingreso)
                                        </label>
                                        <select
                                            value={newCohortId}
                                            onChange={(e) => setNewCohortId(e.target.value)}
                                            disabled={loadingCohorts}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#3FD0B6] focus:border-[#3FD0B6]"
                                        >
                                            <option value="">Seleccionar Cohorte...</option>
                                            {cohorts.map(c => (
                                                <option key={c.id} value={c.id}>Cohorte {c.year}</option>
                                            ))}
                                        </select>
                                        {loadingCohorts && <p className="text-xs text-gray-500 mt-1">Cargando cohortes...</p>}
                                        {!loadingCohorts && cohorts.length === 0 && <p className="text-xs text-red-500 mt-1">No se encontraron cohortes o especialidad no asignada.</p>}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={closeStatusModal}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveStatus}
                                    disabled={savingStatus}
                                    className="px-4 py-2 bg-gradient-to-r from-[#3FD0B6] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 flex items-center"
                                >
                                    {savingStatus ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
