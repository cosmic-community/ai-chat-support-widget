'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { validateFile } from '@/lib/chat-utils'
import type { FileUpload as FileUploadType } from '@/types'

interface FileUploadProps {
  onUpload: (file: FileUploadType) => void
  onClose: () => void
}

export default function FileUpload({ onUpload, onClose }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setError(null)

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      const fileUpload: FileUploadType = {
        file,
        url: result.url,
        type: result.type,
        size: result.size,
        name: result.name
      }

      onUpload(fileUpload)
    } catch (error) {
      console.error('File upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Upload File</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div
        className={`file-upload-area ${isDragging ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.txt,.csv,.xlsx,.xls,.doc,.docx"
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Images, PDFs, docs, spreadsheets (max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}