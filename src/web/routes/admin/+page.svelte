<script>
    import { onMount, tick } from 'svelte'
    import { browser } from '$app/environment'
    import { delay } from 'lodash-es'
    import { 
        convertPdfToMarkdown, 
        addDocumentHeader, 
        downloadMarkdownFile,
        copyMarkdownToClipboard,
        renderMarkdownToHtml,
        applySyntaxHighlighting,
        formatFileSize
    } from '$lib/utils/pdf-utils.js'

    // File upload state
    let selectedFile = null
    let isConverting = false
    let conversionResult = null
    let errorMessage = null
    let dragOver = false

    // Results display state
    let viewMode = 'preview' // 'preview' or 'raw'
    let renderedMarkdown = ''

    // Toast notification system
    let toastMessage = ''
    let toastVisible = false
    let toastType = 'info'

    const showToast = (message, type = 'info') => {
        toastMessage = message
        toastType = type
        toastVisible = true
        delay(() => {
            toastVisible = false
        }, 3000)
    }

    // File handling with auto-conversion
    const handleFileSelect = async (event) => {
        const file = event.target.files[0]
        if (file) {
            selectedFile = file
            errorMessage = null
            conversionResult = null
            renderedMarkdown = ''
            console.log('📁 File selected:', file.name, file.type, file.size)
            
            // Auto-convert when file is selected
            await handlePdfConversion()
        }
    }

    const handleDragOver = (event) => {
        event.preventDefault()
        dragOver = true
    }

    const handleDragLeave = (event) => {
        event.preventDefault()
        dragOver = false
    }

    const handleDrop = async (event) => {
        event.preventDefault()
        dragOver = false
        
        const files = event.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type === 'application/pdf') {
                selectedFile = file
                errorMessage = null
                conversionResult = null
                renderedMarkdown = ''
                console.log('📁 File dropped:', file.name, file.type, file.size)
                
                // Auto-convert when file is dropped
                await handlePdfConversion()
            } else {
                errorMessage = 'Please select a PDF file'
                showToast('❌ Only PDF files are supported', 'error')
            }
        }
    }

    // PDF to Markdown conversion using utility
    const handlePdfConversion = async () => {
        if (!selectedFile) {
            errorMessage = 'Please select a PDF file first'
            showToast('❌ No file selected', 'error')
            return
        }

        isConverting = true
        errorMessage = null
        conversionResult = null

        try {
            console.log('🔄 Converting PDF to Markdown using @opendocsg/pdf2md...')
            
            // Use utility for conversion with progress callback
            const { markdown, metadata } = await convertPdfToMarkdown(selectedFile, {
                onProgress: (message) => showToast(message, 'info')
            })

            // Add document header using utility
            const finalMarkdown = addDocumentHeader(markdown, metadata)
            conversionResult = finalMarkdown
            
            // Render the markdown for preview and ensure we're in preview mode
            viewMode = 'preview'
            renderedMarkdown = await renderMarkdownToHtml(finalMarkdown)
            console.log('📝 Preview rendered, length:', renderedMarkdown.length)
            
            showToast(`✅ PDF converted successfully! Content extracted and formatted.`, 'success')
            console.log('✅ Conversion successful, markdown length:', finalMarkdown.length)

        } catch (error) {
            console.error('❌ PDF to Markdown conversion failed:', error)
            errorMessage = error.message
            showToast(`❌ Conversion failed: ${error.message}`, 'error')
        } finally {
            isConverting = false
        }
    }

    // Toggle between preview and raw view
    const handleViewModeToggle = async () => {
        if (!conversionResult) return
        
        try {
            if (viewMode === 'preview') {
                // Switch to raw
                viewMode = 'raw'
                // Apply syntax highlighting after DOM update
                await tick()
                await applySyntaxHighlighting()
            } else {
                // Switch to preview
                viewMode = 'preview'
                if (!renderedMarkdown && conversionResult) {
                    renderedMarkdown = await renderMarkdownToHtml(conversionResult)
                }
            }
        } catch (error) {
            console.error('Toggle view mode failed:', error)
            showToast('❌ Failed to toggle view mode', 'error')
        }
    }

    // Download markdown file using utility
    const handleDownload = () => {
        if (!conversionResult || !selectedFile) return

        const metadata = {
            originalFilename: selectedFile.name,
            fileSize: selectedFile.size,
            fileSizeMB: (selectedFile.size / 1024 / 1024).toFixed(2),
            contentLength: conversionResult.length,
            convertedAt: new Date().toISOString(),
            convertedWith: '@opendocsg/pdf2md'
        }

        downloadMarkdownFile(conversionResult, metadata, {
            onSuccess: (filename) => showToast(`📥 ${filename} download started!`, 'success')
        })
    }

    // Copy to clipboard using utility
    const handleCopyToClipboard = async () => {
        if (!conversionResult) return

        const success = await copyMarkdownToClipboard(conversionResult)
        if (success) {
            showToast('📋 Markdown copied to clipboard!', 'success')
        } else {
            showToast('❌ Failed to copy to clipboard', 'error')
        }
    }

    onMount(() => {
        console.log('🔧 Admin page mounted')
    })
</script>

<svelte:head>
    <title>Admin - PDF to Markdown Converter</title>
    <meta name="description" content="Admin interface for client-side PDF to Markdown conversion"/>
    <!-- Highlight.js CSS for syntax highlighting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <!-- Custom styles for prose and markdown display -->
    <style>
        .prose {
            color: inherit;
        }
        .prose h1 { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-top: 1.5rem; 
            margin-bottom: 1rem; 
            color: oklch(var(--p)); 
        }
        .prose h2 { 
            font-size: 1.25rem; 
            font-weight: 700; 
            margin-top: 1.25rem; 
            margin-bottom: 0.75rem; 
            color: oklch(var(--p)); 
        }
        .prose h3 { 
            font-size: 1.125rem; 
            font-weight: 700; 
            margin-top: 1rem; 
            margin-bottom: 0.5rem; 
            color: oklch(var(--s)); 
        }
        .prose h4 { 
            font-size: 1rem; 
            font-weight: 700; 
            margin-top: 0.75rem; 
            margin-bottom: 0.5rem; 
        }
        .prose p { 
            margin-bottom: 0.75rem; 
            line-height: 1.625; 
        }
        .prose ul { 
            list-style-type: disc; 
            padding-left: 1.5rem; 
            margin-bottom: 0.75rem; 
        }
        .prose ol { 
            list-style-type: decimal; 
            padding-left: 1.5rem; 
            margin-bottom: 0.75rem; 
        }
        .prose li { 
            margin-bottom: 0.25rem; 
        }
        .prose strong { 
            font-weight: 700; 
            color: oklch(var(--a)); 
        }
        .prose em { 
            font-style: italic; 
        }
        .prose code { 
            padding: 0.125rem 0.25rem; 
            border-radius: 0.25rem; 
            font-size: 0.875rem; 
            background-color: oklch(var(--b2)); 
        }
        .prose pre { 
            padding: 0.75rem; 
            border-radius: 0.5rem; 
            overflow-x: auto; 
            background-color: oklch(var(--b2)); 
        }
        .prose blockquote { 
            padding-left: 1rem; 
            font-style: italic; 
            border-left: 4px solid oklch(var(--p)); 
        }
        .prose hr { 
            margin-top: 1.5rem; 
            margin-bottom: 1.5rem; 
            border-top: 1px solid oklch(var(--b3)); 
        }
        .prose a { 
            text-decoration: underline; 
            color: oklch(var(--p)); 
        }
        .prose a:hover { 
            text-decoration: none; 
        }
        .prose table { 
            border-collapse: collapse; 
            width: 100%; 
            border: 1px solid oklch(var(--b3)); 
        }
        .prose th, .prose td { 
            padding: 0.75rem; 
            border: 1px solid oklch(var(--b3)); 
        }
        .prose th { 
            font-weight: 700; 
            background-color: oklch(var(--b2)); 
        }
    </style>
</svelte:head>

<div class="min-h-screen bg-base-200 p-4">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-primary mb-2">🔧 Admin Interface</h1>
            <p class="text-base-content/70">Client-side PDF processing with @opendocsg/pdf2md</p>
            <div class="mt-2 text-sm text-base-content/60">
                ✅ Fully private • No server uploads • Professional quality conversion
            </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- File Upload Section -->
            <div class="card bg-base-100 shadow-lg">
                <div class="card-body">
                    <h2 class="card-title text-xl mb-4">📁 File Upload</h2>
                    
                    <!-- Drag & Drop Zone -->
                    <div 
                        role="button"
                        tabindex="0"
                        class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center transition-colors {dragOver ? 'border-primary bg-primary/10' : ''}"
                        on:dragover={handleDragOver}
                        on:dragleave={handleDragLeave}
                        on:drop={handleDrop}
                        on:keydown={(e) => e.key === 'Enter' && document.querySelector('input[type="file"]').click()}
                    >
                        <div class="space-y-4">
                            <div class="text-6xl">📄</div>
                            <div>
                                <p class="text-lg font-medium">Drop PDF file here</p>
                                <p class="text-sm text-base-content/60">or click to browse</p>
                                <p class="text-xs text-base-content/50">Max size: 100MB • Client-side processing</p>
                            </div>
                            <input 
                                type="file" 
                                accept=".pdf"
                                on:change={handleFileSelect}
                                class="file-input file-input-bordered w-full max-w-xs"
                            />
                        </div>
                    </div>

                    <!-- File Info -->
                    {#if selectedFile}
                        <div class="mt-4 p-4 bg-base-200 rounded-lg">
                            <h3 class="font-medium mb-2">Selected File:</h3>
                            <div class="text-sm space-y-1">
                                <p><strong>Name:</strong> {selectedFile.name}</p>
                                <p><strong>Type:</strong> {selectedFile.type}</p>
                                <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                    {/if}

                    <!-- Error Message -->
                    {#if errorMessage}
                        <div class="mt-4 alert alert-error">
                            <span>❌ {errorMessage}</span>
                        </div>
                    {/if}

                    <!-- Convert Button -->
                    <!-- Conversion Status -->
                    {#if isConverting}
                        <div class="mt-6 flex items-center justify-center gap-2 text-info">
                            <span class="loading loading-spinner loading-sm"></span>
                            <span>Converting PDF to Markdown...</span>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Results Section -->
            <div class="card bg-base-100 shadow-lg">
                <div class="card-body">
                    <h2 class="card-title text-xl mb-4">📝 Conversion Results</h2>
                    
                    {#if conversionResult}
                        <div class="space-y-4">
                            <!-- Action Bar -->
                            <div class="flex flex-wrap gap-2 items-center justify-between">
                                <!-- View Toggle Switch -->
                                <div class="form-control">
                                    <label class="label cursor-pointer gap-3">
                                        <span class="label-text text-sm">👁️ Preview</span>
                                        <input 
                                            type="checkbox" 
                                            class="toggle toggle-sm" 
                                            checked={viewMode === 'raw'}
                                            on:change={handleViewModeToggle}
                                        />
                                        <span class="label-text text-sm">📄 Raw</span>
                                    </label>
                                </div>

                                <!-- Action Buttons -->
                                <div class="flex gap-2">
                                    <button 
                                        class="btn btn-success btn-sm"
                                        on:click={handleDownload}
                                        title="Download with YAML frontmatter"
                                    >
                                        ⬇️ Download .md
                                    </button>
                                    <button 
                                        class="btn btn-info btn-sm"
                                        on:click={handleCopyToClipboard}
                                        title="Copy raw markdown to clipboard"
                                    >
                                        📋 Copy Markdown
                                    </button>
                                </div>
                            </div>

                            <!-- Content Display -->
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <h3 class="font-medium">
                                        {viewMode === 'preview' ? 'Rendered Preview:' : 'Raw Markdown:'}
                                    </h3>
                                    <div class="text-xs text-base-content/60">
                                        {conversionResult.length.toLocaleString()} characters
                                    </div>
                                </div>
                                
                                <div class="border border-base-300 rounded-lg max-h-96 overflow-y-auto">
                                    {#if viewMode === 'preview'}
                                        <!-- Rendered Markdown Preview -->
                                        <div class="prose prose-sm max-w-none p-4" style="background-color: oklch(var(--b1));">
                                            {@html renderedMarkdown}
                                        </div>
                                    {:else}
                                        <!-- Raw Markdown with Syntax Highlighting -->
                                        <div class="relative">
                                            <pre class="language-markdown p-4 m-0 text-sm rounded-lg overflow-x-auto" style="background-color: oklch(var(--b2));"><code class="language-markdown">{conversionResult}</code></pre>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center py-8 text-base-content/60">
                            <div class="text-4xl mb-4">📝</div>
                            <p>Convert a PDF file to see the markdown result here</p>
                            <p class="text-sm mt-2">Preview with rendered formatting + download with metadata</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Future Features -->
        <div class="mt-8 card bg-base-100 shadow-lg">
            <div class="card-body">
                <h2 class="card-title text-xl mb-4">🚀 Coming Soon</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-base-200 rounded-lg">
                        <h3 class="font-medium mb-2">📄 HTML to PDF</h3>
                        <p class="text-sm text-base-content/60">Convert HTML files to PDF</p>
                    </div>
                    <div class="p-4 bg-base-200 rounded-lg">
                        <h3 class="font-medium mb-2">📊 Excel to PDF</h3>
                        <p class="text-sm text-base-content/60">Convert Excel spreadsheets to PDF</p>
                    </div>
                    <div class="p-4 bg-base-200 rounded-lg">
                        <h3 class="font-medium mb-2">📝 Word to PDF</h3>
                        <p class="text-sm text-base-content/60">Convert Word documents to PDF</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Toast Notification -->
{#if toastVisible}
    <div class="toast toast-bottom toast-center z-50">
        <div class="alert shadow-lg transition-all duration-300 {
            toastType === 'success' ? 'alert-success' :
            toastType === 'error' ? 'alert-error' :
            'bg-base-100 text-base-content border border-base-300'
        }">
            <span>{toastMessage}</span>
        </div>
    </div>
{/if} 