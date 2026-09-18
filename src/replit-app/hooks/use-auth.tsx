import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  role: 'madre' | 'hija';
  edad: number;
  partnerId?: string | null;
  connectionCode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const normalizeUser = (userData: User & { firstName?: string; lastName?: string }): User => ({
    ...userData,
    nombre: userData.nombre || userData.firstName || "",
    apellido: userData.apellido || userData.lastName,
  });

  const login = (userData: User, token: string) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('userToken', token);
    localStorage.setItem('currentUser', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setLocation('/login');
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('userToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (!token || !userStr) {
      setIsLoading(false);
      return false;
    }

    try {
      // Verify token is still valid
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(normalized));
        setUser(normalized);
        setIsLoading(false);
        return true;
      } else {
        // Token is invalid
        logout();
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, use cached user data but don't redirect
      try {
        const cachedUser = normalizeUser(JSON.parse(userStr));
        setUser(cachedUser);
        setIsLoading(false);
        return true;
      } catch {
        logout();
        setIsLoading(false);
        return false;
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}