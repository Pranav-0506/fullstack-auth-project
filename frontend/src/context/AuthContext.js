import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Initialize auth safely from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!storedToken || !storedUser) {
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        // Safe JSON parse (prevents crash)
        let parsedUser = null;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (err) {
          console.log("Invalid stored user JSON, clearing storage");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        setToken(storedToken);
        setUser(parsedUser);
      } catch (err) {
        console.log("Auth init error:", err);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Login function
  const login = (userData, tokenData) => {
    if (!userData || !tokenData) {
      console.log("Invalid login data");
      return;
    }

    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  // ❌ Logout function
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token, // 🔥 useful shortcut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔥 Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};