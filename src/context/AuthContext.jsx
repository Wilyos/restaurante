import { createContext, useContext, useEffect, useState } from 'react';
import { authenticateUser } from '../api/mockUsers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('resto.user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mantener compatibilidad con el rol para componentes existentes
  const rol = user?.role || null;

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('resto.user', JSON.stringify(user));
        // Mantener compatibilidad con el sistema anterior
        localStorage.setItem('resto.rol', user.role);
      } else {
        localStorage.removeItem('resto.user');
        localStorage.removeItem('resto.rol');
      }
    } catch {
      // noop
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    
    try {
      const authenticatedUser = await authenticateUser(username, password);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
  };

  // Función legacy para compatibilidad
  const setRol = (newRol) => {
    if (!newRol) {
      logout();
    } else {
      // Crear usuario temporal para compatibilidad
      setUser({
        id: 0,
        username: 'legacy',
        name: 'Usuario Temporal',
        role: newRol
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      rol, // Compatibilidad
      login,
      logout,
      setRol, // Compatibilidad
      loading,
      error,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
