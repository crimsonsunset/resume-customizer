/**
 * PDF Processing Utilities
 * Comprehensive client-side PDF to Markdown conversion and rendering utilities
 * Uses @opendocsg/pdf2md for conversion, marked.js for rendering, and highlight.js for syntax highlighting
 */

/**
 * Convert PDF file to markdown using client-side processing
 * @param {File} file - PDF file object
 * @param {object} options - Conversion options
 * @param {Function} [options.onProgress] - Progress callback function
 * @returns {Promise<{markdown: string, metadata: object}>} Conversion result with metadata
 */
export const convertPdfToMarkdown = async (file, options = {}) => {
  const { onProgress } = options

  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }
  
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported')
  }

  // Validate file size (100MB limit for client-side processing)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit')
  }

  onProgress?.('Loading PDF processor...')

  try {
    // Import pdf2md dynamically for client-side processing
    const pdf2md = await import('@opendocsg/pdf2md')
    
    onProgress?.('Converting file to buffer...')
    
    // Convert file to ArrayBuffer for pdf2md
    const fileBuffer = await file.arrayBuffer()
    console.log('📄 File buffer created, size:', fileBuffer.byteLength)

    onProgress?.('Extracting text from PDF...')

    // Convert PDF to markdown using pdf2md
    const markdown = await pdf2md.default(fileBuffer)
    console.log('✅ PDF conversion completed')

    if (!markdown || !markdown.trim()) {
      throw new Error('No content could be extracted from the PDF. The PDF might be image-based, encrypted, or corrupted.')
    }

    // Create metadata
    const metadata = {
      originalFilename: file.name,
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
      contentLength: markdown.length,
      convertedAt: new Date().toISOString(),
      convertedWith: '@opendocsg/pdf2md'
    }

    onProgress?.('Conversion completed successfully!')

    return { markdown, metadata }

  } catch (error) {
    console.error('❌ PDF to Markdown conversion failed:', error)
    throw new Error(`Conversion failed: ${error.message}`)
  }
}

/**
 * Add document header with metadata to markdown content
 * @param {string} markdown - Raw markdown content
 * @param {object} metadata - File metadata
 * @returns {string} Markdown with document header
 */
export const addDocumentHeader = (markdown, metadata) => {
  const documentHeader = `# ${metadata.originalFilename.replace('.pdf', '')}\n\n`
    + `*Converted from PDF using ${metadata.convertedWith} on ${new Date(metadata.convertedAt).toLocaleDateString()}*\n\n`
    + `**Document Info:**\n`
    + `- Original file: ${metadata.originalFilename}\n`
    + `- File size: ${metadata.fileSizeMB} MB\n`
    + `- Content length: ${metadata.contentLength.toLocaleString()} characters\n\n`
    + `---\n\n`

  return documentHeader + markdown
}





/**
 * Create YAML frontmatter for markdown file
 * @param {object} metadata - File metadata
 * @returns {string} YAML frontmatter string
 */
export const createYamlFrontmatter = (metadata) => {
  return `---
title: "${metadata.originalFilename.replace('.pdf', '')}"
source: "${metadata.originalFilename}"
converted_with: "${metadata.convertedWith}"
converted_on: "${metadata.convertedAt}"
file_size: "${metadata.fileSizeMB} MB"
content_length: ${metadata.contentLength}
---

`
}

/**
 * Download markdown content as file with YAML frontmatter
 * @param {string} markdown - Markdown content
 * @param {object} metadata - File metadata
 * @param {object} options - Download options
 * @param {boolean} [options.includeFrontmatter] - Include YAML frontmatter
 * @param {Function} [options.onSuccess] - Success callback
 */
export const downloadMarkdownFile = (markdown, metadata, options = {}) => {
  const { includeFrontmatter = true, onSuccess } = options

  let finalContent = markdown
  if (includeFrontmatter) {
    const yamlFrontmatter = createYamlFrontmatter(metadata)
    finalContent = yamlFrontmatter + markdown
  }

  const filename = metadata.originalFilename.replace('.pdf', '.md')
  const blob = new Blob([finalContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  onSuccess?.(filename)
}

/**
 * Copy markdown content to clipboard
 * @param {string} markdown - Markdown content to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyMarkdownToClipboard = async (markdown) => {
  try {
    if (navigator.clipboard && globalThis.isSecureContext) {
      await navigator.clipboard.writeText(markdown)
      return true
    }
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea')
    textArea.value = markdown
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.append(textArea)
    textArea.focus()
    textArea.select()
    
    const success = document.execCommand('copy')
    textArea.remove()
    return success
    
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals] - Number of decimal places
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = Math.max(0, decimals)
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Validate PDF file type and size
 * @param {File} file - File to validate
 * @returns {boolean} True if valid
 */
const validatePdfFile = (file) => {
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported')
  }
  
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit')
  }
  
  return true
}

/**
 * Handle keyboard activation for file input
 * @param {Event} event - Keyboard event
 */
const handleKeyboardActivation = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    // Trigger file input click
    const fileInput = document.querySelector('input[type="file"]')
    fileInput?.click()
  }
}

/**
 * Handle file drag and drop events with PDF validation
 * @param {object} config - Configuration object
 * @param {Function} config.onFileSelect - File selection handler
 * @param {Function} [config.onDragOver] - Drag over handler
 * @param {Function} [config.onDragLeave] - Drag leave handler  
 * @param {Function} [config.onError] - Error handler
 * @returns {object} Event handlers object
 */
export const createPdfDropHandlers = (config) => {
  const { onFileSelect, onDragOver, onDragLeave, onError } = config
  
  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onDragOver?.(event)
  }
  
  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onDragLeave?.(event)
  }
  
  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = [...(event.dataTransfer?.files || [])]
    if (files.length > 0) {
      try {
        const file = files[0]
        validatePdfFile(file)
        onFileSelect?.(file)
      } catch (error) {
        console.error('File validation failed:', error)
        onError?.(error)
      }
    }
  }
  
  const handleFileInput = (event) => {
    const files = [...(event.target?.files || [])]
    if (files.length > 0) {
      try {
        const file = files[0]
        validatePdfFile(file)
        onFileSelect?.(file)
      } catch (error) {
        console.error('File validation failed:', error)
        onError?.(error)
      }
    }
  }
  
  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    handleKeyboardActivation,
    validatePdfFile
  }
} 