import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Wait for Auth check to finish
  }

  // If user exists, show the child page (Outlet). If not, go to Login.
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;