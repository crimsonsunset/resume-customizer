<script>
  import { currentTheme, DAISY_THEMES, setTheme, getThemeInfo } from '@web/lib/stores/theme.js'
  import { onMount } from 'svelte'
  import { delay } from 'lodash-es'
  
  export let onExportToPDF = () => {}
  export let isExportingPDF = false
  
  let isOpen = false
  let storeReady = false
  
  // Wait for store to be properly initialized to prevent text flash
  onMount(() => {
    // Use lodash delay instead of setTimeout for better reliability
    delay(() => {
      storeReady = true
    }, 0)
  })
  
  const toggleMenu = () => {
    isOpen = !isOpen
  }
  
  const closeMenu = () => {
    isOpen = false
  }
  
  const handleExportToPDF = () => {
    onExportToPDF()
    closeMenu()
  }
  
  const handleThemeSelect = (theme) => {
    setTheme(theme)
    closeMenu()
  }
  
  // Close menu when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.mobile-menu-dropdown')) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="mobile-menu-dropdown dropdown dropdown-end" class:dropdown-open={isOpen}>
  <!-- Ellipsis trigger button -->
  <div 
    tabindex="0" 
    role="button" 
    class="btn btn-ghost btn-sm p-2 hover:bg-base-200 active:scale-95"
    on:click={toggleMenu}
    on:keydown={(e) => e.key === 'Enter' && toggleMenu()}
    aria-label="More options"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"></path>
    </svg>
  </div>
  
  <!-- Dropdown content -->
  <div class="dropdown-content z-[1000] shadow-lg bg-base-100 rounded-box w-72 p-3 border border-base-300 max-h-96 overflow-y-auto">
    <!-- Download PDF Button (first) -->
    <div class="flex justify-center my-3">
      <button 
        class="btn btn-sm w-3/4 justify-center font-medium bg-primary text-primary-content border-primary hover:bg-primary-focus"
        disabled={isExportingPDF}
        on:click={handleExportToPDF}
      >
      {#if isExportingPDF}
        <span class="loading loading-spinner loading-sm"></span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-4 w-4 stroke-current mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Download PDF
      {/if}
      </button>
    </div>

    <!-- Divider -->
    <div class="divider my-2"></div>
    
    <!-- Theme Section -->
    <div class="mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium opacity-70">Theme</span>
        {#if storeReady}
          <span class="text-xs opacity-50">{getThemeInfo($currentTheme)}</span>
        {:else}
          <div class="skeleton w-16 h-3"></div>
        {/if}
      </div>
      
      <!-- Theme Grid -->
      <div class="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
        {#each DAISY_THEMES as theme}
          <button
            class="btn btn-xs justify-start text-left h-auto py-1 px-2"
            class:btn-primary={$currentTheme === theme}
            class:btn-ghost={$currentTheme !== theme}
            on:click={() => handleThemeSelect(theme)}
          >
            <span class="flex-1 text-left text-xs truncate">{getThemeInfo(theme)}</span>
            {#if $currentTheme === theme}
              <span class="text-success text-xs">✓</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .dropdown-content {
    border: 1px solid hsl(var(--bc) / 0.2);
  }
  
  .btn-ghost:hover {
    background-color: hsl(var(--b2));
  }
  
  .btn-primary {
    background-color: hsl(var(--p) / 0.1);
    color: hsl(var(--pc));
    border-color: hsl(var(--p) / 0.3);
  }
  
  .btn-primary:hover {
    background-color: hsl(var(--p) / 0.2);
  }

</style> 
