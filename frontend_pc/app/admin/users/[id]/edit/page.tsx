"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { profileService, ProfileUser } from "@/lib/services/profileService";
import { specialtyService, Specialty, JefeEspecialidadData } from "@/lib/services/specialtyService";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const userId = params.id as string;
    const userRole = searchParams.get('role') || 'becado';

    const [user, setUser] = useState<ProfileUser | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Jefe specialties management
    const [jefeAssignedSpecialties, setJefeAssignedSpecialties] = useState<JefeEspecialidadData[]>([]);
    const [selectedSpecialtyToAdd, setSelectedSpecialtyToAdd] = useState<string>("");
    const [addingSpecialty, setAddingSpecialty] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        specialty: "",
        specialtyId: "",
        hospital: "",
        scholarshipStartYear: "",
        scholarshipSupervisor: "",
    });

    // Password and Quota states
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [quota, setQuota] = useState<number>(0);

    // Generate random password
    const generateRandomPassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
        setShowPassword(true); // Show password when generated
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, specialtiesData] = await Promise.all([
                    profileService.getProfileByUserId(userId, userRole),
                    specialtyService.getSpecialties()
                ]);
                
                setUser(userData);
                setSpecialties(specialtiesData);

                // Extract unique years from cohorts
                const years = new Set<number>();
                specialtiesData.forEach(s => {
                    s.cohorts?.forEach(c => years.add(c.year));
                    if (s.startYear) years.add(s.startYear);
                });
                const currentYear = new Date().getFullYear();
                years.add(currentYear);
                years.add(currentYear + 1);
                setAvailableYears(Array.from(years).sort((a, b) => b - a));

                // Set initial year from user data
                const userYear = (userData as any).scholarshipStartYear || currentYear.toString();
                setSelectedYear(userYear);
                
                // Get specialtyId directly from userData if available, otherwise find by name
                let userSpecialtyId = (userData as any).specialtyId || "";
                if (!userSpecialtyId && userData.specialty) {
                    const userSpecialty = specialtiesData.find(s => s.name === userData.specialty);
                    userSpecialtyId = userSpecialty?.id || "";
                }
                
                setFormData({
                    fullName: userData.fullName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    specialty: userData.specialty || "",
                    specialtyId: userSpecialtyId,
                    hospital: (userData as any).hospital || "",
                    scholarshipStartYear: userYear,
                    scholarshipSupervisor: (userData as any).scholarshipSupervisor || "",
                });
                // Convert bytes to MB for display
                const quotaInBytes = userData.storageQuota || 52428800;
                setQuota(parseFloat((quotaInBytes / (1024 * 1024)).toFixed(2)));
                
                // Load jefe assigned specialties if role is jefe_especialidad
                if (userRole === 'jefe_especialidad') {
                    const jefeSpecialties = await specialtyService.getSpecialtiesByJefeUserId(userId);
                    setJefeAssignedSpecialties(jefeSpecialties);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId, userRole]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = e.target.value;
        setSelectedYear(year);
        // Reset specialty and update scholarshipStartYear
        setFormData(prev => ({ 
            ...prev, 
            scholarshipStartYear: year,
            specialty: "",
            specialtyId: ""
        }));
    };

    const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const specialtyId = e.target.value;
        const selectedSpecialty = specialties.find(s => s.id === specialtyId);
        setFormData(prev => ({
            ...prev,
            specialtyId: specialtyId,
            specialty: selectedSpecialty?.name || ""
        }));
    };

    // Filter specialties based on selected year, always include user's current specialty
    const filteredSpecialties = specialties.filter(s => {
        // Always include the user's current specialty
        if (formData.specialtyId && s.id === formData.specialtyId) return true;
        if (!s.cohorts || s.cohorts.length === 0) return true;
        return s.cohorts.some(c => c.year === parseInt(selectedYear));
    });

    // For jefe: filter out already assigned specialties
    const availableSpecialtiesForJefe = specialties.filter(
        s => !jefeAssignedSpecialties.some(assigned => assigned.specialtyId === s.id)
    );

    const handleAddJefeSpecialty = async () => {
        if (!selectedSpecialtyToAdd) return;
        setAddingSpecialty(true);
        try {
            await specialtyService.assignJefe(userId, selectedSpecialtyToAdd);
            // Refresh assigned specialties
            const updated = await specialtyService.getSpecialtiesByJefeUserId(userId);
            setJefeAssignedSpecialties(updated);
            setSelectedSpecialtyToAdd("");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al asignar especialidad");
        } finally {
            setAddingSpecialty(false);
        }
    };

    const handleRemoveJefeSpecialty = async (specialtyId: string) => {
        if (!confirm("¿Estás seguro de remover esta especialidad?")) return;
        try {
            await specialtyService.unassignJefe(userId, specialtyId);
            // Refresh assigned specialties
            const updated = await specialtyService.getSpecialtiesByJefeUserId(userId);
            setJefeAssignedSpecialties(updated);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al remover especialidad");
        }
    };

    const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string for editing
        if (value === "") {
            setQuota(0);
            return;
        }
        setQuota(parseFloat(value));
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSave = async () => {
        if (!confirm("¿Estás seguro de que deseas guardar los cambios?")) return;

        setSaving(true);
        try {
            const isAdmin = user?.role === 'admin' || user?.role === 'admin_readonly';

            // For admin roles, only update name and password
            if (isAdmin) {
                // 1. Update User Name in Auth Service
                if (user && formData.fullName !== user.fullName) {
                    await profileService.updateUser(user.rut, { fullName: formData.fullName });
                }

                // 2. Update Password if provided
                if (newPassword && user) {
                    await profileService.updatePassword(user.rut, newPassword);
                }
            } else {
                // Non-admin roles: update full profile
                // Clean form data to remove empty strings for optional fields
                const cleanedData = Object.fromEntries(
                    Object.entries(formData).filter(([_, v]) => v !== "")
                );

                // Include rut for profile creation if needed (jefe_especialidad without profile)
                const profileData = { ...cleanedData, rut: user?.rut };

                // 1. Update Profile Data (Becado or Doctor Service based on role)
                await profileService.adminUpdateProfile(userId, profileData, user?.role || userRole);

                // 2. Update User Data (Auth Service - Name Sync)
                if (user && formData.fullName !== user.fullName) {
                    await profileService.updateUser(user.rut, { fullName: formData.fullName });
                }

                // 3. Update Password if provided
                if (newPassword && user) {
                    await profileService.updatePassword(user.rut, newPassword);
                }

                // 4. Update Quota if user is a scholar
                if (user?.role === 'becado') {
                    // Convert MB back to Bytes
                    const quotaInBytes = Math.floor(quota * 1024 * 1024);
                    await profileService.updateStorageQuota(userId, quotaInBytes);
                }
            }

            alert("Usuario actualizado exitosamente");
            router.push("/admin/listain");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!user) return <div className="p-10 text-center">Usuario no encontrado</div>;

    return (
        <div className="bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F] min-h-screen flex flex-col">
            <Navbar title="Editar Usuario" subtitle="Administración" />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl w-full max-w-4xl border-2 border-white/30 rounded-3xl overflow-hidden p-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Editar Perfil: {user.fullName}</h1>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600 uppercase">
                            {user.role}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Información Personal</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Se actualizará en todo el sistema.</p>
                            </div>

                            {/* Solo mostrar email y teléfono si NO es admin */}
                            {user.role !== 'admin' && user.role !== 'admin_readonly' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Nota para admin */}
                            {(user.role === 'admin' || user.role === 'admin_readonly') && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-700 text-sm">
                                        💡 Los administradores solo tienen nombre y contraseña. 
                                        No requieren información de contacto ni académica.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Academic / Professional Info - Solo para roles no-admin */}
                        {user.role !== 'admin' && user.role !== 'admin_readonly' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Información Académica</h3>
                            
                            {/* For Jefe de Especialidad: Multi-specialty management */}
                            {user.role === 'jefe_especialidad' ? (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Especialidades a Cargo</label>
                                    
                                    {/* Assigned specialties with remove button */}
                                    <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        {jefeAssignedSpecialties.length === 0 ? (
                                            <span className="text-gray-400 text-sm">Sin especialidades asignadas</span>
                                        ) : (
                                            jefeAssignedSpecialties.map((spec) => (
                                                <div 
                                                    key={spec.id} 
                                                    className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-purple-200"
                                                >
                                                    <span>{spec.specialtyName}</span>
                                                    {spec.startYear && (
                                                        <span className="bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                                                            {spec.startYear}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveJefeSpecialty(spec.specialtyId)}
                                                        className="ml-1 text-purple-600 hover:text-red-600 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                                                        title="Remover especialidad"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    
                                    {/* Add new specialty */}
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedSpecialtyToAdd}
                                            onChange={(e) => setSelectedSpecialtyToAdd(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                                        >
                                            <option value="">Agregar especialidad...</option>
                                            {availableSpecialtiesForJefe.map(spec => (
                                                <option key={spec.id} value={spec.id}>
                                                    {spec.name}{spec.startYear ? ` (${spec.startYear})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddJefeSpecialty}
                                            disabled={!selectedSpecialtyToAdd || addingSpecialty}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {addingSpecialty ? '...' : '+ Agregar'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Puede asignar múltiples especialidades a este jefe.</p>
                                </div>
                            ) : (
                                <>
                                    {user.role === 'becado' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Año de Ingreso</label>
                                            <select
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                            >
                                                {availableYears.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Seleccione el año para ver las especialidades disponibles.</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                                        <select
                                            value={formData.specialtyId}
                                            onChange={handleSpecialtyChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                        >
                                            <option value="">Seleccionar Especialidad</option>
                                            {filteredSpecialties.map(spec => (
                                                <option key={spec.id} value={spec.id}>{spec.name}{spec.startYear ? ` (${spec.startYear})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {user.role === 'becado' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                                            <input
                                                type="text"
                                                name="hospital"
                                                value={formData.hospital}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        )}

                        {/* Security & Quota */}
                        <div className={`space-y-4 ${user.role === 'admin' || user.role === 'admin_readonly' ? '' : 'md:col-span-2'}`}>
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Seguridad</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-1">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Dejar en blanco para mantener actual"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generateRandomPassword}
                                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors whitespace-nowrap"
                                            title="Generar contraseña aleatoria"
                                        >
                                            🎲 Generar
                                        </button>
                                    </div>
                                    {newPassword && (
                                        <p className="text-xs text-green-600 mt-1">La contraseña será actualizada al guardar.</p>
                                    )}
                                </div>

                                {user.role === 'becado' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cuota de Almacenamiento (MB)</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={quota}
                                                onChange={handleQuotaChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3FD0B6] focus:border-transparent text-gray-900 bg-white"
                                            />
                                            <div className="bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 min-w-[100px] text-center">
                                                {formatBytes(quota * 1024 * 1024)}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ingresa el valor en Megabytes.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-[#3FD0B6] text-white rounded-xl hover:bg-[#2A9D8F] transition-all duration-300 font-medium shadow-lg shadow-teal-500/30 flex items-center"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
