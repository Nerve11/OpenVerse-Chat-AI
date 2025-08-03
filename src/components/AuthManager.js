import React, { useState, useEffect, useCallback } from 'react';
import { isPuterAvailable } from '../utils/puterApi';

const AuthManager = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);

  // Check the current auth status
  const checkAuthStatus = useCallback(async () => {
    if (!isPuterAvailable()) return;
    
    try {
      const isSignedIn = await window.puter.auth.isSignedIn();
      setIsAuthenticated(isSignedIn);
      
      if (isSignedIn) {
        const user = await window.puter.auth.getUser();
        setUserData(user);
        if (onAuthChange) onAuthChange(true, user);
      } else {
        setUserData(null);
        if (onAuthChange) onAuthChange(false, null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [onAuthChange]);

  // Check if user is signed in on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Handle sign in
  const handleSignIn = async () => {
    if (!isPuterAvailable()) {
      console.error("Puter.js not available");
      return;
    }
    
    try {
      await window.puter.auth.signIn();
      checkAuthStatus();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (!isPuterAvailable()) return;
    
    try {
      await window.puter.auth.signOut();
      setIsAuthenticated(false);
      setUserData(null);
      if (onAuthChange) onAuthChange(false, null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Toggle the auth dropdown
  const toggleAuthDropdown = () => {
    setIsAuthDropdownOpen(!isAuthDropdownOpen);
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAuthDropdownOpen) {
        const isClickOnAuthButton = event.target.closest('.auth-button');
        const isClickOnDropdown = event.target.closest('.auth-dropdown');
        
        if (!isClickOnAuthButton && !isClickOnDropdown) {
          setIsAuthDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isAuthDropdownOpen]);

  return (
    <div className="auth-container">
      {isAuthenticated ? (
        <>
          <button className="auth-button" onClick={toggleAuthDropdown}>
            {userData?.username || 'Account'} ▼
          </button>
          {isAuthDropdownOpen && (
            <div className="auth-dropdown">
              <div className="user-info">
                <div className="username">{userData?.username}</div>
                <div className="email">{userData?.email}</div>
              </div>
              <button className="auth-action-button signout-button" onClick={handleSignOut}>
                Выйти из аккаунта
              </button>
            </div>
          )}
        </>
      ) : (
        <button className="auth-button signin-button" onClick={handleSignIn}>
          Войти в аккаунт
        </button>
      )}
    </div>
  );
};

export default AuthManager; 