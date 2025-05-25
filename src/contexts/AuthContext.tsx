
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
      // TODO: Replace with actual API call to your FastAPI backend
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      
      // Mock authentication for demo
      if (username === 'teacher' && password === 'password123') {
        const mockTeacher: Teacher = {
          id: '1',
          username: 'teacher',
          name: 'Ms. Johnson'
        };
        setTeacher(mockTeacher);
        localStorage.setItem('teacher', JSON.stringify(mockTeacher));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('teacher');
  };

  // Check for stored auth on mount
  React.useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
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
