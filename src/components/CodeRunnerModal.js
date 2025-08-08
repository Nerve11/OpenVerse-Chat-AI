import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const CodeRunnerModal = ({ code, onClose }) => {
    const [output, setOutput] = useState([]);
    const iframeRef = useRef(null);

    const sandboxHTML = `
        <html>
            <head>
                <style>
                    body { font-family: monospace; color: #333; margin: 0; padding: 8px; background-color: #f4f4f4; }
                    .output-line { padding: 4px; border-bottom: 1px solid #eee; }
                    .output-line-error { color: red; }
                    .output-line-log { color: #333; }
                    .output-line-return { color: blue; font-style: italic; }
                </style>
            </head>
            <body>
                <script>
                    const logs = [];
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;

                    const formatArg = (arg) => {
                        if (arg instanceof Error) return arg.toString();
                        if (typeof arg === 'object' && arg !== null) {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (e) {
                                return '[Unserializable Object]';
                            }
                        }
                        return String(arg);
                    };

                    console.log = (...args) => {
                        logs.push({type: 'log', data: args.map(formatArg)});
                        originalLog.apply(console, args);
                    };
                    console.error = (...args) => {
                        logs.push({type: 'error', data: args.map(formatArg)});
                        originalError.apply(console, args);
                    };
                    console.warn = (...args) => {
                        logs.push({type: 'warn', data: args.map(formatArg)});
                        originalWarn.apply(console, args);
                    };

                    window.addEventListener('message', (event) => {
                        if (event.source === window.parent) {
                            try {
                                const result = eval(event.data.code);
                                if (result !== undefined) {
                                    logs.push({type: 'return', data: [formatArg(result)]});
                                }
                            } catch (e) {
                                logs.push({type: 'error', data: [e.toString()]});
                            }
                            window.parent.postMessage({output: logs}, '*');
                        }
                    }, false);
                </script>
            </body>
        </html>
    `;

    useEffect(() => {
        const handleMessage = (event) => {
            if (iframeRef.current && event.source === iframeRef.current.contentWindow && event.data.output) {
                setOutput(event.data.output);
            }
        };

        window.addEventListener('message', handleMessage);

        const iframe = iframeRef.current;
        if (iframe) {
            iframe.srcdoc = sandboxHTML;
            iframe.onload = () => {
                iframe.contentWindow.postMessage({ code }, '*');
            };
        }

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [code, sandboxHTML]);

    return createPortal(
        <div className="code-runner-modal-overlay" onClick={onClose}>
            <div className="code-runner-modal" onClick={e => e.stopPropagation()}>
                <div className="code-runner-header">
                    <h3>JavaScript Runner</h3>
                    <button className="code-runner-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="code-output">
                    {output.length === 0 && <p>Executing...</p>}
                    {output.map((line, index) => (
                        <pre key={index} className={`output-line output-line-${line.type}`}>
                            {line.data.join(' ')}
                        </pre>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CodeRunnerModal;
