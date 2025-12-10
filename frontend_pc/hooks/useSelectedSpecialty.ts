import { useState, useEffect } from 'react';
import { specialtyService, JefeEspecialidadData } from '@/lib/services/specialtyService';
import { useAuth } from './useAuth';

const SELECTED_SPECIALTY_KEY = 'selectedSpecialtyId';

export function useSelectedSpecialty() {
    const { user } = useAuth();
    const [selectedSpecialty, setSelectedSpecialty] = useState<JefeEspecialidadData | null>(null);
    const [mySpecialties, setMySpecialties] = useState<JefeEspecialidadData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSpecialties = async () => {
            if (user?.rol !== 'jefe_especialidad') {
                setLoading(false);
                return;
            }

            try {
                const specialties = await specialtyService.getMySpecialties();
                setMySpecialties(specialties);

                const savedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
                if (savedSpecialtyId) {
                    const saved = specialties.find(s => s.specialtyId === savedSpecialtyId);
                    if (saved) {
                        setSelectedSpecialty(saved);
                    } else if (specialties.length > 0) {
                        setSelectedSpecialty(specialties[0]);
                    }
                } else if (specialties.length > 0) {
                    setSelectedSpecialty(specialties[0]);
                    localStorage.setItem(SELECTED_SPECIALTY_KEY, specialties[0].specialtyId);
                }
            } catch (error) {
                console.error('Error loading specialties:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSpecialties();
    }, [user?.rol]);

    const selectSpecialty = (specialty: JefeEspecialidadData) => {
        setSelectedSpecialty(specialty);
        localStorage.setItem(SELECTED_SPECIALTY_KEY, specialty.specialtyId);
    };

    return {
        selectedSpecialty,
        mySpecialties,
        loading,
        selectSpecialty,
        specialtyId: selectedSpecialty?.specialtyId || null,
        specialtyName: selectedSpecialty?.specialtyName || null
    };
}
