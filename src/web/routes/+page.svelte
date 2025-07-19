<script>
    import {onMount} from 'svelte'
    import {fade} from 'svelte/transition'
    import {delay} from 'lodash-es'
    import {getYear} from 'date-fns'
    import {page} from '$app/stores'
    import {goto} from '$app/navigation'
    import {calculateTotalExperienceYears} from '@shared/date-utils.js'
    import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
    import ResumeViewer from '@web/lib/components/ResumeViewer.svelte'
    import PresetSelector from '@web/lib/components/PresetSelector.svelte'
    import SectionControls from '@web/lib/components/SectionControls.svelte'
    import DensityControls from '@web/lib/components/DensityControls.svelte'
    import ResumeStats from '@web/lib/components/ResumeStats.svelte'
    import ComingSoonFeatures from '@web/lib/components/ComingSoonFeatures.svelte'
    import { startCase } from 'lodash-es'
    import {
        contentModeStore,
        densityInitializedStore,
        densityStore,
        handlePresetChange,
        initializeDensity,
        initializeSections,
        mountedStore,
        sectionVisibilityStore,
        timeframeStore,
        updateDensityMode,
        updateSectionVisibility
    } from '@web/lib/stores/url-state.js'

    export let data

    // Resume state management
    let selectedVersion = data.preset || 'full'
    
    // Calculate total years of experience dynamically from data
    $: totalExperienceYears = data.sections?.experience && data.sections?.projects 
        ? calculateTotalExperienceYears(data.sections.experience, data.sections.projects)
        : 10 // fallback
    
    let experienceYears = 0 // Years of experience filter (0 = all, 1-N = filter by years) - will be set to totalExperienceYears

    // Set experienceYears from timeframe store (URL) or default to all experience
    $: if (totalExperienceYears) {
        if ($timeframeStore > 0) {
            experienceYears = Math.min($timeframeStore, totalExperienceYears)
        } else if (experienceYears === 0) {
            experienceYears = totalExperienceYears
        }
    }
    


    // Use stores for URL state management
    let visibleSections = {}
    $: mounted = $mountedStore
    
    // Mobile drawer state
    let mobileDrawerOpen = false
    $: density = $densityStore
    $: contentMode = $contentModeStore
    $: timeframe = $timeframeStore

    // Reset button logic - detect if any filters are active
    $: hasActiveFilters = (() => {
        // Check if preset is not default (full)
        if (selectedVersion !== 'full') return true
        
        // Check if density is not default (100%)
        if (density !== 100) return true
        
        // Check if mode is not default (manual)
        if (contentMode !== 'manual') return true
        
        // Check if timeframe is not default (all years)
        if (totalExperienceYears && experienceYears < totalExperienceYears) return true
        
        // Check if any sections are unchecked in manual mode (only applies in manual mode)
        if (contentMode === 'manual' && Object.keys(visibleSections).length > 0) {
            const hasUncheckedSections = Object.values(visibleSections).some(visible => !visible)
            if (hasUncheckedSections) return true
        }
        
        return false
    })()

    // Reset function - navigate to clean URL
    const resetFilters = () => {
        // Show dramatic animation feedback
        showToast('🔄 Resetting to default view...', 'reset')
        
        // Navigate to clean URL - this will reset everything
        goto('/', { 
            noScroll: true,
            keepFocus: true
        })
    }

    // Initialize from URL parameters on first load
    $: if (data.availableSections) {
        if (!Object.keys($sectionVisibilityStore).length) {
            // First load: initialize sections from URL
            initializeSections($page.url.searchParams, data.availableSections)
        } else {
            // Preset change: preserve existing state for sections that exist
            handlePresetChange(data.availableSections, $sectionVisibilityStore)
        }
    }

    // Sync store changes to local visibleSections (one-way: store -> local)
    $: if (Object.keys($sectionVisibilityStore).length > 0) {
        visibleSections = {...$sectionVisibilityStore}
    }

    // In density mode, sync section checkboxes with server-detected visible sections
    $: if (mounted && data.contentMode === 'density' && data.actuallyVisibleSections) {
        // Directly update local state in density mode (no URL sync to avoid conflicts)
        const densityFilteredVisibility = {}
        for (const section of data.availableSections || []) {
            densityFilteredVisibility[section] = data.actuallyVisibleSections.includes(section)
        }
        visibleSections = densityFilteredVisibility
    }

    // Sync visibleSections changes back to store and URL (when modified by components in manual mode)
    $: if (mounted && data.contentMode !== 'density' && Object.keys(visibleSections).length > 0) {
        // Only update store if visibleSections differs from store (avoid infinite loops)
        if (JSON.stringify(visibleSections) !== JSON.stringify($sectionVisibilityStore)) {
            updateSectionVisibility(visibleSections, $page.url, true)
        }
    }


    // Resume data is now loaded from the server via data.resumeContent

    onMount(() => {
        mountedStore.set(true)

        // Initialize density from URL parameters on mount only
        if (!$densityInitializedStore) {
            initializeDensity($page.url.searchParams)
        }

        console.log('🚀 Resume Customizer Loaded!')
    })


    // Toast notification system
    let toastMessage = ''
    let toastVisible = false
    let toastType = 'info' // 'info', 'success', 'warning', 'error', 'reset'

    const showToast = (message, type = 'info') => {
        toastMessage = message
        toastType = type
        toastVisible = true
        delay(() => {
            toastVisible = false
        }, type === 'reset' ? 2000 : 3000) // Shorter for reset feedback
    }

    const exportToPDF = async () => {
        try {
            console.log('🔄 Generating PDF...')

            // Get the current resume HTML content
            const resumeElement = document.querySelector('.resume-viewer')
            if (!resumeElement) {
                throw new Error('Resume content not found')
            }

            const resumeHTML = resumeElement.innerHTML

            // Extract CSS styles from the page (needed for compatibility with hardcoded HTML approach)
            const allStyles = []

            // Get inline styles from style tags
            const styleTags = document.querySelectorAll('style')
            styleTags.forEach(style => {
                if (style.textContent) {
                    allStyles.push(style.textContent)
                }
            })

            // Get relevant CSS from linked stylesheets (that we can access)
            try {
                Array.from(document.styleSheets).forEach(sheet => {
                    try {
                        if (sheet.cssRules) {
                            const rules = Array.from(sheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('\n')
                            if (rules) {
                                allStyles.push(rules)
                            }
                        }
                    } catch (e) {
                        // Skip stylesheets we can't access (CORS issues)
                        console.warn('Could not access stylesheet:', e)
                    }
                })
            } catch (e) {
                console.warn('Could not access stylesheets:', e)
            }

            const combinedCSS = allStyles.join('\n\n')

            // Generate filename: joseph-sangiorgio-resume-2025.pdf
            const today = new Date()
            const currentYear = getYear(today)
            const filename = `joseph-sangiorgio-resume-${currentYear}.pdf`

            // Call the PDF generation API - use preset method for web app, CSS method for compatibility
            console.log(`📄 Generating PDF with preset: ${selectedVersion}`)
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    html: resumeHTML,
                    preset: selectedVersion,     // Use preset for server-side CSS template selection
                    css: combinedCSS,           // Also send extracted CSS as fallback
                    cssMethod: 'preset',        // Tell backend to prefer preset method
                    filename: filename
                })
            })

            if (!response.ok) {
                throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`)
            }

            // Show toast notification
            showToast('📥 Resume PDF download started!', 'success')

            // Download the PDF
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.style.display = 'none'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            console.log('✅ PDF download started:', filename)

        } catch (error) {
            console.error('❌ PDF export failed:', error)
            showToast(`❌ PDF export failed: ${error.message}`, 'error')
        }
    }


    // Helper function to check if a section is available in current preset
    const isSectionAvailable = (section) => {
        return data.availableSections && data.availableSections.includes(section)
    }

    // Get available sections by category for the sidebar
    $: availableSectionsByCategory = {
        primary: data.availableSections ? data.availableSections.filter(s => ['headline', 'summary', 'experience', 'education', 'skills', 'projects'].includes(s)) : [],
        credentials: data.availableSections ? data.availableSections.filter(s => ['certifications', 'honors-awards', 'courses'].includes(s)) : [],
        socialProof: data.availableSections ? data.availableSections.filter(s => ['recommendations', 'volunteering'].includes(s)) : [],
        personality: data.availableSections ? data.availableSections.filter(s => ['activities', 'objective'].includes(s)) : []
        // Note: 'location' excluded from filtering since it's already displayed in the resume header
    }

    // Store original section content for restoration
    let sectionStorage = {}

    // Apply section visibility with DOM manipulation after animation
    $: if (mounted && Object.keys(visibleSections).length > 0) {
        Object.entries(visibleSections).forEach(([section, visible]) => {
            const elements = document.querySelectorAll(`[data-section="${section}"]`)
            elements.forEach(element => {
                if (visible) {
                    // Showing: restore element if it was removed, then animate in
                    if (element.style.display === 'none') {
                        element.style.display = ''
                        element.classList.add('section-hidden')
                        // Force reflow then animate in
                        element.offsetHeight
                        element.classList.remove('section-hidden')
                    } else {
                        element.classList.remove('section-hidden')
                    }
                } else {
                    // Hiding: animate out then remove from DOM
                    if (!element.classList.contains('section-hidden')) {
                        // Store original content if not already stored
                        if (!sectionStorage[section]) {
                            sectionStorage[section] = {
                                element: element,
                                parent: element.parentNode,
                                nextSibling: element.nextSibling
                            }
                        }

                        element.classList.add('section-hidden')

                        // Remove element during animation (200ms earlier to avoid snap)
                        delay(() => {
                            if (element.classList.contains('section-hidden')) {
                                element.style.display = 'none'
                            }
                        }, 250) // Remove at 250ms instead of 300ms
                    }
                }
            })
        })
    }
</script>

<svelte:head>
    <title>Resume Optimizer - Web App</title>
    <meta name="description" content="Modern resume optimization with AI-powered matching"/>
</svelte:head>

<style>
    /* CSS Grid height collapse animation + fade, then DOM removal */
    :global(.resume-viewer .section-wrapper.section-hidden .section-label) {
        opacity: 0;
        transition: opacity 300ms ease;
    }

    :global(.resume-viewer .section-content) {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 300ms ease, opacity 300ms ease;
        overflow: hidden;
    }

    :global(.resume-viewer .section-wrapper.section-hidden .section-content) {
        grid-template-rows: 0fr;
        opacity: 0;
    }

    :global(.resume-viewer .section-content > *) {
        min-height: 0;
        overflow: hidden;
    }
</style>

<!-- Desktop Header (full width, outside drawer) -->
<header class="hidden md:block bg-base-100 border-b border-base-300 px-6 py-4 relative z-50">
    <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-primary">Resume Optimizer</h1>
            {#if hasActiveFilters}
                <button 
                    class="btn btn-outline btn-secondary btn-sm transition-all hover:scale-105 active:scale-95"
                    on:click={resetFilters}
                    title="Reset all filters to default"
                >
                    ↻ Reset
                </button>
            {/if}
        </div>
        <div class="flex items-center space-x-4">
            <ThemeSelector/>
            <button class="btn btn-primary m-1"
                on:click={exportToPDF}>
                ⬇️ Download PDF
            </button>
        </div>
    </div>
</header>

<!-- DaisyUI Drawer Layout -->
<div class="drawer lg:drawer-open min-h-screen bg-base-200" in:fade={{ delay: 100, duration: 400 }}>
    <!-- Hidden checkbox to control drawer state -->
    <input id="mobile-drawer" type="checkbox" class="drawer-toggle" bind:checked={mobileDrawerOpen} />
    
    <!-- Main content area -->
    <div class="drawer-content flex flex-col">
        <!-- Mobile Header (visible on mobile only) -->
        <header class="block md:hidden bg-base-100 border-b border-base-300 px-4 py-3 relative z-50">
            <div class="flex justify-between items-center">
                <!-- Hamburger/Close Menu Button -->
                <label for="mobile-drawer" class="btn btn-ghost btn-sm p-2 hover:bg-base-200 active:scale-95" aria-label={mobileDrawerOpen ? "Close menu" : "Open menu"}>
                    {#if mobileDrawerOpen}
                        <!-- X/Close Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    {:else}
                        <!-- Hamburger Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    {/if}
                </label>
                
                <!-- App Title + Current Preset + Reset -->
                <div class="flex-1 text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <h1 class="text-lg font-bold text-primary">Resume Optimizer</h1>
                        {#if hasActiveFilters}
                            <button 
                                class="btn btn-outline btn-secondary btn-xs transition-all hover:scale-105 active:scale-95"
                                on:click={resetFilters}
                                title="Reset all filters to default"
                                aria-label="Reset filters"
                            >
                                ↻
                            </button>
                        {/if}
                    </div>
                    {#if selectedVersion !== 'full'}
                        <p class="text-xs text-base-content/60">{startCase(selectedVersion)} Preset</p>
                    {/if}
                </div>
                
                <!-- Export Button (Mobile) -->
                <button 
                    class="btn btn-primary btn-sm font-medium"
                    on:click={exportToPDF}
                    aria-label="Download PDF"
                >
                    ⬇️ PDF
                </button>
            </div>
        </header>
        


        <!-- Resume Content (full width on mobile, beside sidebar on desktop) -->
        <div class="flex-1 h-screen overflow-y-auto">
            <div class="p-4 flex justify-center">
                <div class="w-full max-w-4xl">
                    <div class="card bg-base-100 shadow-sm border border-base-300">
                        <div class="card-body p-4 md:p-8">
                            <ResumeViewer>
                                <div class="resume-with-visibility-controls">
                                    {@html data.resumeContent}
                                </div>
                            </ResumeViewer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Sidebar/Drawer -->
    <div class="drawer-side">
        <!-- Overlay that closes drawer when clicked -->
        <label for="mobile-drawer" aria-label="Close menu" class="drawer-overlay"></label>
        
        <!-- Sidebar content -->
        <div class="bg-base-100 text-base-content min-h-full w-96 border-r border-base-300 overflow-y-auto">
            <div class="p-6 pt-24 lg:pt-6 space-y-6">
                <PresetSelector bind:selectedVersion={selectedVersion} availablePresets={data.availablePresets}/>

                <SectionControls bind:visibleSections={visibleSections} {availableSectionsByCategory}
                                 disabled={contentMode === 'density'}/>

                <DensityControls
                        {density}
                        {contentMode}
                        {experienceYears}
                        {totalExperienceYears}
                        on:densityChange={(e) => updateDensityMode(e.detail.density, contentMode, experienceYears, $page.url)}
                        on:modeChange={(e) => updateDensityMode(density, e.detail.contentMode, experienceYears, $page.url)}
                        on:yearsChange={(e) => {
                            experienceYears = e.detail.experienceYears
                            updateDensityMode(density, contentMode, experienceYears, $page.url)
                            console.log('🕐 Years changed:', experienceYears, 'of', totalExperienceYears, 'total')
                        }}
                />

                <ResumeStats {data} {visibleSections} {density}/>

                <ComingSoonFeatures/>
            </div>
        </div>
    </div>
</div>

<!-- Toast Notification -->
{#if toastVisible}
    <div class="toast toast-bottom toast-center z-50">
        <div class="alert shadow-lg transition-all duration-300 {
            toastType === 'reset' ? 'alert-warning border-2 border-warning animate-pulse scale-110' : 
            toastType === 'success' ? 'alert-success' :
            toastType === 'error' ? 'alert-error' :
            'bg-base-100 text-base-content border border-base-300'
        }">
            <span class="{toastType === 'reset' ? 'font-bold text-lg' : ''}">{toastMessage}</span>
        </div>
    </div>
{/if}
