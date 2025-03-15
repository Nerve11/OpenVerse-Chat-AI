import React, { useState, useEffect, useContext, useMemo, useCallback, memo } from 'react';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import ChatInterface from './components/ChatInterface';
import ThemeToggle from './components/ThemeToggle';
import { ThemeContext, ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { motion } from 'framer-motion';
import { FiMessageCircle } from 'react-icons/fi';

const AppContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: background 0.3s ease, color 0.3s ease;
  
  /* Добавляем тонкий узор на фон */
  background-image: ${props => props.theme.isDark 
    ? `radial-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px)`
    : `radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px)`
  };
  background-size: 20px 20px;
  containment: layout style;
`;

const Header = styled.header`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.cardBackground};
  box-shadow: ${props => props.theme.shadowMedium};
  position: relative;
  z-index: 10;
  contain: layout style paint;
  
  /* Добавляем тонкую полоску внизу */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    opacity: 0.8;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #8b5cf6;
  
  svg {
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
  }
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  margin: 0;
  
  /* Добавляем подсветку текста */
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
`;

const ConnectionStatus = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  background: ${props => 
    props.status === 'error' 
      ? 'rgba(220, 38, 38, 0.1)' 
      : props.status === 'loaded'
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(99, 102, 241, 0.1)'
  };
  color: ${props => 
    props.status === 'error' 
      ? 'var(--color-error)' 
      : props.status === 'loaded'
        ? 'var(--color-success)'
        : 'var(--color-primary)'
  };
  display: flex;
  align-items: center;
  gap: 6px;
  
  /* Пульсирующая точка */
  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => 
      props.status === 'error' 
        ? 'var(--color-error)' 
        : props.status === 'loaded'
          ? 'var(--color-success)'
          : 'var(--color-primary)'
    };
    animation: ${props => props.status === 'loading' ? 'pulse 1.5s infinite' : 'none'};
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.3;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Footer = memo(styled.footer`
  padding: 1rem 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
  background: ${props => props.theme.cardBackground};
  margin-top: auto;
  box-shadow: ${props => props.theme.shadowMedium};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    opacity: 0.8;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`);

// Мемоизированный компонент логотипа
const AppLogo = memo(() => (
  <Logo>
    <LogoIcon>
      <FiMessageCircle />
    </LogoIcon>
    <LogoText>Claude 3.7 Sonnet Chat</LogoText>
  </Logo>
));

// Мемоизированный компонент статуса соединения
const StatusIndicator = memo(({ status }) => {
  // Мемоизация текста статуса
  const statusText = useMemo(() => {
    switch(status) {
      case 'loading': return 'Connecting...';
      case 'loaded': return 'Connected';
      case 'error': return 'Connection Error';
      default: return 'Unknown Status';
    }
  }, [status]);
  
  return (
    <ConnectionStatus status={status}>
      {statusText}
    </ConnectionStatus>
  );
});

const App = ({ puterLoaded, puterTimeout }) => {
  const [puterStatus, setPuterStatus] = useState(
    puterLoaded ? 'loaded' : puterTimeout ? 'error' : 'loading'
  );

  // Оптимизированный эффект с контролем производительности
  useEffect(() => {
    // Если уже получили статус из пропсов, используем его
    if (puterLoaded) {
      setPuterStatus('loaded');
      document.title = 'Claude 3.7 Sonnet Chat';
      return;
    }
    
    if (puterTimeout) {
      setPuterStatus('error');
      document.title = 'Connection Error - Claude Chat';
      return;
    }
    
    // Проверяем только если статус еще 'loading'
    if (puterStatus === 'loading') {
      const checkPuter = () => {
        if (typeof window.puter !== 'undefined') {
          setPuterStatus('loaded');
          document.title = 'Claude 3.7 Sonnet Chat';
          
          // Добавляем данные для производительности
          if (window.performance && window.performance.mark) {
            window.performance.mark('puter-loaded');
          }
        } else {
          setPuterStatus('error');
          document.title = 'Connection Error - Claude Chat';
        }
      };
      
      // Регистрируем начало загрузки для метрик производительности
      if (window.performance && window.performance.mark) {
        window.performance.mark('puter-load-start');
      }
      
      // Проверяем сразу
      checkPuter();
      
      // И через три секунды для надежности
      const timeoutId = setTimeout(checkPuter, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [puterStatus, puterLoaded, puterTimeout]);

  // Мемоизированный обработчик изменения статуса
  const handlePuterStatusChange = useCallback((newStatus) => {
    setPuterStatus(newStatus);
    
    // Обновляем заголовок страницы
    if (newStatus === 'loaded') {
      document.title = 'Claude 3.7 Sonnet Chat';
    } else if (newStatus === 'error') {
      document.title = 'Connection Error - Claude Chat';
    }
  }, []);

  return (
    <CustomThemeProvider>
      <ThemedApp 
        puterStatus={puterStatus} 
        onPuterStatusChange={handlePuterStatusChange} 
      />
    </CustomThemeProvider>
  );
};

// Оптимизированный компонент с мемоизацией для ThemeContext
const ThemedApp = memo(({ puterStatus, onPuterStatusChange }) => {
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  
  // Мемоизируем год для footer
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Анимационные параметры, мемоизированные для избежания ненужных ререндеров
  const animationProps = useMemo(() => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  }), []);
  
  // Мемоизированный обработчик для toggleTheme
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);
  
  // Мемоизированный footer контент
  const footerContent = useMemo(() => (
    <Footer>
      Powered by <a href="https://anthropic.com/claude" target="_blank" rel="noopener noreferrer">Anthropic's Claude 3.7 Sonnet</a> via Puter.js | {currentYear}
    </Footer>
  ), [currentYear]);

  return (
    <StyledThemeProvider theme={{...theme, isDark}}>
      <AppContainer {...animationProps}>
        <Header>
          <AppLogo />
          <StatusIndicator status={puterStatus} />
          <ThemeToggle darkMode={isDark} toggleDarkMode={handleThemeToggle} />
        </Header>
        <ChatInterface onPuterStatusChange={onPuterStatusChange} />
        {footerContent}
      </AppContainer>
    </StyledThemeProvider>
  );
});

export default memo(App); 