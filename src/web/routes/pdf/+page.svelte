<script>
    import {onMount, tick} from 'svelte'
    import {browser} from '$app/environment'
    import {delay} from 'lodash-es'
    // Dynamic imports to prevent bundling in main chunk
    // import Markdown from 'svelte-exmarkdown'
    // import {gfmPlugin} from 'svelte-exmarkdown/gfm'
    // import {
    //     convertPdfToMarkdown,
    //     addDocumentHeader,
    //     downloadMarkdownFile,
    //     copyMarkdownToClipboard
    // } from '$lib/utils/pdf-utils.js'

    // PDF utility functions - loaded dynamically
    let pdfUtils = null

    // Markdown plugins for better rendering
    // const markdownPlugins = [gfmPlugin()]
    let markdownPlugins = []
    let MarkdownComponent = null

    // Dynamic imports for markdown processing
    onMount(async () => {
        if (browser) {
            try {
                const [markdownModule, gfmModule, pdfUtilsModule] = await Promise.all([
                    import('svelte-exmarkdown'),
                    import('svelte-exmarkdown/gfm'),
                    import('$lib/utils/pdf-utils.js')
                ])
                MarkdownComponent = markdownModule.default
                markdownPlugins = [gfmModule.gfmPlugin()]
                pdfUtils = pdfUtilsModule
            } catch (error) {
                console.error('Failed to load modules:', error)
            }
        }
    })

    // App state
    let selectedFile = null
    let isConverting = false
    let conversionResult = null
    let errorMessage = null
    let dragOver = false
    let viewMode = 'preview' // 'preview' or 'raw'

    // Computed state for UI modes
    $: hasContent = Boolean(conversionResult)
    $: showInitialDropzone = !hasContent && !isConverting
    $: showViewer = hasContent && !isConverting

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

    // Reset state to show initial dropzone
    const resetToInitial = () => {
        selectedFile = null
        conversionResult = null
        errorMessage = null
        isConverting = false
        viewMode = 'preview'
    }

    // File handling with auto-conversion
    const handleFileSelect = async (event) => {
        const file = event.target.files[0]
        if (file) {
            selectedFile = file
            errorMessage = null
            conversionResult = null
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
            // Ensure utilities are loaded
            if (!pdfUtils) {
                showToast('⏳ Loading PDF processing tools...', 'info')
                const pdfUtilsModule = await import('$lib/utils/pdf-utils.js')
                pdfUtils = pdfUtilsModule
            }

            console.log('🔄 Converting PDF to Markdown using @opendocsg/pdf2md...')

            // Use utility for conversion with progress callback
            const {markdown, metadata} = await pdfUtils.convertPdfToMarkdown(selectedFile, {
                onProgress: (message) => showToast(message, 'info')
            })

            // Add document header using utility
            const finalMarkdown = pdfUtils.addDocumentHeader(markdown, metadata)
            conversionResult = finalMarkdown

            // Set to preview mode (svelte-exmarkdown will handle rendering)
            viewMode = 'preview'

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
            } else {
                // Switch to preview
                viewMode = 'preview'
                // svelte-exmarkdown will handle rendering automatically
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

        // Download markdown file
        function downloadMarkdownAsFile() {
            if (!conversionResult) return

            // Ensure utilities are loaded
            if (!pdfUtils) {
                showToast('⚠️ PDF utilities not loaded yet', 'error')
                return
            }

            pdfUtils.downloadMarkdownFile(conversionResult, metadata, {
                onSuccess: (filename) => showToast(`📥 ${filename} download started!`, 'success')
            })
        }

        downloadMarkdownAsFile()
    }

    // Copy markdown to clipboard
    async function copyToClipboard() {
        if (!conversionResult) return

        // Ensure utilities are loaded
        if (!pdfUtils) {
            showToast('⚠️ PDF utilities not loaded yet', 'error')
            return
        }

        const success = await pdfUtils.copyMarkdownToClipboard(conversionResult)
        if (success) {
            showToast('📋 Markdown copied to clipboard!', 'success')
        } else {
            showToast('❌ Failed to copy to clipboard', 'error')
        }
    }

    onMount(() => {
        console.log('📄 PDF tools page mounted')
    })
</script>

<svelte:head>
    <title>PDF Tools - PDF to Markdown Converter</title>
    <meta name="description" content="PDF processing tools for client-side PDF to Markdown conversion"/>
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

<!-- STATE 1: Initial Dropzone (nothing uploaded) -->
{#if showInitialDropzone}
    <div class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
            <div class="max-w-2xl">
                <div class="mb-8">
                    <h1 class="text-5xl font-bold text-primary mb-4">📄 PDF Tools</h1>
                    <p class="text-xl text-base-content/70 mb-2">Client-side PDF processing with @opendocsg/pdf2md</p>
                    <div class="text-sm text-base-content/60">
                        ✅ Fully private • No server uploads • Professional quality conversion
                    </div>
                </div>
                
                <!-- Big Dropzone -->
                <div 
                    role="button"
                    tabindex="0"
                    class="card bg-base-100 shadow-2xl border-2 border-dashed border-base-300 transition-all duration-300 hover:border-primary hover:shadow-xl cursor-pointer {dragOver ? 'border-primary bg-primary/5 shadow-2xl scale-105' : ''}"
                    on:dragover={handleDragOver}
                    on:dragleave={handleDragLeave}
                    on:drop={handleDrop}
                    on:keydown={(e) => e.key === 'Enter' && document.querySelector('input[type="file"]').click()}
                    on:click={() => document.querySelector('input[type="file"]').click()}
                >
                    <div class="card-body p-16">
                        <div class="text-8xl mb-6 opacity-60">📄</div>
                        <h2 class="text-3xl font-bold mb-4">Drop PDF Here</h2>
                        <p class="text-lg text-base-content/70 mb-6">
                            Drag and drop your PDF file here, or click to browse
                        </p>
                        <div class="space-y-2 text-sm text-base-content/60">
                            <p>📁 Maximum file size: 100MB</p>
                            <p>🔒 All processing happens in your browser</p>
                            <p>⚡ Instant conversion with professional output</p>
                        </div>
                        
                        <!-- Hidden file input -->
                        <input 
                            type="file" 
                            accept=".pdf"
                            on:change={handleFileSelect}
                            class="hidden"
                        />
                        
                        {#if errorMessage}
                            <div class="alert alert-error mt-6">
                                <span>❌ {errorMessage}</span>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- STATE 2: Markdown Viewer (content uploaded) -->
{#if showViewer}
    <div class="min-h-screen bg-base-200">
        <!-- Header with controls -->
        <div class="navbar bg-base-100 shadow-sm">
            <div class="navbar-start">
                <button class="btn btn-ghost" on:click={resetToInitial}>
                    ← Back
                </button>
            </div>
            <div class="navbar-center">
                <h1 class="text-xl font-bold">📝 Markdown Viewer</h1>
            </div>
            <div class="navbar-end gap-2">
                <!-- View Toggle -->
                <div class="form-control">
                    <label class="label cursor-pointer gap-2">
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
                
                <!-- Action buttons -->
                <button 
                    class="btn btn-success btn-sm"
                    on:click={handleDownload}
                    title="Download with YAML frontmatter"
                >
                    ⬇️ Download
                </button>
                <button 
                    class="btn btn-info btn-sm"
                    on:click={copyToClipboard}
                    title="Copy raw markdown to clipboard"
                >
                    📋 Copy
                </button>
            </div>
        </div>

        <!-- Full screen markdown viewer -->
        <div class="container mx-auto p-4 max-w-none">
            <div class="card bg-base-100 shadow-lg min-h-[calc(100vh-8rem)]">
                <div class="card-body p-0">
                    {#if viewMode === 'preview'}
                        <!-- Rendered Markdown Preview -->
                        <div class="prose prose-lg max-w-none p-8 min-h-full">
                            {#if MarkdownComponent}
                                <MarkdownComponent md={conversionResult} plugins={markdownPlugins} />
                            {:else}
                                <div class="text-center py-16">
                                    <div class="loading loading-spinner loading-lg text-primary"></div>
                                    <p class="mt-4 text-lg text-base-content/70">Loading Markdown renderer...</p>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <!-- Raw Markdown -->
                        <div class="w-full h-full">
                            <pre class="language-markdown p-8 m-0 text-sm h-full overflow-auto bg-base-100"><code class="language-markdown">{conversionResult}</code></pre>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Upload Button -->
    <div class="fixed bottom-6 right-6 z-50">
        <div 
            role="button"
            tabindex="0"
            class="btn btn-circle btn-lg btn-primary shadow-2xl hover:scale-110 transition-transform {dragOver ? 'scale-125 shadow-primary/50' : ''}"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
            on:keydown={(e) => e.key === 'Enter' && document.querySelector('#floating-file-input').click()}
            on:click={() => document.querySelector('#floating-file-input').click()}
            title="Upload another PDF"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
        </div>
        
        <!-- Hidden file input for floating button -->
        <input 
            id="floating-file-input"
            type="file" 
            accept=".pdf"
            on:change={handleFileSelect}
            class="hidden"
        />
    </div>
{/if}

<!-- Loading State -->
{#if isConverting}
    <div class="hero min-h-screen bg-base-200">
        <div class="hero-content text-center">
            <div>
                <div class="loading loading-spinner loading-lg text-primary mb-4"></div>
                <h2 class="text-3xl font-bold mb-4">Converting PDF to Markdown</h2>
                <p class="text-lg text-base-content/70">
                    Processing your PDF file using @opendocsg/pdf2md...
                </p>
                <div class="mt-4 text-sm text-base-content/60">
                    This may take a few moments depending on file size
                </div>
            </div>
        </div>
    </div>
{/if}

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
