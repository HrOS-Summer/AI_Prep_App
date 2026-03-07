import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type UserRole = "student" | "admin";

export interface User {
  employee_id: string;
  username: string;
  email: string;
  role: UserRole;
  domain?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (employee_id: string, password: string, role: UserRole) => Promise<void>;
  signup: (username: string, email: string, password: string, employee_id: string) => Promise<void>;
  logout: () => void;
  selectDomain: (domain_name: string, domain_id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem("ai_interview_user");
        // Ensure we don't parse "null" strings as objects
        if (stored && stored !== "undefined" && stored !== "null") {
          const parsedUser = JSON.parse(stored);
          if (parsedUser && parsedUser.employee_id) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Local storage parse error:", error);
        localStorage.removeItem("ai_interview_user");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (employee_id: string, password: string, role: UserRole) => {
    try {
      const response = await fetch("https://prepzen-api.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Login failed");

      const { access_token, user: loggedInUser } = data;
      if (loggedInUser && access_token) {
        setUser(loggedInUser);
        localStorage.setItem("ai_interview_user", JSON.stringify(loggedInUser));
        localStorage.setItem("access_token", access_token);
      }
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string, employee_id: string) => {
    try {
      const now = new Date().toISOString();
      const response = await fetch("https://prepzen-api.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, email, password, employee_id,
          role: "student", createdAt: now, updatedAt: now 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Signup failed");

      const { access_token, user: newUser } = data;
      if (newUser && access_token) {
        setUser(newUser); 
        localStorage.setItem("ai_interview_user", JSON.stringify(newUser));
        localStorage.setItem("access_token", access_token);
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    queryClient.clear();
    localStorage.removeItem("ai_interview_user");
    localStorage.removeItem("access_token");
  }, [queryClient]);

  const selectDomain = useCallback(async (domain_name: string, domain_id: string) => {
    // MODIFICATION: Always check storage as a fallback for the most current data
    const currentUser = user || JSON.parse(localStorage.getItem("ai_interview_user") || "null");

    if (!currentUser?.employee_id) {
      throw new Error("Selection failed: User context is missing");
    }

    try {
      const token = localStorage.getItem("access_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`https://prepzen-api.onrender.com/domain/update-user-domain`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ 
          employee_id: currentUser.employee_id, 
          domain_id: domain_id 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update domain");
      }

      const updatedUser = { ...currentUser, domain: domain_name };
      setUser(updatedUser);
      localStorage.setItem("ai_interview_user", JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      
    } catch (error) {
      console.error("Domain selection error:", error);
      throw error;
    }
  }, [user, queryClient]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user && !!user.employee_id, // Stronger check
        loading, 
        login, 
        signup, 
        logout, 
        selectDomain 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};