<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { delay } from 'lodash-es'

    // File upload state
    let selectedFile = null
    let isConverting = false
    let conversionResult = null
    let errorMessage = null
    let dragOver = false

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

    // File handling
    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
            selectedFile = file
            errorMessage = null
            conversionResult = null
            console.log('📁 File selected:', file.name, file.type, file.size)
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

    const handleDrop = (event) => {
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
            } else {
                errorMessage = 'Please select a PDF file'
                showToast('❌ Only PDF files are supported', 'error')
            }
        }
    }

    // PDF to Markdown conversion using @opendocsg/pdf2md
    const convertPdfToMarkdown = async () => {
        if (!selectedFile) {
            errorMessage = 'Please select a PDF file first'
            showToast('❌ No file selected', 'error')
            return
        }

        if (selectedFile.type !== 'application/pdf') {
            errorMessage = 'Please select a PDF file'
            showToast('❌ Only PDF files are supported', 'error')
            return
        }

        // Validate file size (100MB limit for client-side processing)
        const maxSize = 100 * 1024 * 1024 // 100MB
        if (selectedFile.size > maxSize) {
            errorMessage = 'File size exceeds 100MB limit'
            showToast('❌ File too large (max 100MB)', 'error')
            return
        }

        isConverting = true
        errorMessage = null
        conversionResult = null

        try {
            console.log('🔄 Converting PDF to Markdown using @opendocsg/pdf2md...')
            showToast('📋 Processing PDF with pdf2md...', 'info')

            // Import pdf2md dynamically for client-side processing
            const pdf2md = await import('@opendocsg/pdf2md')
            
            // Convert file to ArrayBuffer for pdf2md
            const fileBuffer = await selectedFile.arrayBuffer()
            console.log('📄 File buffer created, size:', fileBuffer.byteLength)

            // Convert PDF to markdown using pdf2md
            const markdown = await pdf2md.default(fileBuffer)
            console.log('✅ PDF conversion completed')

            if (!markdown || !markdown.trim()) {
                throw new Error('No content could be extracted from the PDF. The PDF might be image-based, encrypted, or corrupted.')
            }

            // Add document metadata header
            const documentHeader = `# ${selectedFile.name.replace('.pdf', '')}\n\n`
            + `*Converted from PDF using @opendocsg/pdf2md on ${new Date().toLocaleDateString()}*\n\n`
            + `**Document Info:**\n`
            + `- Original file: ${selectedFile.name}\n`
            + `- File size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB\n`
            + `- Content length: ${markdown.length.toLocaleString()} characters\n\n`
            + `---\n\n`

            const finalMarkdown = documentHeader + markdown

            conversionResult = finalMarkdown
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



    // Download markdown file
    const downloadMarkdown = () => {
        if (!conversionResult) return

        const filename = selectedFile.name.replace('.pdf', '.md')
        const blob = new Blob([conversionResult], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        showToast('📥 Markdown file download started!', 'success')
    }

    // Copy to clipboard
    const copyToClipboard = async () => {
        if (!conversionResult) return

        try {
            await navigator.clipboard.writeText(conversionResult)
            showToast('📋 Markdown copied to clipboard!', 'success')
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            showToast('❌ Failed to copy to clipboard', 'error')
        }
    }

    onMount(() => {
        console.log('🔧 Admin page mounted')
    })
</script>

<svelte:head>
    <title>Admin - Gotenberg Interface</title>
    <meta name="description" content="Admin interface for Gotenberg PDF processing"/>
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
                    <div class="mt-6">
                        <button 
                            class="btn btn-primary w-full"
                            disabled={!selectedFile || isConverting}
                            on:click={convertPdfToMarkdown}
                        >
                            {#if isConverting}
                                <span class="loading loading-spinner loading-sm"></span>
                                Converting...
                            {:else}
                                🔄 Convert PDF to Markdown
                            {/if}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Results Section -->
            <div class="card bg-base-100 shadow-lg">
                <div class="card-body">
                    <h2 class="card-title text-xl mb-4">📝 Conversion Results</h2>
                    
                    {#if conversionResult}
                        <div class="space-y-4">
                            <!-- Action Buttons -->
                            <div class="flex gap-2">
                                <button 
                                    class="btn btn-success btn-sm"
                                    on:click={downloadMarkdown}
                                >
                                    ⬇️ Download .md
                                </button>
                                <button 
                                    class="btn btn-info btn-sm"
                                    on:click={copyToClipboard}
                                >
                                    📋 Copy to Clipboard
                                </button>
                            </div>

                            <!-- Markdown Preview -->
                            <div class="space-y-2">
                                <h3 class="font-medium">Preview:</h3>
                                <div class="bg-base-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <pre class="text-sm whitespace-pre-wrap">{conversionResult}</pre>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center py-8 text-base-content/60">
                            <div class="text-4xl mb-4">📝</div>
                            <p>Convert a PDF file to see the markdown result here</p>
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