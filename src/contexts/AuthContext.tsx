
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient, LoginCredentials } from '@/services/api';

interface Teacher {
  id: string;
  username: string;
  name: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { username, password };
      const response = await apiClient.login(credentials);
      
      // Store teacher info
      const teacherData: Teacher = {
        id: response.teacher?.id || '1',
        username: response.teacher?.username || username,
        name: response.teacher?.name || username
      };
      
      setTeacher(teacherData);
      localStorage.setItem('teacher', JSON.stringify(teacherData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTeacher(null);
    apiClient.clearToken();
    localStorage.removeItem('teacher');
  };

  // Check for stored auth on mount
  React.useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    const storedToken = localStorage.getItem('access_token');
    
    if (storedTeacher && storedToken) {
      setTeacher(JSON.parse(storedTeacher));
      apiClient.setToken(storedToken);
    }
  }, []);

  const value = {
    teacher,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
