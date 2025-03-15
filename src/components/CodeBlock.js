import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CodeBlockContainer = styled.div`
  position: relative;
  margin: 1rem 0;
  font-family: 'Fira Code', 'Roboto Mono', monospace;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: ${props => props.theme.shadowSmall};
`;

const CodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.isDark 
    ? 'rgba(0, 0, 0, 0.4)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  color: ${props => props.theme.textSecondary};
  border-bottom: 1px solid ${props => props.theme.border};
  font-size: 0.875rem;
`;

const LanguageTag = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.textSecondary};
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  transition: all var(--transition-fast);
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)'
    };
    color: ${props => props.theme.text};
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const Pre = styled.pre`
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background: ${props => props.theme.isDark 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.025)'
  };
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  line-height: 1.6;
`;

const Code = styled.code`
  font-family: inherit;
`;

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [canCopy, setCanCopy] = useState(true);
  
  // Проверяем доступность API копирования
  useEffect(() => {
    if (!navigator.clipboard) {
      setCanCopy(false);
      console.warn('Clipboard API не поддерживается в этом браузере');
    }
  }, []);
  
  const handleCopy = () => {
    if (!navigator.clipboard) {
      console.warn('Clipboard API не поддерживается');
      return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Ошибка при копировании: ', err);
    });
  };
  
  return (
    <CodeBlockContainer>
      <CodeHeader>
        <LanguageTag>{language || 'code'}</LanguageTag>
        {canCopy && (
          <CopyButton onClick={handleCopy} aria-label={copied ? "Скопировано" : "Копировать код"}>
            {copied ? (
              <>
                <FiCheck /> Copied!
              </>
            ) : (
              <>
                <FiCopy /> Copy code
              </>
            )}
          </CopyButton>
        )}
      </CodeHeader>
      <Pre>
        <Code>{code}</Code>
      </Pre>
    </CodeBlockContainer>
  );
};

export default CodeBlock; 