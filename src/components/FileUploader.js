import React, { useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import { useTranslation } from 'react-i18next';

const DEFAULT_ACCEPT = [
  '.txt', '.md', '.markdown', '.json', '.yaml', '.yml', '.xml', '.toml', '.ini', '.env',
  '.csv', '.tsv', '.sql',
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.html', '.css', '.scss', '.sass', '.less',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.c', '.cc', '.cpp', '.h', '.hpp', '.cs', '.php', '.sh', '.bash', '.zsh',
  '.ipynb', '.dockerfile', '.gitignore', '.gitattributes', '.editorconfig',
  '.log', '.conf', '.cfg', '.properties',
  '.vue', '.svelte', '.astro',
  '.zip'
].join(',');

const TEXT_EXTENSIONS = new Set([
  'txt','md','markdown','json','yaml','yml','xml','toml','ini','env','csv','tsv','sql',
  'js','jsx','ts','tsx','mjs','cjs','html','css','scss','sass','less',
  'py','rb','go','rs','java','kt','c','cc','cpp','h','hpp','cs','php','sh','bash','zsh',
  'ipynb','log','conf','cfg','properties','vue','svelte','astro','dockerfile','gitignore','gitattributes','editorconfig'
]);

function getExtension(filename) {
  const name = filename.toLowerCase();
  if (name === 'dockerfile') return 'dockerfile';
  const lastDot = name.lastIndexOf('.');
  return lastDot >= 0 ? name.slice(lastDot + 1) : '';
}

async function readTextFile(file, maxBytes) {
  if (maxBytes && file.size > maxBytes) {
    const blob = file.slice(0, maxBytes);
    const text = await blob.text();
    return text + `\n\n[Truncated to ${maxBytes} bytes from ${file.size} bytes]`;
  }
  return file.text();
}

async function extractZip(file, maxBytesPerFile) {
  const results = [];
  const data = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(data);
  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    const ext = getExtension(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    try {
      let content = await entry.async('string');
      if (maxBytesPerFile && content.length > maxBytesPerFile) {
        content = content.slice(0, maxBytesPerFile) + `\n\n[Truncated to ${maxBytesPerFile} characters]`;
      }
      results.push({
        name: entry.name,
        content,
        size: content.length,
        ext
      });
    } catch (err) {
      // Skip problematic entry
      // eslint-disable-next-line no-console
      console.warn('Failed to read zip entry', entry.name, err);
    }
  }
  return results;
}

const FileUploader = ({ onFilesAdded, filesCount = 0, accept = DEFAULT_ACCEPT, maxBytesPerFile = 200 * 1024 }) => {
  const inputRef = useRef(null);
  const inputIdRef = useRef(`file-input-${Math.random().toString(36).slice(2)}`);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputId = inputIdRef.current;
  const { t } = useTranslation();

  const processFileList = useCallback(async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    const parsed = [];
    let skipped = 0;
    try {
      const files = Array.from(fileList);
      for (const file of files) {
        const ext = getExtension(file.name);
        if (ext === 'zip') {
          const extracted = await extractZip(file, maxBytesPerFile);
          parsed.push(...extracted);
        } else if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) {
          try {
            const content = await readTextFile(file, maxBytesPerFile);
            parsed.push({ name: file.name, content, size: file.size, ext });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to read file', file.name, err);
          }
        } else {
          skipped++;
        }
      }
      if (parsed.length > 0) {
        if (typeof onFilesAdded === 'function') {
          onFilesAdded(parsed);
        }
        if (skipped > 0) {
          // eslint-disable-next-line no-console
          console.info(`Some files were skipped as non-text: ${skipped}`);
        }
      } else {
        // Notify user if nothing could be processed
        // eslint-disable-next-line no-alert
        alert('Не удалось добавить файлы: не найдено поддерживаемых текстовых файлов. Проверьте расширения или содержимое ZIP.');
      }
    } finally {
      setIsProcessing(false);
      // reset input to allow re-uploading same files
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onFilesAdded, maxBytesPerFile]);

  const handleChange = useCallback(async (event) => {
    await processFileList(event.target.files);
  }, [processFileList]);

  const handleClickFallback = useCallback(() => {
    // Fallback in case label-for is blocked by styles
    inputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      await processFileList(dt.files);
    }
  }, [processFileList]);

  return (
    <div className={`add-files ${isProcessing ? 'loading' : ''}`} onDragOver={handleDragOver} onDrop={handleDrop}>
      <label
        htmlFor={inputId}
        className={`add-files-button ${isProcessing ? 'disabled' : ''}`}
        onClick={handleClickFallback}
        role="button"
        tabIndex={0}
        title={t('controls.addFilesTitle')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClickFallback(); } }}
      >
        {isProcessing ? t('controls.processing') : t('controls.addFiles')}{filesCount > 0 ? ` (${filesCount})` : ''}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={isProcessing}
      />
    </div>
  );
};

export default FileUploader;


