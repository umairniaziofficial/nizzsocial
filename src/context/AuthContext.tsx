import { getCurrentUser } from "@/lib/appwrite/api";
import { IContextType, IUser } from "@/types";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const INITIAL_USER: IUser = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE: IContextType = {
  user: INITIAL_USER,
  isAuthenticated: false,
  isLoading: true, // Initialize as true
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initialize as true
  const navigate = useNavigate();

  const checkAuthUser = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();
      if (currentAccount) {
        setUser({
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking auth user:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (cookieFallback === "[]") {
      navigate("/sign-in");
    } else {
      checkAuthUser();
    }
  }, [checkAuthUser, navigate]);

  const value: IContextType = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUserContext = (): IContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within an AuthProvider");
  }
  return context;
};
