import React, { useState } from 'react'
import { MarkdownRenderer } from '../../atoms/markdown-renderer'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  preview?: 'edit' | 'live' | 'preview'
  height?: number
  className?: string
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter markdown content...",
  preview = 'live',
  height = 400,
  className = '',
  error,
  label,
  required = false,
  disabled = false
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  const handleChange = (val: string) => {
    onChange(val || '')
  }

  return (
    <div className={`markdown-editor-container ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Mode Toggle */}
        <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMode('edit')}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'edit'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-indigo-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'preview'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-indigo-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        <div style={{ minHeight: height }}>
          {mode === 'edit' ? (
            <textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full h-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none ${
                error ? 'border-red-500' : ''
              }`}
              style={{ minHeight: height }}
            />
          ) : (
            <div className="p-4 bg-white dark:bg-gray-900" style={{ minHeight: height }}>
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No content to preview
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Supports{' '}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Markdown syntax
        </a>
        {' '}including headings, lists, links, code blocks, and tables.
      </div>
    </div>
  )
}