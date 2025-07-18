<script>
  import { createEventDispatcher } from 'svelte'
  import { startCase } from 'lodash-es'
  
  export let panelOpen = false
  export let selectedVersion = 'full'
  
  const dispatch = createEventDispatcher()
  
  /**
   * Toggles the mobile panel open/closed state
   */
  const togglePanel = () => {
    panelOpen = !panelOpen
    dispatch('panelToggle', { open: panelOpen })
  }
</script>

<!-- Mobile Header Bar -->
<header class="block md:hidden bg-base-100 border-b border-base-300 px-4 py-3 relative z-50">
  <div class="flex justify-between items-center">
    <!-- Hamburger Menu Button -->
    <button 
      class="btn btn-ghost btn-sm p-2 hover:bg-base-200 active:scale-95"
      on:click={togglePanel}
      aria-label="Toggle menu"
      aria-expanded={panelOpen}
    >
      <!-- Animated Hamburger Icon -->
      <div class="w-6 h-6 flex flex-col justify-center items-center space-y-1">
        <div class="w-5 h-0.5 bg-base-content transition-transform duration-300" 
             class:rotate-45={panelOpen} 
             class:translate-y-1.5={panelOpen}></div>
        <div class="w-5 h-0.5 bg-base-content transition-opacity duration-300" 
             class:opacity-0={panelOpen}></div>
        <div class="w-5 h-0.5 bg-base-content transition-transform duration-300" 
             class:-rotate-45={panelOpen} 
             class:-translate-y-1.5={panelOpen}></div>
      </div>
    </button>
    
    <!-- App Title + Current Preset -->
    <div class="flex-1 text-center">
      <h1 class="text-lg font-bold text-primary">Resume Optimizer</h1>
      {#if selectedVersion !== 'full'}
        <p class="text-xs text-base-content/60">{startCase(selectedVersion)} Preset</p>
      {/if}
    </div>
    
    <!-- Export Button (Mobile) -->
    <button 
      class="btn btn-primary btn-sm font-medium"
      on:click={() => dispatch('exportPDF')}
      aria-label="Download PDF"
    >
      ⬇️ PDF
    </button>
  </div>
</header> 