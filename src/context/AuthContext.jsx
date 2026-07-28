import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Session duration: 1 hour (3,600,000 ms)
const SESSION_DURATION_MS = 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuthStorage = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminData');
    localStorage.removeItem('token');
  };

  const getValidSession = () => {
    const storedToken = sessionStorage.getItem('adminToken');
    const storedAdmin = sessionStorage.getItem('adminUser');
    const loginTime = sessionStorage.getItem('adminLoginTime');

    if (storedToken && storedAdmin && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime, 10);
      if (timeElapsed < SESSION_DURATION_MS) {
        try {
          return { token: storedToken, admin: JSON.parse(storedAdmin) };
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const session = getValidSession();
    if (session) {
      setToken(session.token);
      setAdmin(session.admin);
    } else {
      clearAuthStorage();
      setToken(null);
      setAdmin(null);
    }
    setLoading(false);
  }, []);

  const login = (tokenData, userData) => {
    const now = Date.now().toString();
    setToken(tokenData);
    setAdmin(userData);

    sessionStorage.setItem('adminToken', tokenData);
    sessionStorage.setItem('adminUser', JSON.stringify(userData));
    sessionStorage.setItem('adminLoginTime', now);

    // Clear legacy persistent localStorage to prevent bypass via old tokens
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminData');
    localStorage.removeItem('token');
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    clearAuthStorage();
  };

  const updateAdminData = (newUserData) => {
    setAdmin(newUserData);
    sessionStorage.setItem('adminUser', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, updateAdminData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};