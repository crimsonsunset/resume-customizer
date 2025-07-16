<script>
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import { delay } from 'lodash-es'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
  import ResumeViewer from '@web/lib/components/ResumeViewer.svelte'
  
  export let data
  
  let mounted = false
  
  // Resume state management  
  let selectedVersion = data.preset || 'full'
  let showPresetDropdown = false
  let density = 'medium'
  
  // Section visibility - only include sections that are actually rendered in current preset
  let visibleSections = {}
  
  // Section name mapping for compact URL encoding
  const sectionCodes = {
    'objective': 'obj',
    'experience': 'exp', 
    'projects': 'proj',
    'education': 'edu',
    'skills': 'skills',
    'certifications': 'cert',
    'courses': 'course',
    'volunteering': 'vol',
    'honors-awards': 'award',
    'recommendations': 'rec',
    'activities': 'act'
  }
  
  // Reverse mapping for decoding
  const codeToSection = Object.fromEntries(
    Object.entries(sectionCodes).map(([section, code]) => [code, section])
  )
  
  /**
   * Encode visible sections to URL-friendly string
   * @param {Object} sections - Object with section names as keys, boolean visibility as values
   * @returns {string} Comma-separated compact codes for visible sections
   */
  const encodeSectionsForURL = (sections) => {
    return Object.entries(sections)
      .filter(([_, visible]) => visible)
      .map(([section, _]) => sectionCodes[section] || section)
      .sort()
      .join(',')
  }
  
  /**
   * Decode URL string to sections visibility object
   * @param {string} urlString - Comma-separated compact codes
   * @param {Array} availableSections - Available sections from server
   * @returns {Object} Section visibility object
   */
  const decodeSectionsFromURL = (urlString, availableSections) => {
    if (!urlString || !availableSections) return {}
    
    const visibleCodes = urlString.split(',').filter(Boolean)
    const visibleSectionNames = visibleCodes.map(code => codeToSection[code] || code)
    
    const result = {}
    availableSections.forEach(section => {
      result[section] = visibleSectionNames.includes(section)
    })
    return result
  }
  
  // Initialize visibility state from URL first, then from available sections
  $: if (data.availableSections) {
    const urlSections = $page.url.searchParams.get('sections')
    
    if (urlSections && !Object.keys(visibleSections).length) {
      // First load: initialize from URL if present
      visibleSections = decodeSectionsFromURL(urlSections, data.availableSections)
    } else if (!Object.keys(visibleSections).length) {
      // First load: no URL params, default all to visible
      const newVisibleSections = {}
      data.availableSections.forEach(section => {
        newVisibleSections[section] = true
      })
      visibleSections = newVisibleSections
    } else {
      // Subsequent preset changes: preserve existing state for sections that exist
      const newVisibleSections = {}
      data.availableSections.forEach(section => {
        newVisibleSections[section] = visibleSections[section] ?? true
      })
      visibleSections = newVisibleSections
    }
  }
  
  // Update URL when section visibility changes
  $: if (mounted && Object.keys(visibleSections).length > 0) {
    const encodedSections = encodeSectionsForURL(visibleSections)
    const currentSections = $page.url.searchParams.get('sections')
    
    if (encodedSections !== currentSections) {
      const newURL = new URL($page.url)
      if (encodedSections) {
        newURL.searchParams.set('sections', encodedSections)
      } else {
        newURL.searchParams.delete('sections')
      }
      
      // Update URL without causing navigation/reload
      goto(newURL.toString(), { 
        replaceState: true, 
        noScroll: true,
        keepFocus: true
      })
    }
  }
  
  // Accordion state - Primary expanded, others collapsed
  let accordionState = {
    primary: true,
    credentials: false,
    socialProof: false,
    personality: false
  }
  
  // Resume data is now loaded from the server via data.resumeContent
  
  onMount(() => {
    mounted = true
    console.log('🚀 Resume Customizer Loaded!')
  })
  

  
  const selectAllSections = () => {
    Object.keys(visibleSections).forEach(section => {
      visibleSections[section] = true
    })
    // Also expand all accordions to show what was selected
    accordionState.primary = true
    accordionState.credentials = true
    accordionState.socialProof = true
    accordionState.personality = true
  }
  
  const selectNoneSections = () => {
    Object.keys(visibleSections).forEach(section => {
      visibleSections[section] = false
    })
  }
  
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
      
      // Generate filename: joseph-sangiorgio-resume-2025-07-15.pdf
      const today = new Date()
      const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
      const filename = `joseph-sangiorgio-resume-${dateString}.pdf`
      
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
  
  const changePreset = (presetValue) => {
    selectedVersion = presetValue
    showPresetDropdown = false
    
    // Navigate to new preset URL while preserving section visibility
    const newURL = new URL($page.url)
    if (presetValue === 'full') {
      newURL.searchParams.delete('preset')
    } else {
      newURL.searchParams.set('preset', presetValue)
    }
    
    // Use SvelteKit navigation for smoother experience
    goto(newURL.toString(), { 
      noScroll: true,
      keepFocus: true
    })
  }
  
  // Get current preset info for display
  $: currentPreset = data.availablePresets.find(p => p.value === selectedVersion) || data.availablePresets[0]
  
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
        
        <!-- Version Selector -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📋 Resume Version</h3>
            
            <!-- DaisyUI Dropdown -->
            <div class="dropdown w-full" class:dropdown-open={showPresetDropdown}>
              <div tabindex="0" role="button" class="btn btn-sm w-full justify-between transition-all hover:shadow-md" 
                   on:click={() => showPresetDropdown = !showPresetDropdown}
                   on:keydown={(e) => e.key === 'Enter' && (showPresetDropdown = !showPresetDropdown)}
                   on:blur={() => delay(() => showPresetDropdown = false, 150)}>
                <span class="text-left truncate">{currentPreset.name}</span>
                <svg class="w-4 h-4 transition-transform" class:rotate-180={showPresetDropdown} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              
              <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-1 border border-base-300">
                {#each data.availablePresets as preset}
                  <li>
                    <button class="text-left" on:click={() => changePreset(preset.value)}
                            class:active={preset.value === selectedVersion}>
                      <div>
                        <div class="font-medium">{preset.name}</div>
                        <div class="text-xs text-base-content/70">{preset.description}</div>
                      </div>
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </div>

        <!-- Section Toggles -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="card-title text-sm">👁️ Visible Sections</h3>
              <div class="flex space-x-1">
                <button 
                  class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                  on:click={selectAllSections}
                  title="Select All"
                >
                  All
                </button>
                <button 
                  class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                  on:click={selectNoneSections}
                  title="Select None"
                >
                  None
                </button>
              </div>
            </div>
            <div class="space-y-2">
              
              <!-- Primary Sections (Main Content) -->
              <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.primary}>
                <input type="checkbox" bind:checked={accordionState.primary} />
                <div class="collapse-title text-sm font-medium">
                  📋 Primary Sections
                </div>
                <div class="collapse-content space-y-2">
                  {#each availableSectionsByCategory.primary as section}
                    <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
                      <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
                      <span class="text-sm capitalize">{section.replace('-', ' & ')}</span>
                    </label>
                  {/each}
                  {#if availableSectionsByCategory.primary.length === 0}
                    <p class="text-xs text-base-content/60">No primary sections in this preset</p>
                  {/if}
                </div>
              </div>

              <!-- Credentials (Proof Points) -->
              <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.credentials}>
                <input type="checkbox" bind:checked={accordionState.credentials} />
                <div class="collapse-title text-sm font-medium">
                  🏆 Credentials
                </div>
                <div class="collapse-content space-y-2">
                  {#each availableSectionsByCategory.credentials as section}
                    <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
                      <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
                      <span class="text-sm">
                        {#if section === 'honors-awards'}Honors & Awards
                        {:else if section === 'courses'}Relevant Coursework  
                        {:else}{section.charAt(0).toUpperCase() + section.slice(1)}{/if}
                      </span>
                    </label>
                  {/each}
                  {#if availableSectionsByCategory.credentials.length === 0}
                    <p class="text-xs text-base-content/60">No credential sections in this preset</p>
                  {/if}
                </div>
              </div>

              <!-- Social Proof -->
              <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.socialProof}>
                <input type="checkbox" bind:checked={accordionState.socialProof} />
                <div class="collapse-title text-sm font-medium">
                  💬 Social Proof
                </div>
                <div class="collapse-content space-y-2">
                  {#each availableSectionsByCategory.socialProof as section}
                    <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
                      <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
                      <span class="text-sm capitalize">{section}</span>
                    </label>
                  {/each}
                  {#if availableSectionsByCategory.socialProof.length === 0}
                    <p class="text-xs text-base-content/60">No social proof sections in this preset</p>
                  {/if}
                </div>
              </div>

              <!-- Personality -->
              <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.personality}>
                <input type="checkbox" bind:checked={accordionState.personality} />
                <div class="collapse-title text-sm font-medium">
                  🎭 Personality
                </div>
                <div class="collapse-content space-y-2">
                  {#each availableSectionsByCategory.personality as section}
                    <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
                      <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
                      <span class="text-sm">
                        {#if section === 'activities'}Activities & Interests
                        {:else}Objective{/if}
                      </span>
                    </label>
                  {/each}
                  {#if availableSectionsByCategory.personality.length === 0}
                    <p class="text-xs text-base-content/60">No personality sections in this preset</p>
                  {/if}
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Density Controls -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📏 Spacing Density</h3>
            <div class="btn-group btn-group-vertical w-full">
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'compact'}
                on:click={() => density = 'compact'}
              >
                Compact
              </button>
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'medium'}
                on:click={() => density = 'medium'}
              >
                Medium
              </button>
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'spacious'}
                on:click={() => density = 'spacious'}
              >
                Spacious
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📊 Resume Stats</h3>
            <div class="stats stats-vertical shadow-none text-xs">
              <div class="stat py-2">
                <div class="stat-title text-xs">Experience Items</div>
                <div class="stat-value text-lg">8</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Projects</div>
                <div class="stat-value text-lg">5</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Skills</div>
                <div class="stat-value text-lg">30+</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coming Soon Features -->
        <div class="card bg-base-100 shadow-sm border border-base-300 opacity-60">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">🔮 Coming Soon</h3>
            <div class="space-y-2 text-xs">
              <div class="flex items-center space-x-2">
                <span>🎯</span>
                <span>Job Description Matcher</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>📝</span>
                <span>Content Optimizer</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>📊</span>
                <span>ATS Score Checker</span>
              </div>
            </div>
          </div>
        </div>

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
