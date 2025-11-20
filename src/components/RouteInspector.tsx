import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { httpService } from "../services/httpService";
import LoadingSpinner from "./LoadingSpinner";

// Define which routes are public (don't require authentication)
const PUBLIC_ROUTES = ["/auth", "/agent/:agentId", "/netzwerkgold-agent"];

const RouteInspector: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedRoute, setHasCheckedRoute] = useState(false);

  // Helper function to check if current path is a public route
  const isPublicRoute = (pathname: string): boolean => {
    return PUBLIC_ROUTES.some((route) => {
      // Handle exact matches
      if (route === pathname) return true;

      // Handle dynamic routes (e.g., /agent/:agentId)
      if (route.includes(":")) {
        const routePattern = route.replace(/:[^/]+/g, "[^/]+");
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(pathname);
      }

      return false;
    });
  };

  useEffect(() => {
    // Don't check routes while auth is loading
    if (isLoading) return;

    const currentPath = location.pathname;
    const isPublic = isPublicRoute(currentPath);
    const token = httpService.getAccessToken();

    // If route is public, allow access
    if (isPublic) {
      setHasCheckedRoute(true);
      return;
    }

    // If no token and trying to access protected route, redirect to auth
    if (!token || !isAuthenticated) {
      if (currentPath !== "/auth") {
        // Save the intended destination to redirect after login
        sessionStorage.setItem("redirectAfterLogin", currentPath);
        navigate("/auth", { replace: true });
      }
      setHasCheckedRoute(true);
      return;
    }

    // User is authenticated and accessing protected route - allow access
    setHasCheckedRoute(true);
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Show loading while checking authentication
  if (isLoading || !hasCheckedRoute) {
    return <LoadingSpinner message="Authenticating..." fullScreen />;
  }

  return <Outlet />;
};

export default RouteInspector;
