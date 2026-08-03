'use client';

import React, { useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, DragEvent } from 'react';
import { FileText, Trash2, UploadCloud } from '@/components/Icons';
import { CIconButton } from './CIconButton';

export interface CFileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  title?: string;
  subtitle?: string;
  sx?: CSSProperties;
}

export const CFileUpload: React.FC<CFileUploadProps> = ({
  onFilesSelected,
  multiple = false,
  accept = '*',
  maxSize,
  title = 'Drag and drop files here or click to upload',
  subtitle = 'Support for bulk upload',
  sx,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = maxSize ? newFiles.filter((f) => f.size <= maxSize) : newFiles;

    if (validFiles.length < newFiles.length) {
      console.warn(`Some files were rejected because they exceed the maximum size of ${maxSize} bytes.`);
    }

    let updatedFiles = multiple ? [...files, ...validFiles] : validFiles;

    if (multiple) {
      updatedFiles = updatedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified),
      );
    }

    setFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected?.(newFiles);
  };

  return (
    <div style={{ width: '100%', ...sx }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--orb-primary)' : 'var(--orb-border)'}`,
          borderRadius: 'var(--orb-r)',
          padding: 32,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragOver ? 'var(--orb-hover)' : 'var(--orb-canvas)',
          transition: 'border-color var(--orb-t-fast), background-color var(--orb-t-fast)',
        }}
      >
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <UploadCloud size={40} strokeWidth={1.5} color={isDragOver ? 'var(--orb-primary)' : 'var(--orb-muted)'} />
          <span className="orb-subtitle">{title}</span>
          <span className="orb-meta">{subtitle}</span>
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                border: '1px solid var(--orb-border)',
                borderRadius: 'var(--orb-r)',
                backgroundColor: 'var(--orb-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <FileText size={16} strokeWidth={1.8} color="var(--orb-muted)" />
                <span
                  className="orb-body-dense"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {file.name}
                </span>
                <span className="orb-meta">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <CIconButton aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}>
                <Trash2 size={15} strokeWidth={1.8} />
              </CIconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
