'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { specialtyService, JefeEspecialidadData } from '@/lib/services/specialtyService';
import { useAuth } from '@/hooks/useAuth';

const SELECTED_SPECIALTY_KEY = 'selectedSpecialtyId';

interface SpecialtyContextType {
  mySpecialties: JefeEspecialidadData[];
  selectedSpecialty: JefeEspecialidadData | null;
  loading: boolean;
  error: string | null;
  selectSpecialty: (specialty: JefeEspecialidadData) => void;
  refreshSpecialties: () => Promise<void>;
}

const SpecialtyContext = createContext<SpecialtyContextType | undefined>(undefined);

export function SpecialtyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mySpecialties, setMySpecialties] = useState<JefeEspecialidadData[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<JefeEspecialidadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpecialties = useCallback(async () => {
    if (user?.rol !== 'jefe_especialidad') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const specialties = await specialtyService.getMySpecialties();
      setMySpecialties(specialties);

      // Load selected from localStorage
      const savedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
      
      if (savedSpecialtyId) {
        const saved = specialties.find(s => s.specialtyId === savedSpecialtyId);
        if (saved) {
          setSelectedSpecialty(saved);
        } else if (specialties.length > 0) {
          setSelectedSpecialty(specialties[0]);
          localStorage.setItem(SELECTED_SPECIALTY_KEY, specialties[0].specialtyId);
        }
      } else if (specialties.length > 0) {
        setSelectedSpecialty(specialties[0]);
        localStorage.setItem(SELECTED_SPECIALTY_KEY, specialties[0].specialtyId);
      }
    } catch (err) {
      console.error('Error loading specialties:', err);
      setError('Error al cargar especialidades');
    } finally {
      setLoading(false);
    }
  }, [user?.rol]);

  useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  const selectSpecialty = useCallback((specialty: JefeEspecialidadData) => {
    setSelectedSpecialty(specialty);
    localStorage.setItem(SELECTED_SPECIALTY_KEY, specialty.specialtyId);
  }, []);

  const refreshSpecialties = useCallback(async () => {
    await loadSpecialties();
  }, [loadSpecialties]);

  return (
    <SpecialtyContext.Provider
      value={{
        mySpecialties,
        selectedSpecialty,
        loading,
        error,
        selectSpecialty,
        refreshSpecialties
      }}
    >
      {children}
    </SpecialtyContext.Provider>
  );
}

export function useSpecialty() {
  const context = useContext(SpecialtyContext);
  if (context === undefined) {
    throw new Error('useSpecialty must be used within a SpecialtyProvider');
  }
  return context;
}

export { SELECTED_SPECIALTY_KEY };
