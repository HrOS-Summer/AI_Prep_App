import React, { createContext, useContext, useState, useCallback } from "react";

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
  login: (employee_id: string, password: string, role: UserRole) => Promise<void>;
  signup: (username: string, email: string, password: string, employee_id: string) => Promise<void>;
  logout: () => void;
  // UPDATE THIS LINE:
  selectDomain: (domain_name: string, domain_id: string) => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe initialization to prevent "undefined" is not valid JSON error
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("ai_interview_user");
      if (!stored || stored === "undefined" || stored === "null") {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Local storage parse error:", error);
      localStorage.removeItem("ai_interview_user");
      return null;
    }
  });

  const login = useCallback(async (employee_id: string, password: string, role: UserRole) => {
  try {
    const response = await fetch("https://prepzen-api.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handles FastAPI's default { "detail": "..." } error format
      throw new Error(data.detail || data.message || "Login failed");
    }

    const { access_token, user: loggedInUser } = data;

    if (loggedInUser && access_token) {
      setUser(loggedInUser);
      // Persist the full user object (including domain and role)
      localStorage.setItem("ai_interview_user", JSON.stringify(loggedInUser));
      // Persist the JWT for subsequent API calls
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

    // If you see a 500 error, this block will now capture the 'detail' if CORS is fixed
    if (!response.ok) {
      throw new Error(data.detail || data.message || "Signup failed");
    }

    // Success! Handling the new response structure
    const { access_token, user: newUser } = data;

    if (newUser && access_token) {
      setUser(newUser); 
      localStorage.setItem("ai_interview_user", JSON.stringify(newUser));
      localStorage.setItem("access_token", access_token);
      console.log("Signup success: Token and User saved.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}, []);

      const logout = useCallback(() => {
      setUser(null);
      localStorage.removeItem("ai_interview_user");
      localStorage.removeItem("access_token");
    }, []);


  const selectDomain = useCallback(async (domain_name: string, domain_id: string) => {
  let currentUser = user || JSON.parse(localStorage.getItem("ai_interview_user") || "null");

  if (!currentUser?.employee_id) {
    console.error("Selection failed: employee_id is missing from state and storage");
    return;
  }

  try {
    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = { "Content-Type": "application/json" };
    
    // Only add Authorization if the token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

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
      console.error("Backend Error:", errorData);
      throw new Error(errorData.detail || "Failed to update domain");
    }

    const updatedUser = { ...currentUser, domain: domain_name };
    setUser(updatedUser);
    localStorage.setItem("ai_interview_user", JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Domain selection error:", error);
    throw error;
  }
}, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, selectDomain }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};