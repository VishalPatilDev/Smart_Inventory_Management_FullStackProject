// src/components/ui/ImageUploader.jsx
// Drag-and-drop image uploader with instant preview.
// Shows existing image if editing, upload progress while uploading,
// and a clear button to remove the image.

import { useState, useRef } from 'react'
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload'

export function ImageUploader({ value, onChange }) {
  // value = current imageUrl (string or null)
  // onChange = called with new URL after upload, or null after removal
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef()
  const { upload } = useCloudinaryUpload()

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(20)

    try {
      // Simulate progress while Cloudinary uploads
      const timer = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85))
      }, 300)

      const url = await upload(file)

      clearInterval(timer)
      setProgress(100)
      onChange(url)

      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    } catch (err) {
      setError(err.message)
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onChange(null)
    setError('')
  }

  // If we already have an image — show it with a remove button
  if (value && !uploading) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={value}
          alt="Product"
          style={{
            width: 120, height: 120, objectFit: 'cover',
            borderRadius: 8, border: '1px solid var(--border)',
            display: 'block'
          }}
        />
        <button
          type="button"
          onClick={handleRemove}
          style={{
            position: 'absolute', top: -8, right: -8,
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--danger)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, lineHeight: 1
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>
          Click ✕ to change
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-strong)'}`,
          borderRadius: 8,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? 'var(--primary-light)' : 'var(--surface-2)',
          transition: 'all 0.15s'
        }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Uploading…</div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'var(--primary)',
                width: `${progress}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 4 }}>
              Drag & drop an image here
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              or click to browse · JPG, PNG, WebP · max 5 MB
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{error}</div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}