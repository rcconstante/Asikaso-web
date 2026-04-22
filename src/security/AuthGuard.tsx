// Mock Authentication Guard (Frontend only for now)
import React, { useState, useEffect } from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check delay
    const timer = setTimeout(() => {
      // Set to true to bypass login for frontend development
      setIsAuthenticated(true);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div>Loading app...</div>;
  if (!isAuthenticated) return <div>Please login.</div>;

  return <>{children}</>;
};
