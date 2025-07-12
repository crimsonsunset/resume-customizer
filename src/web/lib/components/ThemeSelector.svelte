<script>
  import { currentTheme, DAISY_THEMES, setTheme, getThemeInfo } from '@web/lib/stores/theme.js'
  import { onMount } from 'svelte'
  
  let isOpen = false
  let storeReady = false
  
  // Wait for store to be properly initialized to prevent text flash
  onMount(() => {
    // Small delay to ensure store has stabilized
    setTimeout(() => {
      storeReady = true
    }, 0)
  })
  
  const handleThemeSelect = (theme) => {
    setTheme(theme)
    isOpen = false
  }
  
  const toggleDropdown = () => {
    isOpen = !isOpen
  }
  
  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown')) {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="dropdown dropdown-end" class:dropdown-open={isOpen}>
  <!-- Dropdown trigger -->
  <div 
    tabindex="0" 
    role="button" 
    class="btn btn-outline btn-primary m-1"
    on:click={toggleDropdown}
    on:keydown={(e) => e.key === 'Enter' && toggleDropdown()}
  >
    <!-- Show skeleton until store is ready to prevent flash -->
    {#if storeReady}
      🎨 {getThemeInfo($currentTheme)}
    {:else}
      <div class="flex items-center">
        🎨 <div class="skeleton w-20 h-4 ml-2"></div>
      </div>
    {/if}
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
  
  <!-- Dropdown content -->
  <div class="dropdown-content z-[1] p-4 shadow-lg bg-base-100 rounded-box w-96 max-h-96 overflow-y-auto">
    <div class="mb-3">
      <h3 class="font-semibold text-lg">Choose Theme</h3>
      <p class="text-sm opacity-70">Select from {DAISY_THEMES.length} professional themes</p>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      {#each DAISY_THEMES as theme}
        <button
          class="btn btn-sm justify-start text-left h-auto py-2 px-3"
          class:btn-primary={$currentTheme === theme}
          class:btn-ghost={$currentTheme !== theme}
          on:click={() => handleThemeSelect(theme)}
        >
          <span class="flex-1 text-left text-sm">{getThemeInfo(theme)}</span>
          {#if $currentTheme === theme}
            <span class="text-success ml-2">✓</span>
          {/if}
        </button>
      {/each}
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