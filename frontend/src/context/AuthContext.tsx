import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types/auth';

interface AuthContextValue {
  role: UserRole;
  user: UserProfile;
  isAdmin: boolean;
  isUser: boolean;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const ADMIN_PROFILE: UserProfile = {
  email: 'admin@railblock.gov.in',
  name: 'Divisional Operations Controller',
  role: 'ADMIN',
  designation: 'Sr. Divisional Operations Manager (Sr. DOM)',
  division: 'Mumbai Central / CSMT Division'
};

const USER_PROFILE: UserProfile = {
  email: 'passenger@railblock.gov.in',
  name: 'Public Passenger / Station Staff',
  role: 'USER',
  designation: 'Passenger & Station Information Viewer',
  division: 'Mumbai Suburban Network'
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('railblock_user_role');
    return (saved as UserRole) || 'ADMIN';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('railblock_user_role');
    return savedRole === 'USER' ? USER_PROFILE : ADMIN_PROFILE;
  });

  const login = (newRole: UserRole, email?: string) => {
    localStorage.setItem('railblock_user_role', newRole);
    setRole(newRole);
    if (newRole === 'ADMIN') {
      setUser({ ...ADMIN_PROFILE, email: email || ADMIN_PROFILE.email });
    } else {
      setUser({ ...USER_PROFILE, email: email || USER_PROFILE.email });
    }
  };

  const logout = () => {
    // Switch to public viewer on logout
    login('USER');
  };

  const switchRole = (newRole: UserRole) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isAdmin: role === 'ADMIN',
        isUser: role === 'USER',
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
