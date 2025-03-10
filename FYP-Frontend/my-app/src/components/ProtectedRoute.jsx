// // import React from 'react';
// // import { Navigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // const ProtectedRoute = ({ children }) => {
// //   const { user } = useAuth();
// //   const location = useLocation();

// //   if (!user) {
// //     // Redirect to login while saving the attempted location
// //     return <Navigate to="/login" state={{ from: location }} replace />;
// //   }

// //   return children;
// // };

// // export default ProtectedRoute;


// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   const location = useLocation();

//   // If the user is not authenticated and not already on the login page, redirect.
//   if (!user && location.pathname !== "/login") {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;



import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Allow access to login and register pages if user is not authenticated
  if (!user && location.pathname !== "/login" && location.pathname !== "/register") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
