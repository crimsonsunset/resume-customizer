<script>
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { delay } from 'lodash-es'
  import { get } from 'svelte/store'
  import { 
    tourActiveStore, 
    tourCompletedState, 
    markTourCompleted, 
    startTour as startTourState,
    cancelTour as cancelTourState
  } from '@web/lib/stores/tour-state.js'
  import tourConfig from '@web/config/tour-config.json'
  import Button from '@web/lib/components/ui/Button.svelte'

  const dispatch = createEventDispatcher()
  
  let driverObj
  let mounted = false
  let destroyed = false
  let driver
  let escapeHandler
  let initTimerId
  let autoStartTimerId
  
  export let autoStart = false
  export let showTourButton = true
  
  onMount(async () => {
    // Dynamic import for Driver.js to avoid SSR issues
    try {
      const driverModule = await import('driver.js')
      if (destroyed) return
      driver = driverModule.driver
      
      initTimerId = delay(() => {
        if (destroyed) return
        mounted = true
        initializeTour()
        
        // Auto-start for new users if enabled
        if (autoStart && !get(tourCompletedState) && tourConfig.settings.enabled) {
          autoStartTimerId = delay(() => {
            if (destroyed) return
            startTour()
          }, 1000) // Delay to ensure page is fully loaded
        }
      }, 100)
    } catch (error) {
      console.error('Failed to load Driver.js:', error)
    }
  })

  /**
   * Open the mobile/tablet drawer when tour targets live inside it.
   */
  const ensureDrawerOpen = () => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    const toggle = document.getElementById('mobile-drawer')
    if (toggle && !toggle.checked) {
      document.querySelector('label[for="mobile-drawer"]')?.click()
    }
  }

  /**
   * Open the mobile overflow menu so the PDF control is visible below md.
   */
  const ensureMobilePdfVisible = () => {
    const pdfButton = document.querySelector("[data-tour='mobile-pdf-download']")
    if (pdfButton && pdfButton.offsetParent !== null) return
    document.querySelector("[data-tour='mobile-menu-trigger']")?.click()
  }

  /**
   * Resolve the PDF tour target for the active breakpoint.
   * @returns {Element|null} Visible PDF control element
   */
  const resolvePdfElement = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      ensureMobilePdfVisible()
      return document.querySelector("[data-tour='mobile-pdf-download']")
    }
    return document.querySelector("[data-tour='pdf-download']")
  }

  /**
   * Resolve a drawer-hosted tour target, opening the drawer first when needed.
   * @param {string} selector CSS selector for the target
   * @returns {Element|null} Target element after drawer prep
   */
  const resolveDrawerElement = (selector) => {
    ensureDrawerOpen()
    return document.querySelector(selector)
  }
  
  /**
   * Initialize the Driver.js tour with configuration
   */
  const initializeTour = () => {
    if (!driver || !mounted || destroyed) return
    
    // Convert tour config to Driver.js format
    const steps = tourConfig.steps.map(step => {
      // Special handling for the welcome step (no attachTo = centered)
      if (!step.attachTo) {
        return {
          popover: {
            title: step.title,
            description: step.text
          }
        }
      }

      if (step.id === 'pdf-output') {
        return {
          element: () => resolvePdfElement(),
          popover: {
            title: step.title,
            description: step.text,
            side: step.attachTo.on || 'top',
            align: 'start'
          }
        }
      }

      if (step.id === 'presets' || step.id === 'controls') {
        const selector = step.attachTo.element
        return {
          element: () => resolveDrawerElement(selector),
          popover: {
            title: step.title,
            description: step.text,
            side: step.attachTo.on || 'bottom',
            align: 'start'
          }
        }
      }
      
      // Regular steps with element attachment
      return {
        element: step.attachTo.element,
        popover: {
          title: step.title,
          description: step.text,
          side: step.attachTo.on || 'bottom',
          align: 'start'
        }
      }
    })

    driverObj = driver({
      showProgress: true,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      disableActiveInteraction: false,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Previous', 
      doneBtnText: 'Done ✨',
      closeBtnText: '✕',
      steps: steps,
      onDestroyStarted: (_element, _step, _opts) => {
        // Driver.js waits here when this hook exists; continue teardown.
        driverObj?.destroy()
      },
      onDestroyed: (_element, _step, opts) => {
        removeEscapeListener()
        if (opts?.reason === 'done') {
          markTourCompleted()
          dispatch('tourCompleted')
          console.log('🎯 Tour completed successfully')
          return
        }
        cancelTourState()
        dispatch('tourCancelled')
        console.log('🚫 Tour cancelled by user')
      }
    })
  }
  
  /**
   * Start the tour manually
   */
  const startTour = () => {
    if (driverObj && mounted && !destroyed && tourConfig.settings.enabled) {
      startTourState()
      dispatch('tourStarted')
      addEscapeListener()
      driverObj.drive()
    }
  }
  
  /**
   * Reset and restart the tour
   */
  export const retakeTour = () => {
    if (driverObj && mounted && !destroyed) {
      // Reset completion state
      tourCompletedState.set(false)
      startTour()
    }
  }
  
  /**
   * Add escape key listener while the tour is active
   */
  const addEscapeListener = () => {
    removeEscapeListener()
    escapeHandler = (event) => {
      if (event.key !== 'Escape') return
      if (!get(tourActiveStore) || !driverObj) return
      console.log('🔑 ESC key pressed - closing tour')
      event.preventDefault()
      event.stopPropagation()
      driverObj.destroy()
    }
    document.addEventListener('keydown', escapeHandler, true)
  }
  
  /**
   * Remove escape key listener
   */
  const removeEscapeListener = () => {
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler, true)
      escapeHandler = null
    }
  }
  
  onDestroy(() => {
    destroyed = true
    if (initTimerId) clearTimeout(initTimerId)
    if (autoStartTimerId) clearTimeout(autoStartTimerId)
    removeEscapeListener()
    if (driverObj) {
      driverObj.destroy()
    }
  })
</script>

{#if tourConfig.settings.enabled && mounted && showTourButton}
  {#if $tourCompletedState}
    <!-- Show retake button for completed users -->
    <Button 
      variant="outline" 
      size="sm"
      on:click={retakeTour}
      ariaLabel="Retake tour of resume features"
    >
      🎯 Retake Tour
    </Button>
  {:else}
    <!-- Show initial tour button -->
    <Button 
      variant="ghost" 
      size="sm"
      on:click={startTour}
      ariaLabel="Start interactive tour"
    >
      🎯 Take Tour
    </Button>
  {/if}
{/if}
