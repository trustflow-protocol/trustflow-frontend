import React, { useState, useEffect } from 'react'
import { MarkdownRenderer } from '../../atoms/markdown-renderer'

export interface DeliverableFile {
  id: string
  name: string
  size: number
  type: string
  cid?: string
  content?: string
  uploadedAt: string
}

export interface DeliverableViewerProps {
  files: DeliverableFile[]
  onFileSelect?: (file: DeliverableFile) => void
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎥'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return '📦'
  if (type.includes('text') || type.includes('markdown')) return '📋'
  if (type.includes('json') || type.includes('xml')) return '📋'
  if (type.includes('javascript') || type.includes('typescript')) return '⚙️'
  return '📄'
}

const isMarkdownFile = (file: DeliverableFile): boolean => {
  return file.name.toLowerCase().endsWith('.md') || 
         file.name.toLowerCase().endsWith('.markdown') ||
         file.type === 'text/markdown'
}

const isTextFile = (file: DeliverableFile): boolean => {
  return file.type.startsWith('text/') || 
         isMarkdownFile(file) ||
         file.name.toLowerCase().endsWith('.json') ||
         file.name.toLowerCase().endsWith('.xml')
}

export const DeliverableViewer: React.FC<DeliverableViewerProps> = ({
  files,
  onFileSelect,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<DeliverableFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedFile && selectedFile.content) {
      setFileContent(selectedFile.content)
    } else if (selectedFile && selectedFile.cid && isTextFile(selectedFile)) {
      // In a real app, you would fetch the file content from IPFS using the CID
      // For demo purposes, we'll use mock content
      setLoading(true)
      setTimeout(() => {
        if (isMarkdownFile(selectedFile)) {
          setFileContent(`# ${selectedFile.name.replace(/\.md$/, '')}

## Deliverable Overview
This is a sample markdown deliverable document.

### Key Features Implemented:
- ✅ **Feature 1**: Core functionality completed
- ✅ **Feature 2**: Integration with blockchain
- ⏳ **Feature 3**: Testing phase (90% complete)

### Technical Details:
\`\`\`typescript
// Example code implementation
function processDeliverable(data: any) {
  return {
    status: 'completed',
    timestamp: new Date().toISOString(),
    hash: generateHash(data)
  }
}
\`\`\`

### Next Steps:
1. Final testing and QA
2. Documentation updates
3. Deployment to production

> **Note**: This deliverable meets all requirements specified in milestone ${Math.floor(Math.random() * 3) + 1}.`)
        } else {
          setFileContent(`File: ${selectedFile.name}
Type: ${selectedFile.type}
Size: ${formatFileSize(selectedFile.size)}
CID: ${selectedFile.cid}

This is a preview of the text file content. In a real implementation, this would be fetched from IPFS using the CID.`)
        }
        setLoading(false)
      }, 1000)
    }
  }, [selectedFile])

  const handleFileSelect = (file: DeliverableFile) => {
    setSelectedFile(file)
    onFileSelect?.(file)
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">📁</div>
        <p className="text-gray-500 dark:text-gray-400">No deliverables uploaded yet</p>
      </div>
    )
  }

  return (
    <div className={`deliverable-viewer ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Deliverable Files ({files.length})
          </h3>
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileSelect(file)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedFile?.id === file.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                  {file.cid && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                      CID: {file.cid.substring(0, 20)}...
                    </div>
                  )}
                  {isTextFile(file) && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      ✨ Preview available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* File Preview */}
        <div className="lg:sticky lg:top-4">
          {selectedFile ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">Loading preview...</span>
                  </div>
                ) : isTextFile(selectedFile) ? (
                  isMarkdownFile(selectedFile) ? (
                    <MarkdownRenderer content={fileContent} />
                  ) : (
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {fileContent}
                    </pre>
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">{getFileIcon(selectedFile.type)}</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Preview not available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {selectedFile.type} files cannot be previewed in browser
                    </p>
                    {selectedFile.cid && (
                      <button className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors">
                        Download from IPFS
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">👁️</div>
              <p className="text-gray-500 dark:text-gray-400">
                Select a file to preview its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}