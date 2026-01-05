"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // On mount, read from localStorage
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('famed-theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    // Apply theme changes
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        let effectiveTheme: 'light' | 'dark';

        if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            effectiveTheme = theme;
        }

        setResolvedTheme(effectiveTheme);

        // Apply class to html element
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        // Save to localStorage
        localStorage.setItem('famed-theme', theme);
    }, [theme, mounted]);

    // Listen for system preference changes
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
                const root = document.documentElement;
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                    root.style.colorScheme = 'dark';
                } else {
                    root.classList.remove('dark');
                    root.style.colorScheme = 'light';
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'light';
            // If system, toggle based on current resolved theme
            return resolvedTheme === 'light' ? 'dark' : 'light';
        });
    };

    // Avoid hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
