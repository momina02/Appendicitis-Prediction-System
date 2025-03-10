import './Auth.css';

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user tried to visit or default to home page
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (credentials.email && credentials.password) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );
        const user = userCredential.user;

        // Login successful, store user in context
        login({ username: user.displayName, email: user.email, uid: user.uid });

        // Navigate to the page they tried to visit
        navigate(from, { replace: true });
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

//   return (
//     <div className="login-container">
//       <form onSubmit={handleSubmit} className="login-form">
//         <h2>Login</h2>
//         {error && <div className="error-message">{error}</div>}
//         <input
//           type="email"
//           placeholder="Email"
//           value={credentials.email}
//           onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={credentials.password}
//           onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//         />
//         <button type="submit">Login</button>
//         <div className="auth-links">
//           Don't have an account? <Link to="/register">Register here</Link>
//         </div>
//       </form>
//     </div>
//   );


    return (
    <div className="auth-wrapper">
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button type="submit">Login</button>
          <div className="auth-links">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </form>
      </div>
    </div>
    );






};

export default Login;
