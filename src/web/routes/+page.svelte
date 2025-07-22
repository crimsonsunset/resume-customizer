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
    import MobileMenu from '@web/lib/components/ui/MobileMenu.svelte'
    import { startCase } from 'lodash-es'
    import {
        densityInitializedStore,
        densityStore,
        handlePresetChange,
        initializeDensity,
        initializeSections,
        mountedStore,
        sectionVisibilityStore,
        timeframeStore,
        updateFilters,
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
    $: timeframe = $timeframeStore
    
    // Preset transition flag to prevent reactive loops
    let isPresetTransitioning = false

    // Reset button logic - detect if any filters are active
    $: hasActiveFilters = (() => {
        // Check if preset is not default (full)
        if (selectedVersion !== 'full') return true
        
        // Check if density is not default (100%)
        if (density !== 100) return true
        
        // Check if timeframe is not default (all years)
        if (totalExperienceYears && experienceYears < totalExperienceYears) return true
        
        // Check if any sections are unchecked (always applies now)
        if (Object.keys(visibleSections).length > 0) {
            const hasUncheckedSections = Object.values(visibleSections).some(visible => !visible)
            if (hasUncheckedSections) return true
        }
        
        return false
    })()

    // Reset function - direct store updates for immediate UI response
    const resetFilters = () => {
        console.log('🔄 Resetting filters directly...')
        
        // 1. Directly update all stores to default values
        densityStore.set(100)
        timeframeStore.set(totalExperienceYears) // Reset to all years
        console.log('✅ Updated density to 100%, timeframe to', totalExperienceYears, 'years')
        
        // 2. Reset all sections to visible
        const allSectionsVisible = {}
        for (const section of data.availableSections) {
            allSectionsVisible[section] = true
        }
        sectionVisibilityStore.set(allSectionsVisible)
        console.log('✅ Reset all sections to visible:', Object.keys(allSectionsVisible))
        
        // 3. Reset preset to 'full'
        selectedVersion = 'full'
        console.log('✅ Reset preset to full')
        
        // 4. Update local variables to match stores (ensure sync)
        experienceYears = totalExperienceYears
        visibleSections = {...allSectionsVisible}
        console.log('✅ Synced local variables')
        
        // 5. Show reset toast notification
        showToast('↻ Reset to full professional history', 'preset')
        
        // 6. Navigate to clean URL for bookmarking
        goto('/', { 
            noScroll: true,
            keepFocus: true
        })
        
        console.log('🎯 Reset complete - stores updated directly!')
    }

    // Initialize from URL parameters on first load (with transition guard)
    $: if (data.availableSections) {
        // Block section sync during preset transitions to prevent loops
        isPresetTransitioning = true
        console.log('🎯 Preset transition started, blocking section sync')
        
        if (!Object.keys($sectionVisibilityStore).length) {
            // First load: initialize sections from URL
            initializeSections($page.url.searchParams, data.availableSections)
            console.log('✅ Initialized sections from URL')
        } else {
            // Preset change: preserve existing state for sections that exist
            handlePresetChange(data.availableSections, $sectionVisibilityStore)
            
            // Show toast notification for preset changes (but not during reset)
            const currentPreset = data.availablePresets?.find(p => p.value === (data.preset || 'full'))
            if (currentPreset && mounted && currentPreset.value !== 'full' && selectedVersion !== 'full') {
                delay(() => {
                    showToast(`✅ ${currentPreset.name} applied`, 'preset')
                }, 200) // Small delay to ensure transition is visible
            }
            
            console.log('🔄 Preset change handled')
        }
        
        // Clear transition flag after brief delay to allow section sync to resume
        delay(() => {
            isPresetTransitioning = false
            console.log('✅ Preset transition complete, section sync re-enabled')
        }, 150)
    }

    // Sync store changes to local visibleSections (one-way: store -> local)
    $: if (Object.keys($sectionVisibilityStore).length > 0) {
        visibleSections = {...$sectionVisibilityStore}
    }

    // Sync visibleSections changes back to store and URL (but skip during preset transitions)
    $: if (mounted && Object.keys(visibleSections).length > 0 && !isPresetTransitioning) {
        // Only update store if visibleSections differs from store (avoid infinite loops)
        if (JSON.stringify(visibleSections) !== JSON.stringify($sectionVisibilityStore)) {
            updateSectionVisibility(visibleSections, $page.url, true)
            console.log('🔗 Updated URL from section changes')
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
    let toastType = 'info' // 'info', 'success', 'warning', 'error', 'reset', 'preset'

    // PDF export loading state
    let isExportingPDF = false

    const showToast = (message, type = 'info') => {
        toastMessage = message
        toastType = type
        toastVisible = true
        delay(() => {
            toastVisible = false
        }, type === 'reset' ? 2750 : type === 'preset' ? 3250 : 3750) // Custom timing for different types
    }

    const exportToPDF = async () => {
        if (isExportingPDF) return // Prevent multiple simultaneous exports
        
        isExportingPDF = true
        
        try {
            console.log('🔄 Generating PDF...')
            
            // Show preparing toast immediately
            showToast('📋 Preparing Resume Download...', 'info')

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

            // Call the Gotenberg PDF generation API - use preset method for web app, CSS method for compatibility
            console.log(`📄 Generating PDF with preset: ${selectedVersion}`)
            const response = await fetch('/api/generate-pdf-gotenberg', {
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
        } finally {
            // Reset loading state regardless of success or failure
            isExportingPDF = false
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
    
    // Get current preset info for display
    $: currentPreset = data.availablePresets?.find(p => p.value === selectedVersion) || data.availablePresets?.[0]

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
            <div>
                <h1 class="text-2xl font-bold text-primary">Resume Optimizer</h1>
                {#if currentPreset && selectedVersion !== 'full'}
                    <p class="text-sm text-base-content/60 flex items-center space-x-1 mt-1">
                        <span class="badge badge-primary badge-xs opacity-80">Preset</span>
                        <span>{currentPreset.name}</span>
                    </p>
                {/if}
            </div>
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
                disabled={isExportingPDF}
                on:click={exportToPDF}>
                {#if isExportingPDF}
                    <span class="loading loading-spinner loading-sm"></span>
                {:else}
                    ⬇️ Download PDF
                {/if}
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
                    {#if currentPreset && selectedVersion !== 'full'}
                        <div class="text-center">
                            <p class="text-xs text-base-content/60 flex items-center justify-center space-x-1">
                                <span class="badge badge-primary badge-xs opacity-80">Preset</span>
                                <span>{currentPreset.name}</span>
                            </p>
                        </div>
                    {/if}
                </div>
                
                <!-- Mobile Menu (Ellipsis with Download PDF + Theme) -->
                <MobileMenu onExportToPDF={exportToPDF} {isExportingPDF} />
            </div>
        </header>
        


        <!-- Resume Content (full width on mobile, beside sidebar on desktop) -->
        <div class="flex-1 h-screen overflow-y-auto">
            <div class="p-4 flex justify-center">
                <div class="w-full max-w-4xl">
                    <div class="card shadow-sm border" style="background: white; border-color: #e5e7eb;">
                        <div class="card-body p-4 md:p-8" style="background: white;">
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

                <SectionControls bind:visibleSections={visibleSections} {availableSectionsByCategory}/>

                <DensityControls
                        {density}
                        {experienceYears}
                        {totalExperienceYears}
                        on:densityChange={(e) => updateFilters(e.detail.density, experienceYears, $page.url)}
                        on:yearsChange={(e) => {
                            experienceYears = e.detail.experienceYears
                            updateFilters(density, experienceYears, $page.url)
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
            toastType === 'preset' ? 'alert-info border-2 border-primary' :
            toastType === 'success' ? 'alert-success' :
            toastType === 'error' ? 'alert-error' :
            'bg-base-100 text-base-content border border-base-300'
        }">
            <span class="{toastType === 'reset' ? 'font-bold text-lg' : ''}">{toastMessage}</span>
        </div>
    </div>
{/if}
