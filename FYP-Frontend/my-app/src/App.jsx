import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import LogoutButton from "./components/LogoutButton";
import Home from "./pages/Home";
import Ultrasound from "./pages/Ultrasound";
import Report from "./pages/Report";
import Quick from "./pages/Quick";
import Stats from "./pages/Stats";
import Chatbot from "./pages/Chatbot";
import Doctor from "./pages/Doctor";
import "./App.css";


const App = () => {

  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };
  
  return (
    <AuthProvider>
      <div className="app-container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">Appendicitis Prediction</div>
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
               <Link to="/stats" className="nav-link">
                 Stats
               </Link>
            </li>
            <li>
               <Link to="/ultrasound" className="nav-link">
                 Ultrasound
               </Link>
             </li>
             <li>
               <Link to="/quick" className="nav-link">
                 Quick
               </Link>
             </li>
             <li>
               <Link to="/doctor" className="nav-link">
                 Doctor
               </Link>
             </li>
             
           </ul>
           <LogoutButton />
           
          
         </nav>

         <button
              onClick={toggleDarkMode}
              className="dark-mode-toggle"
              style={{ color: darkMode ? "white" : "black" }}
            >
            {darkMode ? "☀︎" : "☀︎"}
          </button>


         <main className="main-content">
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/" element={<Home />} /> 
            <Route
              path="/ultrasound"
              element={
                <ProtectedRoute>
                  <Ultrasound />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quick"
              element={
                <ProtectedRoute>
                  <Quick />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute>
                  <Doctor />
                </ProtectedRoute>
              }
            />
            <Route path="/stats" element={<Stats />} /> 

            </Routes>
        
          </main>

        <Chatbot />


      </div>
    </AuthProvider>
  );
};

export default App;
