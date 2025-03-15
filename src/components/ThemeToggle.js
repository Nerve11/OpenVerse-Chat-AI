import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ToggleContainer = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  color: ${props => props.theme.text};
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }
`;

const IconContainer = styled(motion.div)`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SunIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.7479 21.1181 10.0794 20.7461C8.41093 20.3741 6.88437 19.5345 5.67516 18.3254C4.46594 17.1162 3.62636 15.5896 3.25438 13.9211C2.8824 12.2526 2.99323 10.5126 3.57399 8.9048C4.15475 7.29699 5.18142 5.88784 6.53379 4.84228C7.88616 3.79671 9.50842 3.15794 11.21 3C10.2134 4.34827 9.73384 6.00945 9.85853 7.68141C9.98322 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <ToggleContainer onClick={toggleDarkMode} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
      <IconContainer
        key={darkMode ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 30, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {darkMode ? <SunIcon /> : <MoonIcon />}
      </IconContainer>
    </ToggleContainer>
  );
};

export default ThemeToggle; 