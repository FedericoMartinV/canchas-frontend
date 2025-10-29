import React, { useState } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminPanel from './components/admin/AdminPanel';
import UserPanel from './components/user/UserPanel';
import Notification from './components/shared/Notification';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [notificaciones, setNotificaciones] = useState([]);

  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const logout = () => {
    setUser(null);
    setView('login');
    agregarNotificacion('Sesión cerrada correctamente', 'success');
  };

  return (
    <div className="min-h-screen soccer-ball-bg bg-futbol-pattern">
      <Notification notificaciones={notificaciones} />
      
      {!user ? (
        view === 'login' ? (
          <Login 
            setUser={setUser} 
            setView={setView} 
            agregarNotificacion={agregarNotificacion} 
          />
        ) : (
          <Register 
            setView={setView} 
            agregarNotificacion={agregarNotificacion} 
          />
        )
      ) : user.rol === 'ADMIN' ? (
        <AdminPanel 
          user={user} 
          logout={logout} 
          agregarNotificacion={agregarNotificacion} 
        />
      ) : (
        <UserPanel 
          user={user} 
          logout={logout} 
          agregarNotificacion={agregarNotificacion} 
        />
      )}
    </div>
  );
}

export default App;