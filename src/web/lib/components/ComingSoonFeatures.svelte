<!-- Enhanced Features Card -->
<script>
  import { createEventDispatcher } from 'svelte'
  import { tourCompletedState, resetTour } from '@web/lib/stores/tour-state.js'
  import Button from '@web/lib/components/ui/Button.svelte'
  
  const dispatch = createEventDispatcher()
  
  const handleRetakeTour = () => {
    resetTour()
    dispatch('retakeTour')
  }
</script>

<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    {#if $tourCompletedState}
      <h3 class="card-title text-sm">🎯 Explore More</h3>
      <div class="space-y-3 text-xs">
        <div class="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            on:click={handleRetakeTour}
            class="w-full justify-center"
          >
            🎯 Retake Tour
          </Button>
          <p class="text-xs text-base-content/60 mt-2">See the intelligence in action again</p>
        </div>
        <div class="divider my-2"></div>
      </div>
    {:else}
      <h3 class="card-title text-sm">🎯 Getting Started</h3>
      <div class="space-y-2 text-xs mb-3">
        <p class="text-base-content/70">Take the tour above to see how this intelligent resume system works!</p>
        <div class="divider my-2"></div>
      </div>
    {/if}
    
    <h4 class="card-title text-sm opacity-60">🔮 Coming Soon</h4>
    <div class="space-y-2 text-xs opacity-60">
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