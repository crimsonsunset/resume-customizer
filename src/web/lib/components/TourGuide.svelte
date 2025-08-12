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
  
  let tour
  let mounted = false
  let Shepherd
  
  export let autoStart = false
  export let showTourButton = true
  
  onMount(async () => {
    // Dynamic import for Shepherd.js to avoid SSR issues
    try {
      const shepherdModule = await import('shepherd.js')
      Shepherd = shepherdModule.default
      
      delay(() => {
        mounted = true
        initializeTour()
        
        // Auto-start for new users if enabled
        if (autoStart && !$tourCompletedState && tourConfig.settings.autoStart) {
          delay(() => startTour(), 1000) // Delay to ensure page is fully loaded
        }
      }, 100)
    } catch (error) {
      console.error('Failed to load Shepherd.js:', error)
    }
  })
  
  /**
   * Initialize the Shepherd tour with configuration
   */
  const initializeTour = () => {
    if (!Shepherd || !mounted) return
    
    tour = new Shepherd.Tour({
      useModalOverlay: tourConfig.settings.useModalOverlay,
      defaultStepOptions: {
        ...tourConfig.defaultStepOptions,
        classes: 'custom-tour-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        when: {
          show() {
            console.log('🎯 Tour step showing')
          }
        }
      }
    })

    // Get responsive steps based on screen size
    const isDesktop = window.innerWidth >= tourConfig.responsive.desktop.minWidth
    const stepIds = isDesktop ? tourConfig.responsive.desktop.steps : tourConfig.responsive.mobile.steps
    
    // Add steps from configuration
    stepIds.forEach(stepId => {
      const stepConfig = tourConfig.steps.find(step => step.id === stepId)
      if (stepConfig) {
        // Convert button config to actual functions
        const buttons = stepConfig.buttons.map(btn => ({
          text: btn.text,
          classes: btn.classes,
          action: getActionFunction(btn.action)
        }))
        
        const stepOptions = {
          id: stepConfig.id,
          title: stepConfig.title,
          text: stepConfig.text,
          buttons
        }
        
        // Add attachTo if specified
        if (stepConfig.attachTo) {
          stepOptions.attachTo = stepConfig.attachTo
        }
        
        tour.addStep(stepOptions)
      }
    })

    // Event handlers
    tour.on('complete', () => {
      markTourCompleted()
      dispatch('tourCompleted')
      console.log('🎯 Tour completed successfully')
    })

    tour.on('cancel', () => {
      cancelTourState()
      dispatch('tourCancelled')
      console.log('🚫 Tour cancelled by user')
    })
    
    tour.on('start', () => {
      startTourState()
      dispatch('tourStarted')
    })
  }
  
  /**
   * Convert action string to actual function
   * @param {string} action - Action name from config
   * @returns {function} - Shepherd action function
   */
  const getActionFunction = (action) => {
    switch(action) {
      case 'next': return tour.next
      case 'back': return tour.back
      case 'cancel': return tour.cancel
      case 'complete': return tour.complete
      default: return tour.next
    }
  }
  
  /**
   * Start the tour manually
   */
  const startTour = () => {
    if (tour && mounted && tourConfig.settings.enabled) {
      tour.start()
    }
  }
  
  /**
   * Reset and restart the tour
   */
  const retakeTour = () => {
    if (tour && mounted) {
      // Reset completion state
      tourCompletedState.set(false)
      tour.start()
    }
  }
  
  onDestroy(() => {
    if (tour) {
      tour.complete()
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


