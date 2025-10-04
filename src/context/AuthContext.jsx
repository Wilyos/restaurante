import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [rol, setRol] = useState(() => {
    try {
      return localStorage.getItem('resto.rol') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (rol) localStorage.setItem('resto.rol', rol);
      else localStorage.removeItem('resto.rol');
    } catch {
      // noop
    }
  }, [rol]);
  return (
    <AuthContext.Provider value={{ rol, setRol }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
