<script>
  import { createEventDispatcher } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  
  export let open = false
  
  const dispatch = createEventDispatcher()
  
  /**
   * Closes the panel and notifies parent
   */
  const closePanel = () => {
    open = false
    dispatch('close')
  }
  
  /**
   * Handles backdrop click to close panel
   */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closePanel()
    }
  }
</script>

<!-- Mobile Slide-Out Panel -->
{#if open}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
    transition:fade={{ duration: 300 }}
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && closePanel()}
    role="button"
    tabindex="0"
    aria-label="Close menu"
  >
    <!-- Slide-Out Panel -->
    <div 
      class="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-base-100 shadow-2xl overflow-y-auto"
      transition:fly={{ x: -300, duration: 300 }}
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <!-- Panel Header -->
      <div class="sticky top-0 bg-base-100 border-b border-base-300 px-4 py-3 z-10">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-base-content">Resume Controls</h2>
          <button 
            class="btn btn-ghost btn-sm btn-circle"
            on:click={closePanel}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Panel Content -->
      <div class="p-4 space-y-6">
        <slot />
      </div>
    </div>
  </div>
{/if} 