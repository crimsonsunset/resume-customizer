<script>
  import { currentTheme, DAISY_THEMES, setTheme, getThemeInfo } from '@web/lib/stores/theme.js'
  
  let isOpen = false
  
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

<div class="dropdown" class:dropdown-open={isOpen}>
  <!-- Dropdown trigger -->
  <div 
    tabindex="0" 
    role="button" 
    class="btn btn-outline btn-primary m-1"
    on:click={toggleDropdown}
    on:keydown={(e) => e.key === 'Enter' && toggleDropdown()}
  >
    🎨 {getThemeInfo($currentTheme)}
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
  
  <!-- Dropdown content -->
  <ul class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64 max-h-96 overflow-y-auto">
    <li class="menu-title">
      <span>Choose Theme</span>
    </li>
    <div class="divider my-1"></div>
    
    {#each DAISY_THEMES as theme}
      <li>
        <button
          class="justify-start"
          class:active={$currentTheme === theme}
          on:click={() => handleThemeSelect(theme)}
        >
          <span class="flex-1 text-left">{getThemeInfo(theme)}</span>
          {#if $currentTheme === theme}
            <span class="text-success">✓</span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .dropdown-content {
    border: 1px solid hsl(var(--bc) / 0.2);
  }
  
  .menu li button.active {
    background-color: hsl(var(--p) / 0.1);
    color: hsl(var(--pc));
  }
</style> 