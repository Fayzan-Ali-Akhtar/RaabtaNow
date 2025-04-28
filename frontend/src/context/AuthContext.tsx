import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { VITE_BACKEND_URL } from "../constant";

interface User extends JwtPayload {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthToken: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getAuthToken = (): string => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");
    return token;
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          // const decodedUser = jwtDecode<User>(token);
          setUser(JSON.parse(token));
          console.log(JSON.parse(token));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log("Hellooooo");
    setIsLoading(true);
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/api/login`, { email, password });

      localStorage.setItem("authToken", JSON.stringify(response?.data?.user));
      setUser(response?.data?.user?.id); // ✅ Directly using decoded token
    } catch (error) {
      console.error("Login error:", error);
      throw error instanceof Error ? error : new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
