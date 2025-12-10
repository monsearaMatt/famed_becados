"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { specialtyService, JefeEspecialidadData } from "@/lib/services/specialtyService";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface NavItem {
    label: string;
    icon: string;
    path: string;
    badge?: number;
}

export interface NavbarConfig {
    title: string;
    subtitle: string;
    navItems?: NavItem[];
    showSpecialtySelector?: boolean;
    homeRoute: string;
    accentColor?: string;
}

interface NavbarProps {
    title?: string;
    subtitle?: string;
    showProfile?: boolean;
    showBackButton?: boolean;
    customConfig?: Partial<NavbarConfig>;
}

// ============================================
// ROLE-BASED CONFIGURATIONS
// ============================================

const ROLE_CONFIGS: Record<string, NavbarConfig> = {
    admin: {
        title: "Panel de Administración",
        subtitle: "Administrador",
        homeRoute: "/admin/dashboard",
        accentColor: "purple",
        navItems: [
            { label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
            { label: "Usuarios", icon: "👥", path: "/admin/listain" },
            { label: "Especialidades", icon: "🏥", path: "/admin/specialties" },
            { label: "Exportar", icon: "📤", path: "/admin/export" },
        ]
    },
    admin_readonly: {
        title: "Panel de Visualización",
        subtitle: "Administrador (Solo Lectura)",
        homeRoute: "/admin/dashboard",
        accentColor: "indigo",
        navItems: [
            { label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
            { label: "Usuarios", icon: "👥", path: "/admin/listain" },
        ]
    },
    jefe_especialidad: {
        title: "Panel de Especialidad",
        subtitle: "Jefe de Especialidad",
        homeRoute: "/jefe/areapersonal",
        showSpecialtySelector: true,
        accentColor: "blue",
        navItems: [
            { label: "Mi Área", icon: "🏠", path: "/jefe/areapersonal" },
            { label: "Becados", icon: "👨‍🎓", path: "/jefe/lista_becados" },
            { label: "Verificación", icon: "✅", path: "/jefe/verificacion" },
            { label: "Rúbricas", icon: "📋", path: "/jefe/rubricas" },
            { label: "Cortes", icon: "📅", path: "/jefe/cortes" },
        ]
    },
    doctor: {
        title: "Panel de Doctor",
        subtitle: "Docente",
        homeRoute: "/doctor/dashboard",
        accentColor: "green",
        navItems: [
            { label: "Dashboard", icon: "📊", path: "/doctor/dashboard" },
            { label: "Evaluaciones", icon: "📝", path: "/doctor/evaluations" },
        ]
    },
    becado: {
        title: "Mi Portal",
        subtitle: "Becado",
        homeRoute: "/becado/dashboard",
        accentColor: "orange",
        navItems: [
            { label: "Dashboard", icon: "📊", path: "/becado/dashboard" },
            { label: "Actividades", icon: "📚", path: "/becado/activities" },
        ]
    }
};

// Hidden back button paths
const HIDDEN_BACK_PATHS = [
    '/', 
    '/login', 
    '/jefe/areapersonal', 
    '/admin/dashboard',
    '/admin/listain', 
    '/admin/visual',
    '/doctor/dashboard',
    '/becado/dashboard'
];

// LocalStorage key for selected specialty
const SELECTED_SPECIALTY_KEY = 'selectedSpecialtyId';

// ============================================
// NAVBAR COMPONENT
// ============================================

const Navbar: React.FC<NavbarProps> = ({ 
    title,
    subtitle,
    showProfile = true,
    showBackButton,
    customConfig
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    
    // Dropdown states
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
    const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
    
    // Refs for click outside
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const navDropdownRef = useRef<HTMLDivElement>(null);
    const specialtyDropdownRef = useRef<HTMLDivElement>(null);
    
    // Specialty state for jefes
    const [mySpecialties, setMySpecialties] = useState<JefeEspecialidadData[]>([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState<JefeEspecialidadData | null>(null);
    const [loadingSpecialties, setLoadingSpecialties] = useState(false);

    // Get role-based config merged with custom config
    const config = useMemo(() => {
        const userRole = user?.rol || 'jefe_especialidad';
        const roleConfig = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.jefe_especialidad;
        return {
            ...roleConfig,
            ...customConfig,
            title: title || customConfig?.title || roleConfig.title,
            subtitle: subtitle || customConfig?.subtitle || roleConfig.subtitle,
        };
    }, [user?.rol, customConfig, title, subtitle]);

    // Load specialties for jefe
    useEffect(() => {
        const loadSpecialties = async () => {
            if (user?.rol !== 'jefe_especialidad' || !config.showSpecialtySelector) return;
            
            setLoadingSpecialties(true);
            try {
                const specialties = await specialtyService.getMySpecialties();
                setMySpecialties(specialties);
                
                // Load selected from localStorage
                const savedSpecialtyId = localStorage.getItem(SELECTED_SPECIALTY_KEY);
                if (savedSpecialtyId) {
                    const saved = specialties.find(s => s.specialtyId === savedSpecialtyId);
                    if (saved) {
                        setSelectedSpecialty(saved);
                        // Ensure name and year are also saved
                        localStorage.setItem('selectedSpecialtyName', saved.specialtyName);
                        localStorage.setItem('selectedSpecialtyYear', saved.startYear?.toString() || '');
                    } else if (specialties.length > 0) {
                        setSelectedSpecialty(specialties[0]);
                        localStorage.setItem(SELECTED_SPECIALTY_KEY, specialties[0].specialtyId);
                        localStorage.setItem('selectedSpecialtyName', specialties[0].specialtyName);
                        localStorage.setItem('selectedSpecialtyYear', specialties[0].startYear?.toString() || '');
                    }
                } else if (specialties.length > 0) {
                    setSelectedSpecialty(specialties[0]);
                    localStorage.setItem(SELECTED_SPECIALTY_KEY, specialties[0].specialtyId);
                    localStorage.setItem('selectedSpecialtyName', specialties[0].specialtyName);
                    localStorage.setItem('selectedSpecialtyYear', specialties[0].startYear?.toString() || '');
                }
            } catch (error) {
                console.error('Error loading specialties:', error);
            } finally {
                setLoadingSpecialties(false);
            }
        };
        
        loadSpecialties();
    }, [user?.rol, config.showSpecialtySelector]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
            if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
                setIsNavDropdownOpen(false);
            }
            if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(event.target as Node)) {
                setIsSpecialtyDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine if back button should be shown
    const shouldShowBack = showBackButton !== undefined 
        ? showBackButton 
        : !HIDDEN_BACK_PATHS.includes(pathname);

    // Handlers
    const handleProfileClick = () => {
        setIsProfileDropdownOpen(false);
        router.push("/Perfil");
    };

    const handleHomeClick = () => {
        setIsProfileDropdownOpen(false);
        router.push(config.homeRoute);
    };

    const handleLogout = () => {
        setIsProfileDropdownOpen(false);
        logout();
    };

    const handleNavItemClick = (path: string) => {
        setIsNavDropdownOpen(false);
        router.push(path);
    };

    const handleSelectSpecialty = (specialty: JefeEspecialidadData) => {
        setSelectedSpecialty(specialty);
        // Save all specialty data to localStorage for use in other components
        localStorage.setItem(SELECTED_SPECIALTY_KEY, specialty.specialtyId);
        localStorage.setItem('selectedSpecialtyName', specialty.specialtyName);
        localStorage.setItem('selectedSpecialtyYear', specialty.startYear?.toString() || '');
        setIsSpecialtyDropdownOpen(false);
        
        // Dispatch custom event to notify components about specialty change
        window.dispatchEvent(new CustomEvent('specialtyChanged', { 
            detail: { specialtyId: specialty.specialtyId, specialty } 
        }));
    };

    const isJefe = user?.rol === 'jefe_especialidad';
    const showSpecialtySelector = config.showSpecialtySelector && isJefe;

    return (
        <nav className="flex justify-between items-center py-4 px-6 bg-white/10 backdrop-blur-md border-b-2 border-white/20">
            {/* Left side: Back button + Profile info */}
            <div className="flex items-center space-x-3">
                {shouldShowBack && (
                    <button 
                        onClick={() => router.back()}
                        className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-2 text-white text-lg backdrop-blur-sm mr-2"
                        title="Volver atrás"
                    >
                        ⬅️
                    </button>
                )}
                {showProfile && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">👤</span>
                        </div>
                        <div className="text-white">
                            <div className="font-medium">{config.title}</div>
                            <div className="text-xs opacity-80">{config.subtitle}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Center: Navigation items (desktop) */}
            {config.navItems && config.navItems.length > 0 && (
                <div className="hidden lg:flex items-center space-x-1">
                    {config.navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavItemClick(item.path)}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                pathname === item.path || pathname.startsWith(item.path + '/')
                                    ? 'bg-white/30 text-white font-medium'
                                    : 'text-white/80 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Right side: Specialty selector, Nav menu (mobile), Notifications, Profile */}
            <div className="flex items-center space-x-3">
                {/* Specialty selector for Jefes */}
                {showSpecialtySelector && mySpecialties.length > 0 && (
                    <div className="relative" ref={specialtyDropdownRef}>
                        <button
                            onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                            className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-xl px-4 py-2 text-white backdrop-blur-sm flex items-center gap-2"
                            disabled={loadingSpecialties}
                        >
                            <span className="text-lg">🏥</span>
                            <span className="text-sm font-medium max-w-[200px] truncate">
                                {loadingSpecialties ? 'Cargando...' : (
                                    selectedSpecialty 
                                        ? `${selectedSpecialty.specialtyName}${selectedSpecialty.startYear ? ` ${selectedSpecialty.startYear}` : ''}`
                                        : 'Seleccionar'
                                )}
                            </span>
                            <span className={`transition-transform duration-200 ${isSpecialtyDropdownOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        
                        {isSpecialtyDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    Mis Especialidades
                                </div>
                                {mySpecialties.map((spec) => (
                                    <button
                                        key={spec.id}
                                        onClick={() => handleSelectSpecialty(spec)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                                            selectedSpecialty?.specialtyId === spec.specialtyId 
                                                ? 'bg-blue-50 text-blue-700' 
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="text-lg">🏥</span>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{spec.specialtyName}</span>
                                            {spec.startYear && (
                                                <span className="text-xs text-gray-500">Inicio: {spec.startYear}</span>
                                            )}
                                        </div>
                                        {selectedSpecialty?.specialtyId === spec.specialtyId && (
                                            <span className="ml-auto text-blue-600">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {showSpecialtySelector && mySpecialties.length === 0 && !loadingSpecialties && (
                    <div className="bg-yellow-500/20 rounded-xl px-4 py-2 text-white text-sm">
                        ⚠️ Sin especialidades asignadas
                    </div>
                )}

                {/* Mobile nav menu */}
                {config.navItems && config.navItems.length > 0 && (
                    <div className="relative lg:hidden" ref={navDropdownRef}>
                        <button
                            onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                            className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-2 text-white text-lg backdrop-blur-sm"
                        >
                            ☰
                        </button>
                        
                        {isNavDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    Navegación
                                </div>
                                {config.navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleNavItemClick(item.path)}
                                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                                            pathname === item.path || pathname.startsWith(item.path + '/')
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                    <button 
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="bg-white/20 hover:bg-white/30 transition-all duration-300 rounded-full p-2 text-white text-lg backdrop-blur-sm"
                    >
                        👤
                    </button>
                    
                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-800 truncate">{user?.nombre || 'Usuario'}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.rol?.replace('_', ' ')}</p>
                            </div>
                            <button
                                onClick={handleHomeClick}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                            >
                                <span>🏠</span>
                                <span>Página de inicio</span>
                            </button>
                            <button
                                onClick={handleProfileClick}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                            >
                                <span>👤</span>
                                <span>Mi Perfil</span>
                            </button>
                            <hr className="my-2 border-gray-200" />
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <span>🚪</span>
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

// Export config for external use
export { ROLE_CONFIGS, SELECTED_SPECIALTY_KEY };
