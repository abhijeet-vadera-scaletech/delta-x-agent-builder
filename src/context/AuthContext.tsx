import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { httpService } from "../services/httpService";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../types";

interface ConsultantProfile extends User {
  name: string;
  company?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
}

interface AuthContextType {
  currentUser: ConsultantProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCurrentUser: (user: ConsultantProfile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ConsultantProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        // Check if we have a token
        const token = httpService.getAccessToken();

        if (token) {
          // Try to get user data from httpService (encrypted storage)
          const userData = httpService.getUserData();

          if (userData) {
            // Map User to ConsultantProfile
            const profile: ConsultantProfile = {
              ...userData,
              name: `${userData.firstName} ${userData.lastName}`,
              socialLinks: {},
            };
            setCurrentUser(profile);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // Clear invalid data
        httpService.clearAllData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    // Clear all data
    httpService.clearAllData();
    queryClient.clear();
    setCurrentUser(null);
    navigate("/auth");
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser && !!httpService.getAccessToken(),
    isLoading,
    setCurrentUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
