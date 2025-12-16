'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { profileService, ProfileUser } from '@/lib/services/profileService';
import { specialtyService, Specialty } from '@/lib/services/specialtyService';
import { doctorCohortService, DoctorCohortAssignment } from '@/lib/services/doctorCohortService';
import { doctorSpecialtyService } from '@/lib/services/doctorSpecialtyService';

interface SpecialtyWithCohorts {
    id: string;
    name: string;
    startYear?: number;
    cohorts: {
        id: string;
        year: number;
        assigned: boolean;
    }[];
}

export default function DoctorAssignmentsPage() {
    const router = useRouter();
    const params = useParams();
    const doctorId = params.id as string;

    const [doctor, setDoctor] = useState<ProfileUser | null>(null);
    const [specialties, setSpecialties] = useState<SpecialtyWithCohorts[]>([]);
    const [currentAssignments, setCurrentAssignments] = useState<DoctorCohortAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await profileService.getAllUsers();
                const foundDoctor = users.find(u => u.id === doctorId);
                if (!foundDoctor) {
                    alert('Doctor no encontrado');
                    router.push('/admin/doctors');
                    return;
                }
                setDoctor(foundDoctor);

                // Load doctor's assigned specialties and cohort assignments
                const [specialtyAssignments, cohortAssignments] = await Promise.all([
                    doctorSpecialtyService.getAssignedSpecialties(doctorId),
                    doctorCohortService.getDoctorCohorts(doctorId)
                ]);

                setCurrentAssignments(cohortAssignments);

                // Get specialty IDs that are assigned
                const assignedSpecialtyIds = specialtyAssignments.map(a => a.specialtyId);

                // IMPORTANT: Also include doctor's primary specialtyId if set
                // This handles doctors created from specialty pages
                if (foundDoctor.specialtyId && !assignedSpecialtyIds.includes(foundDoctor.specialtyId)) {
                    assignedSpecialtyIds.push(foundDoctor.specialtyId);
                }

                // If no specialties assigned, show empty state
                if (assignedSpecialtyIds.length === 0) {
                    setSpecialties([]);
                    setLoading(false);
                    return;
                }

                // Load full data for assigned specialties only
                const allSpecialties = await specialtyService.getSpecialties();
                const assignedSpecialtiesData = allSpecialties.filter(s =>
                    assignedSpecialtyIds.includes(s.id)
                );

                // Load cohorts for each assigned specialty
                const specialtiesWithCohorts = await Promise.all(
                    assignedSpecialtiesData.map(async (specialty) => {
                        const cohorts = await specialtyService.getCohorts(specialty.id);
                        return {
                            ...specialty,
                            cohorts: cohorts.map(cohort => ({
                                id: cohort.id,
                                year: cohort.year,
                                assigned: cohortAssignments.some(
                                    a => a.cohortId === cohort.id && a.specialtyId === specialty.id
                                )
                            }))
                        };
                    })
                );

                setSpecialties(specialtiesWithCohorts);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) fetchData();
    }, [doctorId, router]);

    const handleToggleCohort = (specialtyId: string, cohortId: string) => {
        setSpecialties(prev =>
            prev.map(specialty =>
                specialty.id === specialtyId
                    ? {
                        ...specialty,
                        cohorts: specialty.cohorts.map(cohort =>
                            cohort.id === cohortId
                                ? { ...cohort, assigned: !cohort.assigned }
                                : cohort
                        )
                    }
                    : specialty
            )
        );
    };

    const handleSaveSpecialty = async (specialtyId: string) => {
        setSaving(specialtyId);
        try {
            const specialty = specialties.find(s => s.id === specialtyId);
            if (!specialty) return;

            const currentSpecialtyAssignments = currentAssignments.filter(
                a => a.specialtyId === specialtyId
            );
            const newSelection = specialty.cohorts.filter(c => c.assigned).map(c => c.id);
            const currentSelection = currentSpecialtyAssignments.map(a => a.cohortId);

            const toAdd = newSelection.filter(cohortId => !currentSelection.includes(cohortId));
            const toRemove = currentSelection.filter(cohortId => !newSelection.includes(cohortId));

            for (const cohortId of toAdd) {
                await doctorCohortService.addCohort(doctorId, cohortId, specialtyId);
            }

            for (const cohortId of toRemove) {
                await doctorCohortService.removeCohort(doctorId, cohortId);
            }

            const updatedAssignments = await doctorCohortService.getDoctorCohorts(doctorId);
            setCurrentAssignments(updatedAssignments);

            alert('As ignaciones guardadas correctamente');
        } catch (error: any) {
            console.error('Error saving assignments:', error);
            alert(error.message || 'Error al guardar asignaciones');
        } finally {
            setSaving(null);
        }
    };

    const handleSelectAll = (specialtyId: string) => {
        setSpecialties(prev =>
            prev.map(specialty =>
                specialty.id === specialtyId
                    ? {
                        ...specialty,
                        cohorts: specialty.cohorts.map(cohort => ({ ...cohort, assigned: true }))
                    }
                    : specialty
            )
        );
    };

    const handleDeselectAll = (specialtyId: string) => {
        setSpecialties(prev =>
            prev.map(specialty =>
                specialty.id === specialtyId
                    ? {
                        ...specialty,
                        cohorts: specialty.cohorts.map(cohort => ({ ...cohort, assigned: false }))
                    }
                    : specialty
            )
        );
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-600">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!doctor) return null;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/admin/doctors')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <span className="mr-2">←</span>
                    Volver a Doctores
                </button>

                <div className="flex items-center">
                    {doctor.photoUrl ? (
                        <img className="h-16 w-16 rounded-full mr-4" src={doctor.photoUrl} alt="" />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <span className="text-2xl font-medium text-green-600">
                                {doctor.fullName.charAt(0)}
                            </span>
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{doctor.fullName}</h1>
                        <p className="text-gray-600">Configurar Asignaciones de Especialidades y Cohortes</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {specialties.length === 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 p-8 rounded-lg text-center">
                        <div className="text-6xl mb-4">🎓</div>
                        <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                            Sin Especialidades Asignadas
                        </h3>
                        <p className="text-yellow-700 mb-4">
                            Este doctor no tiene especialidades asignadas todavía.
                            Debes asignar especialidades primero para poder configurar los cohortes.
                        </p>
                        <button
                            onClick={() => router.push('/admin/doctors')}
                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                            <span className="mr-2">←</span>
                            Ir a Gestionar Especialidades
                        </button>
                    </div>
                ) : (
                    specialties.map((specialty) => {
                        const assignedCount = specialty.cohorts.filter(c => c.assigned).length;
                        const totalCount = specialty.cohorts.length;

                        return (
                            <div key={specialty.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                                <span className="mr-3">🎓</span>
                                                {specialty.name} {specialty.startYear && `(${specialty.startYear})`}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {assignedCount} de {totalCount} cohorte{totalCount !== 1 ? 's' : ''} asignado{assignedCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSelectAll(specialty.id)}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Seleccionar todos
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                onClick={() => handleDeselectAll(specialty.id)}
                                                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                            >
                                                Deseleccionar todos
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {specialty.cohorts.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            No hay cohortes disponibles para esta especialidad
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                            {specialty.cohorts
                                                .sort((a, b) => a.year - b.year)
                                                .map(cohort => (
                                                    <label
                                                        key={cohort.id}
                                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${cohort.assigned
                                                            ? 'border-green-500 bg-green-50 text-green-700'
                                                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={cohort.assigned}
                                                            onChange={() => handleToggleCohort(specialty.id, cohort.id)}
                                                            className="mr-3 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                                                        />
                                                        <span className="font-medium">Cohorte {cohort.year}</span>
                                                    </label>
                                                ))}
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleSaveSpecialty(specialty.id)}
                                            disabled={saving === specialty.id}
                                            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                        >
                                            {saving === specialty.id ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                                    </svg>
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
