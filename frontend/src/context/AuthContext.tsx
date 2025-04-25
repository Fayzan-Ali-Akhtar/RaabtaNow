import React, { 
    createContext, 
    useState, 
    useEffect, 
    ReactNode, 
    useContext 
  } from "react";
  import axios from "axios";
  import { jwtDecode, JwtPayload } from "jwt-decode";
  import { BASE_URL } from "../../constants";
  
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
  
  export const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
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
      const initializeAuth = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (token) {
            const decoded = jwtDecode<User>(token);
            setUser(decoded);
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          localStorage.removeItem("authToken");
        } finally {
          setIsLoading(false);
        }
      };
  
      initializeAuth();
    }, []);
  
    const login = async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await axios.post<{ 
          token: string; 
          user: Omit<User, 'iat' | 'exp'> 
        }>(`${BASE_URL}/user/login`, { email, password });
  
        const { token, user: userData } = response.data;
        
        const decodedUser = jwtDecode<User>(token);
        const authenticatedUser: User = {
          ...decodedUser,
          id: userData.id,
          name: userData.name,
          email: userData.email
        };
  
        localStorage.setItem("authToken", token);
        setUser(authenticatedUser);
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