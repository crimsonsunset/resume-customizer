<script>
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { delay } from 'lodash-es'
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
  let driver
  let escapeHandler
  
  export let autoStart = false
  export let showTourButton = true
  
  onMount(async () => {
    // Dynamic import for Driver.js to avoid SSR issues
    try {
      const driverModule = await import('driver.js')
      driver = driverModule.driver
      
      delay(() => {
        mounted = true
        initializeTour()
        
        // Auto-start for new users if enabled
        if (autoStart && !$tourCompletedState && tourConfig.settings.enabled) {
          delay(() => startTour(), 1000) // Delay to ensure page is fully loaded
        }
      }, 100)
    } catch (error) {
      console.error('Failed to load Driver.js:', error)
    }
  })
  
  /**
   * Initialize the Driver.js tour with configuration
   */
  const initializeTour = () => {
    if (!driver || !mounted) return
    
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
      onDestroyed: () => {
        markTourCompleted()
        dispatch('tourCompleted')
        console.log('🎯 Tour completed successfully')
        removeEscapeListener()
      },
      onDestroyStarted: () => {
        cancelTourState()
        dispatch('tourCancelled')
        console.log('🚫 Tour cancelled by user')
        removeEscapeListener()
      },
      onCloseClick: () => {
        console.log('🚫 Close button clicked')
        driverObj?.destroy()
      },
      onDoneClick: () => {
        console.log('✅ Done button clicked')
        driverObj?.destroy()
      }
    })
    
    // Add explicit ESC key listener since Driver.js doesn't always handle it properly
    addEscapeListener()
  }
  
  /**
   * Start the tour manually
   */
  const startTour = () => {
    if (driverObj && mounted && tourConfig.settings.enabled) {
      startTourState()
      dispatch('tourStarted')
      driverObj.drive()
    }
  }
  
  /**
   * Reset and restart the tour
   */
  const retakeTour = () => {
    if (driverObj && mounted) {
      // Reset completion state
      tourCompletedState.set(false)
      startTour()
    }
  }
  
  /**
   * Add escape key listener for tour
   */
  const addEscapeListener = () => {
    escapeHandler = (event) => {
      if (event.key === 'Escape' && driverObj && mounted) {
        console.log('🔑 ESC key pressed - closing tour')
        event.preventDefault()
        event.stopPropagation()
        driverObj.destroy()
      }
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


