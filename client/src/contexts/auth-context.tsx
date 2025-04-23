import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Login Failed',
          description: errorData.message || 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.fullName}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (
    username: string,
    password: string,
    email: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, fullName }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Registration Failed',
          description: errorData.message || 'Could not register user',
          variant: 'destructive',
        });
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: 'Registration Successful',
        description: `Welcome to CineTicket, ${userData.fullName}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
