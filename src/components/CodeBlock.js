import React, { useState, useCallback } from 'react';
import { FiCopy, FiCheck, FiPlay, FiMessageSquare } from 'react-icons/fi';
import CodeRunnerModal from './CodeRunnerModal';

const CodeBlock = ({ code, language, onDiscussCode }) => {
  const [copied, setCopied] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);

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

  const handleDiscuss = () => {
    if (onDiscussCode) {
      onDiscussCode(code);
    }
  };

  const handleRun = () => {
    setIsRunModalOpen(true);
  };

  const isJavaScript = language === 'javascript' || language === 'js';

  return (
    <>
      <div className="code-block">
        <div className="code-block-header">
          <span className="code-language">{language || 'code'}</span>
          <div className="code-block-actions">
            {isJavaScript && (
              <button className="code-action-button" onClick={handleRun} title="Run Code">
                <FiPlay size={14} />
                <span>Run</span>
              </button>
            )}
            <button className="code-action-button" onClick={handleDiscuss} title="Discuss Code">
              <FiMessageSquare size={14} />
              <span>Discuss</span>
            </button>
            <button className="code-action-button" onClick={handleCopy} title="Copy Code">
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <div className="code-content">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      {isRunModalOpen && (
        <CodeRunnerModal code={code} onClose={() => setIsRunModalOpen(false)} />
      )}
    </>
  );
};

export default CodeBlock;
 