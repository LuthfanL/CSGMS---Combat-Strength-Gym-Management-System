import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error fetching user", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error", error);
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const register = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('auth_token', data.token);
        return { success: true, role: data.user.role };
      } else {
        // Collect validation errors from Laravel if any
        let errorMsg = data.message;
        if (data.errors) {
          const firstError = Object.values(data.errors)[0][0];
          errorMsg = firstError;
        }
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error("Register error", error);
      return { success: false, message: 'Terjadi kesalahan koneksi' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
