import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isOnboarded?: boolean;
}

interface Session {
  user: User;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
  club?: string;
  professional_society?: string;
  department_id?: string;
  club_id?: string;
  professional_society_id?: string;
  phone_number?: string;
  email?: string;
  department_name?: string;
  club_name?: string;
  society_name?: string;
  is_onboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthSession: (token: string, user: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await api.auth.me();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setSession({ user: userData });
          await fetchProfile(userData.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuthSession = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setSession({ user });
    fetchProfile(user.id);
  };

  const login = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.auth.login(email, password);
      setAuthSession(token, userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { token, user: userData } = await api.auth.signup({ email, password });
      setAuthSession(token, userData);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        login,
        signup,
        signOut,
        setAuthSession,
        refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};