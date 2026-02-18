import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isPuterAvailable } from '../utils/puterApi';

const AuthManager = ({ onAuthChange }) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);

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
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [onAuthChange]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleSignIn = async () => {
    if (!isPuterAvailable()) return;
    try {
      await window.puter.auth.signIn();
      checkAuthStatus();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    if (!isPuterAvailable()) return;
    try {
      await window.puter.auth.signOut();
      setIsAuthenticated(false);
      setUserData(null);
      setIsAuthDropdownOpen(false);
      if (onAuthChange) onAuthChange(false, null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleAuthDropdown = () => {
    setIsAuthDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isAuthDropdownOpen) return;
      if (
        !event.target.closest('.auth-button') &&
        !event.target.closest('.auth-dropdown')
      ) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [isAuthDropdownOpen]);

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <button className="auth-button auth-button--signin" onClick={handleSignIn}>
          {t('auth.signIn')}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <button className="auth-button" onClick={toggleAuthDropdown}>
        <span className="auth-button__avatar">
          {(userData?.username?.[0] || 'U').toUpperCase()}
        </span>
        <span className="auth-button__name">{userData?.username || 'Account'}</span>
        <span className={`auth-button__chevron ${isAuthDropdownOpen ? 'auth-button__chevron--open' : ''}`}>▼</span>
      </button>

      {isAuthDropdownOpen && (
        <div className="auth-dropdown">
          {userData?.email && (
            <div className="auth-dropdown__email">{userData.email}</div>
          )}
          <button className="auth-dropdown__signout" onClick={handleSignOut}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthManager;
