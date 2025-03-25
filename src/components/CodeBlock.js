import React, { useState, useCallback } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback(() => {
    if (!navigator.clipboard) {
      console.warn('Clipboard API not supported');
      return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Error copying code: ', err);
    });
  }, [code]);
  
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <button className="copy-button" onClick={handleCopy}>
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <div className="code-content">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock; 