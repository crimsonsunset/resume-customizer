<script>
  import { delay } from 'lodash-es'
  import { page } from '$app/stores'
  import { navigateToPreset } from '@web/lib/stores/url-state.js'
  
  export let selectedVersion
  export let availablePresets
  
  let showPresetDropdown = false
  
  /**
   * Change the current preset and navigate to new URL
   * @param {string} presetValue - The preset value to switch to
   */
  const changePreset = (presetValue) => {
    selectedVersion = presetValue
    showPresetDropdown = false
    
    // Navigate to new preset URL using clean utility
    navigateToPreset(presetValue, $page.url)
  }
  
  // Get current preset info for display
  $: currentPreset = availablePresets.find(p => p.value === selectedVersion) || availablePresets[0]
</script>

<!-- Version Selector -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <h3 class="card-title text-sm">📋 Resume Version</h3>
    
    <!-- DaisyUI Dropdown -->
    <div class="dropdown w-full" class:dropdown-open={showPresetDropdown}>
      <div tabindex="0" role="button" class="btn btn-sm w-full justify-between transition-all hover:shadow-md" 
           on:click={() => showPresetDropdown = !showPresetDropdown}
           on:keydown={(e) => e.key === 'Enter' && (showPresetDropdown = !showPresetDropdown)}
           on:blur={() => delay(() => showPresetDropdown = false, 150)}>
        <span class="text-left truncate">{currentPreset.name}</span>
        <svg class="w-4 h-4 transition-transform" class:rotate-180={showPresetDropdown} 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full mt-1 border border-base-300">
        {#each availablePresets as preset}
          <li>
            <button class="text-left" on:click={() => changePreset(preset.value)}
                    class:active={preset.value === selectedVersion}>
              <div>
                <div class="font-medium">{preset.name}</div>
                <div class="text-xs text-base-content/70">{preset.description}</div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div> 