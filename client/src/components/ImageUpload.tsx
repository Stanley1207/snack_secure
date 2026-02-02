import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, selectedImage, disabled }: ImageUploadProps) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setError(t('imageUpload.invalidType'))
      return false
    }

    if (file.size > maxSize) {
      setError(t('imageUpload.tooLarge'))
      return false
    }

    setError(null)
    return true
  }

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onImageSelect(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [onImageSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [disabled, handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    setPreviewUrl(null)
    setError(null)
    onImageSelect(null as unknown as File)
  }, [onImageSelect])

  return (
    <div className="w-full">
      {!selectedImage ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-64
            border-2 border-dashed rounded-lg cursor-pointer
            transition-colors
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{t('imageUpload.clickToUpload')}</span>
              {' '}{t('imageUpload.orDragDrop')}
            </p>
            <p className="text-xs text-gray-500">
              {t('imageUpload.supportedFormats')}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            {previewUrl && (
              <img
                src={previewUrl}
                alt={t('imageUpload.preview')}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="mt-2 text-sm text-gray-600 text-center truncate">
            {selectedImage.name}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
