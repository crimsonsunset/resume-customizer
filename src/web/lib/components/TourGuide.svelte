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
    const steps = tourConfig.steps.map(step => ({
      element: step.attachTo?.element || 'body',
      popover: {
        title: step.title,
        description: step.text,
        side: step.attachTo?.on || 'bottom',
        align: 'start'
      }
    }))

    driverObj = driver({
      showProgress: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.05)',
      steps: steps,
      onDestroyed: () => {
        markTourCompleted()
        dispatch('tourCompleted')
        console.log('🎯 Tour completed successfully')
      },
      onDestroyStarted: () => {
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
  
  onDestroy(() => {
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


