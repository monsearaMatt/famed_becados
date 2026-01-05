'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { profileService, ProfileUser } from '@/lib/services/profileService';
import { specialtyService, Specialty } from '@/lib/services/specialtyService';
import { doctorSpecialtyService } from '@/lib/services/doctorSpecialtyService';

export default function DoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<ProfileUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<ProfileUser | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const users = await profileService.getAllUsers();
                const doctorsOnly = users.filter(u => u.role === 'doctor');
                setDoctors(doctorsOnly);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleManageSpecialties = async (doctor: ProfileUser) => {
        setSelectedDoctor(doctor);
        setLoadingSpecialties(true);
        setShowSpecialtyModal(true);

        try {
            // Load all specialties
            const allSpecs = await specialtyService.getSpecialties();
            setSpecialties(allSpecs);

            // Load doctor's assigned specialties from DoctorSpecialtyAssignment
            // Note: We no longer add doctor.specialtyId (legacy field) here since
            // DoctorSpecialtyAssignment is now the single source of truth
            const assigned = await doctorSpecialtyService.getAssignedSpecialties(doctor.id);
            const assignedIds = assigned.map(a => a.specialtyId);

            setSelectedSpecialties(assignedIds);
        } catch (error) {
            console.error('Error loading specialties:', error);
        } finally {
            setLoadingSpecialties(false);
        }
    };

    const handleSaveSpecialties = async () => {
        if (!selectedDoctor) return;

        setSaving(true);
        try {
            await doctorSpecialtyService.replaceAssignments(
                selectedDoctor.id,
                selectedSpecialties
            );

            setShowSpecialtyModal(false);
            setSelectedDoctor(null);
            setSelectedSpecialties([]);
        } catch (error) {
            console.error('Error saving specialties:', error);
            alert('Error al guardar especialidades');
        } finally {
            setSaving(false);
        }
    };

    const toggleSpecialty = (specialtyId: string) => {
        if (selectedSpecialties.includes(specialtyId)) {
            setSelectedSpecialties(selectedSpecialties.filter(id => id !== specialtyId));
        } else {
            setSelectedSpecialties([...selectedSpecialties, specialtyId]);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-600">Cargando doctores...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <span className="mr-2">←</span>
                    Volver al Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Asignaciones de Doctores</h1>
                <p className="text-gray-700 mt-2">Configura qué especialidades y cohortes puede evaluar cada doctor</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Doctor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                RUT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Especialidad Primaria
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {doctors.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-700">
                                    No hay doctores registrados en el sistema
                                </td>
                            </tr>
                        ) : (
                            doctors.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {doctor.photoUrl ? (
                                                <img className="h-10 w-10 rounded-full mr-3" src={doctor.photoUrl} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                    <span className="text-sm font-medium text-green-600">
                                                        {doctor.fullName.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                                                <div className="text-sm text-gray-700">{doctor.email || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {doctor.rut}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {doctor.specialty || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleManageSpecialties(doctor)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                            >
                                                <span className="mr-2">🎓</span>
                                                Gestionar Especialidades
                                            </button>
                                            <button
                                                onClick={() => router.push(`/admin/doctors/${doctor.id}/assignments`)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                </svg>
                                                Gestionar Cohortes
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Specialty Management Modal */}
            {showSpecialtyModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            Especialidades para {selectedDoctor.fullName}
                        </h2>

                        {loadingSpecialties ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="ml-2 text-gray-800">Cargando...</span>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 text-sm text-gray-800">
                                    Selecciona las especialidades que este doctor puede evaluar
                                </div>
                                <div className="space-y-2 mb-6">
                                    {specialties.map(specialty => (
                                        <label
                                            key={specialty.id}
                                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSpecialties.includes(specialty.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecialties.includes(specialty.id)}
                                                onChange={() => toggleSpecialty(specialty.id)}
                                                className="mr-3 h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="font-medium text-gray-900">
                                                {specialty.name} {specialty.startYear && `(${specialty.startYear})`}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <div className="text-sm text-gray-800 mb-4 font-medium">
                                    {selectedSpecialties.length} de {specialties.length} especialidades seleccionadas
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setShowSpecialtyModal(false);
                                    setSelectedDoctor(null);
                                    setSelectedSpecialties([]);
                                }}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveSpecialties}
                                className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={saving || loadingSpecialties}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
