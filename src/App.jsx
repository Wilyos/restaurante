

import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import Mesero from './views/Mesero';
import Cocina from './views/Cocina';
import Caja from './views/Caja';
import Home from './views/Home';
import Login from './views/Login';
import Barra from './views/Barra';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css';
import AdminMenu from './views/AdminMenu';
import AdminUsers from './views/AdminUsers';
import SistemaPuntos from './views/SistemaPuntos';
import ConfiguracionNFC from './views/ConfiguracionNFC';




function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mesero" element={
          <ProtectedRoute allowed={["mesero"]}>
            <Mesero />
          </ProtectedRoute>
        } />
        <Route path="/cocina" element={
          <ProtectedRoute allowed={["cocina"]}>
            <Cocina />
          </ProtectedRoute>
        } />
        <Route path="/barra" element={
          <ProtectedRoute allowed={["barra"]}>
            <Barra />
          </ProtectedRoute>
        } />
        <Route path="/caja" element={
          <ProtectedRoute allowed={["caja"]}>
            <Caja />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute allowed={["admin"]}>
            <AdminMenu />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowed={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/puntos" element={
          <ProtectedRoute allowed={["admin", "caja"]}>
            <SistemaPuntos />
          </ProtectedRoute>
        } />
        <Route path="/admin/config-nfc" element={
          <ProtectedRoute allowed={["admin"]}>
            <ConfiguracionNFC />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
