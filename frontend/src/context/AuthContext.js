// frontend/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // On app load: if a token exists, fetch the user's data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            API.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Login: call backend, save token, store user in state
    const login = async (email, password) => {
        const { data } = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data.user;
    };

    // Logout: clear token and user
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);