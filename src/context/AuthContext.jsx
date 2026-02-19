import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_AUTH_STATE } from '../data/initialState';

const AuthContext = createContext(null);

// ============================================================
// Hardcoded credentials for demo
// ============================================================
const DEMO_CREDENTIALS = {
    'user@grid.com': { password: 'password123', role: 'user' },
    'admin@grid.com': { password: 'admin123', role: 'admin' },
};

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(INITIAL_AUTH_STATE);

    const login = useCallback((email, password) => {
        const cred = DEMO_CREDENTIALS[email];
        if (!cred || cred.password !== password) {
            return { success: false, error: 'Invalid email or password' };
        }
        setAuth({ role: cred.role, email, isAuthenticated: true });
        return { success: true, role: cred.role };
    }, []);

    const logout = useCallback(() => {
        setAuth(INITIAL_AUTH_STATE);
    }, []);

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
