import { createContext, useContext, useEffect, useState } from 'react';
import { authenticateUser } from '../utils/dataManager';
import { useInactivityWithWarning } from '../hooks/useInactivityTimer';
import InactivityWarningDialog from '../components/InactivityWarningDialog';

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
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  
  // Configuración de timeout (30 minutos por defecto)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
  const WARNING_TIME = 5 * 60 * 1000; // Advertir 5 minutos antes

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
      console.log('🔐 Usuario autenticado:', authenticatedUser);
      
      setUser(authenticatedUser);
      
      // Setear el rol desde los datos del usuario
      if (authenticatedUser && authenticatedUser.user) {
        setRol(authenticatedUser.user.role || 'mesero');
        console.log('👤 Rol establecido:', authenticatedUser.user.role);
      } else if (authenticatedUser && authenticatedUser.role) {
        setRol(authenticatedUser.role || 'mesero');
        console.log('👤 Rol establecido:', authenticatedUser.role);
      }
      
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
    setRol(''); // Reset rol
    setError('');
    setShowInactivityWarning(false);
    console.log('👋 Logout completado, rol reseteado');
  };

  // Manejar timeout por inactividad
  const handleInactivityTimeout = () => {
    console.log('Sesión cerrada por inactividad');
    logout();
  };

  // Manejar advertencia de inactividad
  const handleInactivityWarning = () => {
    if (user) {
      setShowInactivityWarning(true);
    }
  };

  // Extender sesión
  const extendSession = () => {
    setShowInactivityWarning(false);
    resetTimer();
  };

  // Hook de timer de inactividad (solo si hay usuario)
  const { resetTimer, getRemainingTime } = useInactivityWithWarning(
    handleInactivityTimeout,
    handleInactivityWarning,
    SESSION_TIMEOUT,
    WARNING_TIME
  );

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
      isAuthenticated: !!user,
      extendSession,
      getRemainingTime
    }}>
      {children}
      
      {/* Diálogo de advertencia de inactividad */}
      <InactivityWarningDialog
        open={showInactivityWarning}
        onExtend={extendSession}
        onLogout={logout}
        remainingTime={getRemainingTime()}
        warningTime={WARNING_TIME}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
