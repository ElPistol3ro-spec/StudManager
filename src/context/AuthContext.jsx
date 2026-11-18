import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sis_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const persistSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('sis_active_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('sis_active_user');
    }
  };

  const loginWithEmail = async (email, password) => {
    const users = await api.getAll('users');
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('Invalid institutional email or password.');
    }
    const { password: _, ...safeUser } = found;
    persistSession(safeUser);
    return safeUser;
  };
  const loginWithSocial = async (provider, profile = {}) => {
    const email = profile.email || `${provider.toLowerCase()}.user@inst.edu`;
    const name = profile.name || `${provider} Scholar`;

    const users = await api.getAll('users');
    let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      existing = await api.create('users', {
        name,
        email,
        role: 'student',
        provider: provider.toLowerCase(),
      });
    }

    const { password: _, ...safeUser } = existing;
    persistSession(safeUser);
    return safeUser;
  };

  const logout = () => persistSession(null);
  return (
    <AuthContext.Provider value={{ user, loginWithEmail, loginWithSocial, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

