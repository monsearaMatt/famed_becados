'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { specialtyService, Specialty, Cohort } from '@/lib/services/specialtyService';
import { doctorCohortService } from '@/lib/services/doctorCohortService';
import { authService } from '@/lib/auth';

export default function AdminUserCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSpecialtyId = searchParams.get('specialtyId');

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    rut: string;
    password: string;
    role: string;
    fullName: string;
    specialtyName?: string;
    warning?: string;
  } | null>(null);

  // Para selección de cohortes cuando es doctor
  const [availableCohorts, setAvailableCohorts] = useState<Cohort[]>([]);
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);

  // If coming from a specialty page, restrict roles to specialty-related ones
  const isFromSpecialty = !!preSelectedSpecialtyId;
  const allowedRolesFromSpecialty = ['becado', 'doctor', 'jefe_especialidad'];
  const adminRoles = ['admin', 'admin_readonly'];

  const [formData, setFormData] = useState({
    rut: '',
    fullName: '',
    email: '',
    role: 'becado',
    specialtyId: preSelectedSpecialtyId || '',
    entryYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await specialtyService.getSpecialties();
        setSpecialties(data);

        // Extract unique years from cohorts
        const years = new Set<number>();
        data.forEach(s => {
          s.cohorts?.forEach(c => years.add(c.year));
          if (s.startYear) years.add(s.startYear);
        });
        // Also add current year and next year if not present, to allow creating new cohorts
        const currentYear = new Date().getFullYear();
        years.add(currentYear);
        years.add(currentYear + 1);

        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (err) {
        console.error('Error loading specialties:', err);
      }
    };
    loadSpecialties();
  }, []);

  // Handle pre-selection and locking
  useEffect(() => {
    if (preSelectedSpecialtyId && specialties.length > 0) {
      const spec = specialties.find(s => s.id === preSelectedSpecialtyId);
      if (spec) {
        // If specialty has a startYear, use it. Otherwise keep default.
        const yearToUse = spec.startYear ? spec.startYear.toString() : selectedYear;

        setSelectedYear(yearToUse);
        setFormData(prev => ({
          ...prev,
          specialtyId: spec.id,
          entryYear: yearToUse
        }));
      }
    }
  }, [preSelectedSpecialtyId, specialties]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    setSelectedYear(year);
    setFormData(prev => ({ ...prev, entryYear: year, specialtyId: '' }));
  };

  // Filter specialties based on selected year (by startYear of the specialty)
  const filteredSpecialties = specialties.filter(s => {
    // Always include the pre-selected specialty to avoid it disappearing
    if (preSelectedSpecialtyId && s.id === preSelectedSpecialtyId) return true;

    // Filter by the specialty's startYear
    if (s.startYear) {
      return s.startYear === parseInt(selectedYear);
    }

    // If no startYear, show in all years (legacy data)
    return true;
  });

  // Cargar cohortes cuando se selecciona especialidad y el rol es doctor
  useEffect(() => {
    const loadCohorts = async () => {
      if (formData.role === 'doctor' && formData.specialtyId) {
        setLoadingCohorts(true);
        try {
          const cohorts = await specialtyService.getCohorts(formData.specialtyId);
          setAvailableCohorts(cohorts);
        } catch (err) {
          console.error('Error loading cohorts:', err);
          setAvailableCohorts([]);
        } finally {
          setLoadingCohorts(false);
        }
      } else {
        setAvailableCohorts([]);
        setSelectedCohortIds([]);
      }
    };
    loadCohorts();
  }, [formData.role, formData.specialtyId]);

  // Limpiar cohortes seleccionados cuando cambia la especialidad
  useEffect(() => {
    setSelectedCohortIds([]);
  }, [formData.specialtyId]);

  const handleCohortToggle = (cohortId: string) => {
    setSelectedCohortIds(prev =>
      prev.includes(cohortId)
        ? prev.filter(id => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const handleSelectAllCohorts = () => {
    if (selectedCohortIds.length === availableCohorts.length) {
      setSelectedCohortIds([]);
    } else {
      setSelectedCohortIds(availableCohorts.map(c => c.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      // 1. Create User in Auth Service
      const tempPassword = Math.random().toString(36).slice(-8);

      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          rut: formData.rut,
          fullName: formData.fullName,
          role: formData.role,
          password: tempPassword
        })
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        let errorMessage = 'Error al crear usuario en Auth Service';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Respuesta no JSON del servidor:', errorText);
          errorMessage = errorText ? `Error del servidor: ${errorText.substring(0, 100)}` : `Error ${authResponse.status}: ${authResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const authData = await authResponse.json();
      const userId = authData.user.id; // Assuming auth service returns the created user with ID

      // 2. Create Profile in Becado Service (or Doctor Service)
      // We need to determine the cohort based on entry year if it's a becado
      let cohortId = undefined;
      if (formData.role === 'becado' && formData.specialtyId) {
        // Try to find or create cohort
        const cohorts = await specialtyService.getCohorts(formData.specialtyId);
        const year = parseInt(formData.entryYear);
        const existingCohort = cohorts.find(c => c.year === year);

        if (existingCohort) {
          cohortId = existingCohort.id;
        } else {
          // Create cohort if it doesn't exist
          const newCohort = await specialtyService.createCohort(formData.specialtyId, year);
          cohortId = newCohort.id;
        }
      }

      // Call the appropriate service to create profile
      const profileEndpoint = formData.role === 'becado' ? '/becado/profile' : '/doctor/profile'; // We need to implement doctor creation too if needed

      // Note: We only implemented POST /becado/profile. For doctors, we might need similar logic.
      // For now, let's assume we are creating a Becado or we reuse the endpoint if we unify it, 
      // but currently they are separate.
      // If role is doctor, we might need to create a doctor profile.
      // Let's stick to Becado for now as per the prompt's focus on cohorts.

      if (formData.role === 'becado') {
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/becado/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({
            userId: userId,
            rut: formData.rut,
            fullName: formData.fullName,
            email: formData.email,
            specialtyId: formData.specialtyId,
            cohortId: cohortId,
            scholarshipStartYear: formData.entryYear
          })
        });

        if (!profileResponse.ok) {
          throw new Error('Usuario creado en Auth, pero falló la creación del perfil de Becado.');
        }
      } else if (formData.role === 'doctor' || formData.role === 'jefe_especialidad') {
        // Create Doctor profile for doctors AND jefe_especialidad
        // jefe_especialidad uses DoctorProfile to store email/phone/specialty info
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({
            userId: userId,
            rut: formData.rut,
            fullName: formData.fullName,
            email: formData.email,
            specialtyId: formData.specialtyId || undefined // Optional for jefe
          })
        });

        if (!profileResponse.ok) {
          const errorMsg = formData.role === 'doctor'
            ? 'Usuario creado en Auth, pero falló la creación del perfil de Doctor.'
            : 'Usuario creado en Auth, pero falló la creación del perfil.';
          throw new Error(errorMsg);
        }

        // Si es doctor y hay cohortes seleccionados, asignarlos
        if (formData.role === 'doctor' && selectedCohortIds.length > 0) {
          try {
            // Obtener el doctorId del perfil creado
            const profileData = await profileResponse.json();
            console.log('Profile data received:', profileData);
            const doctorId = profileData.profile?.id;
            console.log('Doctor ID extracted:', doctorId);
            console.log('Selected cohort IDs:', selectedCohortIds);
            console.log('Specialty ID:', formData.specialtyId);

            if (doctorId) {
              console.log('Calling updateSpecialtyCohorts...');
              // Usar updateSpecialtyCohorts para asegurar que la asignación es específica y segura
              // Además asegura la creación de DoctorSpecialtyAssignment implícita
              await doctorCohortService.updateSpecialtyCohorts(doctorId, formData.specialtyId, selectedCohortIds);
              console.log('updateSpecialtyCohorts completed successfully');
            } else {
              console.error('No doctorId found in profile response');
            }
          } catch (cohortError) {
            console.error('Error assigning cohorts to doctor:', cohortError);
            // No fallar completamente, solo advertir
            // No fallar completamente, solo advertir
            const specName = specialties.find(s => s.id === formData.specialtyId)?.name || '';
            setSuccessData({
              rut: formData.rut,
              password: tempPassword,
              role: formData.role,
              fullName: formData.fullName,
              specialtyName: specName,
              warning: 'No se pudieron asignar los cohortes automáticamente. Puede asignarlos desde la configuración del doctor.'
            });

            setFormData({
              rut: '',
              fullName: '',
              email: '',
              role: 'becado',
              specialtyId: preSelectedSpecialtyId || '',
              entryYear: preSelectedSpecialtyId ? formData.entryYear : new Date().getFullYear().toString(),
            });
            setSelectedCohortIds([]);
            return;
          }
        }
      }
      // Note: admin and admin_readonly roles don't need profiles in becado-service
      // They are identified by their role in auth-service only

      // 3. If creating a jefe_especialidad from a specialty page, auto-assign to that specialty
      if (formData.role === 'jefe_especialidad' && preSelectedSpecialtyId) {
        try {
          await specialtyService.assignJefe(userId, preSelectedSpecialtyId);
        } catch (assignError) {
          console.error('Error auto-assigning jefe to specialty:', assignError);
          // Don't fail the whole process, just warn
          const specName = specialties.find(s => s.id === preSelectedSpecialtyId)?.name || '';
          setSuccessData({
            rut: formData.rut,
            password: tempPassword,
            role: formData.role,
            fullName: formData.fullName,
            specialtyName: specName,
            warning: 'No se pudo asignar automáticamente a la especialidad. Asígnelo manualmente desde la sección "Jefes de Especialidad".'
          });

          // Mantener specialtyId y entryYear si venimos de una especialidad
          setFormData({
            rut: '',
            fullName: '',
            email: '',
            role: 'becado',
            specialtyId: preSelectedSpecialtyId || '',
            entryYear: preSelectedSpecialtyId ? formData.entryYear : new Date().getFullYear().toString(),
          });
          setSelectedCohortIds([]);
          return; // Exit early with partial success message
        }
      }

      const specName = formData.specialtyId
        ? specialties.find(s => s.id === formData.specialtyId)?.name
        : undefined;

      setSuccessData({
        rut: formData.rut,
        password: tempPassword,
        role: formData.role,
        fullName: formData.fullName,
        specialtyName: specName
      });

      // Mantener specialtyId y entryYear si venimos de una especialidad
      setFormData({
        rut: '',
        fullName: '',
        email: '',
        role: 'becado',
        specialtyId: preSelectedSpecialtyId || '',
        entryYear: preSelectedSpecialtyId ? formData.entryYear : new Date().getFullYear().toString(),
      });
      setSelectedCohortIds([]);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <span className="mr-2">←</span>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
        <p className="text-gray-500">Registre un nuevo usuario en el sistema.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {successData && (
          <div className="mb-8 bg-white border border-gray-100 rounded-xl shadow-lg run-animation slide-in-from-top-4 overflow-hidden">
            {/* Header Strip */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide leading-none">Usuario Creado</h3>
                  <p className="text-green-50 text-xs font-medium mt-1 opacity-90">El perfil ha sido registrado correctamente</p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-green-700 text-xs font-bold px-3 py-1 bg-white/90 rounded-full shadow-sm">
                Activo
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Details Column */}
                <div className="space-y-6">
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 pb-2">Datos Personales</h4>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Nombre Completo</span>
                    <span className="text-xl font-medium text-gray-900 tracking-tight">{successData.fullName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">RUT</span>
                      <span className="text-base text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">
                        {successData.rut}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Rol</span>
                      <span className="text-base text-blue-600 bg-blue-50 font-medium capitalize px-3 py-1 rounded-full inline-block border border-blue-100">
                        {successData.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {successData.specialtyName && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Especialidad</span>
                      <div className="flex items-center gap-2 text-gray-800">
                        <span className="text-lg">🩺</span>
                        <span className="text-base font-medium">{successData.specialtyName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Credentials Column */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8"></div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4 flex items-center gap-2">
                      <span>🔐</span> Credenciales de Acceso
                    </h4>

                    <div className="bg-white border border-slate-200 rounded-lg p-1 shadow-sm mb-4">
                      <div className="flex items-center justify-between p-1 pl-3 bg-white rounded-lg">
                        <code className="text-xl font-mono font-bold text-slate-700 tracking-wider">
                          {successData.password}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(successData.password);
                            const btn = document.getElementById('copy-btn-inner');
                            if (btn) {
                              const original = btn.innerHTML;
                              btn.innerHTML = '<span class="text-green-600 font-bold text-xs">¡Copiado!</span>';
                              setTimeout(() => { btn.innerHTML = original; }, 2000);
                            }
                          }}
                          className="ml-4 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-transparent hover:border-blue-200 px-3 py-2 rounded-md transition-all active:scale-95"
                          title="Copiar contraseña"
                          type="button"
                        >
                          <span id="copy-btn-inner" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide">
                            <span>Copiar</span> 📋
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 text-center">
                    <p className="text-xs text-red-500 font-medium bg-red-50 py-2 px-3 rounded-full inline-block border border-red-100">
                      ⚠️ Esta contraseña solo se mostrará una vez
                    </p>
                  </div>
                </div>
              </div>

              {successData.warning && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h5 className="font-bold text-amber-800 text-sm mb-1">Información Adicional</h5>
                    <p className="text-amber-700 text-sm">{successData.warning}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="12345678-9"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="becado">Becado</option>
                <option value="doctor">Doctor</option>
                <option value="jefe_especialidad">Jefe de Especialidad</option>
                {/* Only show admin roles if NOT coming from a specialty page */}
                {!isFromSpecialty && (
                  <>
                    <option value="admin">Administrador</option>
                    <option value="admin_readonly">Administrador (Solo Lectura)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Only show academic data section for roles that need a specialty */}
          {(formData.role === 'becado' || formData.role === 'doctor') && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Académicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.role === 'becado' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año de Ingreso</label>
                    <select
                      name="entryYear"
                      value={selectedYear}
                      onChange={handleYearChange}
                      disabled={!!preSelectedSpecialtyId}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${preSelectedSpecialtyId ? 'bg-gray-200 font-medium cursor-not-allowed opacity-100' : 'bg-white'}`}
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
                    name="specialtyId"
                    value={formData.specialtyId}
                    onChange={handleChange}
                    disabled={!!preSelectedSpecialtyId}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${preSelectedSpecialtyId ? 'bg-gray-200 font-medium cursor-not-allowed opacity-100' : 'bg-white'}`}
                    required={formData.role === 'becado' || formData.role === 'doctor'}
                  >
                    <option value="">Seleccione una especialidad</option>
                    {filteredSpecialties.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.startYear ? ` (${s.startYear})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección de cohortes para doctores */}
              {formData.role === 'doctor' && formData.specialtyId && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cohortes a Evaluar
                    </label>
                    {availableCohorts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllCohorts}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedCohortIds.length === availableCohorts.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </button>
                    )}
                  </div>

                  {loadingCohorts ? (
                    <div className="text-gray-500 text-sm py-4">Cargando cohortes...</div>
                  ) : availableCohorts.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md text-sm">
                      No hay cohortes disponibles para esta especialidad.
                      Puede crear cohortes desde la configuración de la especialidad.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableCohorts
                        .sort((a, b) => a.year - b.year)
                        .map(cohort => (
                          <label
                            key={cohort.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedCohortIds.includes(cohort.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCohortIds.includes(cohort.id)}
                              onChange={() => handleCohortToggle(cohort.id)}
                              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium">Cohorte {cohort.year}</span>
                          </label>
                        ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Seleccione los cohortes que este doctor podrá evaluar. Puede modificar esto más adelante.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info for jefe_especialidad role */}
          {formData.role === 'jefe_especialidad' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
                <p className="text-sm">
                  <strong>Nota:</strong> Los Jefes de Especialidad son roles administrativos que pueden gestionar una o más especialidades.
                  La asignación de especialidades se realiza desde la configuración del sistema.
                </p>
              </div>
            </div>
          )}

          {/* Info for admin roles */}
          {adminRoles.includes(formData.role) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
                <p className="text-sm">
                  <strong>Nota:</strong> Los usuarios con rol de Administrador tienen acceso a todo el sistema y no están asociados a una especialidad específica.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 mr-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
