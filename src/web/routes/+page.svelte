<script>
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { delay } from 'lodash-es'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
  import ResumeViewer from '@web/lib/components/ResumeViewer.svelte'
  import PresetSelector from '@web/lib/components/PresetSelector.svelte'
  import SectionControls from '@web/lib/components/SectionControls.svelte'
  import DensityControls from '@web/lib/components/DensityControls.svelte'
  import ResumeStats from '@web/lib/components/ResumeStats.svelte'
  import ComingSoonFeatures from '@web/lib/components/ComingSoonFeatures.svelte'
  import { 
    sectionVisibilityStore, 
    mountedStore, 
    initializeSections, 
    updateSectionVisibility,
    handlePresetChange 
  } from '@web/lib/stores/url-state.js'
  
  export let data
  
  // Resume state management  
  let selectedVersion = data.preset || 'full'
  let density = 100 // Content density: 0-100% (0 = minimal, 100 = full content)
  
  // URL state management using stores
  let visibleSections = {}
  $: mounted = $mountedStore
  
  // Initialize section visibility from URL parameters and handle preset changes
  $: if (data.availableSections) {
    if (!Object.keys($sectionVisibilityStore).length) {
      // First load: initialize from URL
      initializeSections($page.url.searchParams, data.availableSections)
    } else {
      // Preset change: preserve existing state for sections that exist
      handlePresetChange(data.availableSections, $sectionVisibilityStore)
    }
  }
  
  // Sync store changes to local visibleSections (one-way: store -> local)
  $: if (Object.keys($sectionVisibilityStore).length > 0) {
    visibleSections = { ...$sectionVisibilityStore }
  }
  
  // Sync visibleSections changes back to store and URL (when modified by components)
  $: if (mounted && Object.keys(visibleSections).length > 0) {
    // Only update store if visibleSections differs from store (avoid infinite loops)
    if (JSON.stringify(visibleSections) !== JSON.stringify($sectionVisibilityStore)) {
      updateSectionVisibility(visibleSections, $page.url, true)
    }
  }
  

  
  // Resume data is now loaded from the server via data.resumeContent
  
  onMount(() => {
    mountedStore.set(true)
    console.log('🚀 Resume Customizer Loaded!')
  })
  

  

  
  // Toast notification system
  let toastMessage = ''
  let toastVisible = false
  
  const showToast = (message) => {
    toastMessage = message
    toastVisible = true
    delay(() => {
      toastVisible = false
    }, 3000)
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
      
      // Extract CSS styles from the page
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
      const currentYear = today.getFullYear()
      const filename = `joseph-sangiorgio-resume-${currentYear}.pdf`
      
      // Call the PDF generation API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: resumeHTML,
          css: combinedCSS,
          filename: filename
        })
      })
      
      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`)
      }
      
      // Show toast notification
      showToast('📥 Resume PDF download started!')
      
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
      showToast(`❌ PDF export failed: ${error.message}`)
    }
  }
  

  

  
  // Helper function to check if a section is available in current preset
  const isSectionAvailable = (section) => {
    return data.availableSections && data.availableSections.includes(section)
  }
  
  // Get available sections by category for the sidebar
  $: availableSectionsByCategory = {
    primary: data.availableSections ? data.availableSections.filter(s => ['experience', 'education', 'skills', 'projects'].includes(s)) : [],
    credentials: data.availableSections ? data.availableSections.filter(s => ['certifications', 'honors-awards', 'courses'].includes(s)) : [],
    socialProof: data.availableSections ? data.availableSections.filter(s => ['recommendations', 'volunteering'].includes(s)) : [],
    personality: data.availableSections ? data.availableSections.filter(s => ['activities', 'objective'].includes(s)) : []
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
  <meta name="description" content="Modern resume optimization with AI-powered matching" />
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

<div class="min-h-screen bg-base-200" in:fade={{ delay: 100, duration: 400 }}>
  <!-- Header -->
  <header class="bg-base-100 border-b border-base-300 px-6 py-4">
    <div class="flex justify-between items-center max-w-7xl mx-auto">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-primary">🚀 Resume Optimizer</h1>
      </div>
      <div class="flex items-center space-x-4">
        <ThemeSelector />
        <button class="btn btn-primary transition-transform hover:scale-105 active:scale-95" on:click={exportToPDF}>
          📥 Export PDF
        </button>
      </div>
    </div>
  </header>

  <!-- Main Split-Screen Layout -->
  <div class="flex max-w-7xl mx-auto">
    <!-- Left Control Panel -->
    <div class="w-96 bg-base-100 border-r border-base-300 h-screen overflow-y-auto">
      <div class="p-6 space-y-6">
        
        <PresetSelector bind:selectedVersion={selectedVersion} availablePresets={data.availablePresets} />

        <SectionControls bind:visibleSections={visibleSections} {availableSectionsByCategory} />

        <DensityControls bind:density={density} />

        <ResumeStats {data} {visibleSections} {density} />

        <ComingSoonFeatures />

      </div>
    </div>

    <!-- Right Resume Preview -->
    <div class="flex-1 h-screen overflow-y-auto">
      <div class="p-4">
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-8">
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

<!-- Toast Notification -->
{#if toastVisible}
  <div class="toast toast-bottom toast-center z-50">
    <div class="alert bg-base-100 text-base-content border border-base-300 shadow-lg">
      <span>{toastMessage}</span>
    </div>
  </div>
{/if}
