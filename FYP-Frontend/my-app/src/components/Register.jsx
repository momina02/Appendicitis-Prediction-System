import './Auth.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase'; // Import Firebase auth
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const Register = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.email || !credentials.password) {
      setError('All fields are required');
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Register user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: credentials.username });

      // Log in user
      login({ username: credentials.username, email: user.email, uid: user.uid });

      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.message); // Display Firebase error messages
    }
  };

  // return (
  //   <div className="register-container">
  //     <form onSubmit={handleSubmit} className="register-form">
  //       <h2>Create Account</h2>
  //       {error && <div className="error-message">{error}</div>}

  //       <input
  //         type="text"
  //         placeholder="Username"
  //         value={credentials.username}
  //         onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
  //       />

  //       <input
  //         type="email"
  //         placeholder="Email"
  //         value={credentials.email}
  //         onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
  //       />

  //       <input
  //         type="password"
  //         placeholder="Password"
  //         value={credentials.password}
  //         onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
  //       />

  //       <input
  //         type="password"
  //         placeholder="Confirm Password"
  //         value={credentials.confirmPassword}
  //         onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
  //       />

  //       <button type="submit">Register</button>

  //       <div className="auth-links">
  //         Already have an account? <Link to="/login">Login here</Link>
  //       </div>
  //     </form>
  //   </div>
  // );




  return (
    <div className="auth-wrapper">
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={credentials.confirmPassword}
            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
          />
          <button type="submit">Register</button>
          <div className="auth-links">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
  


};

export default Register;
