<script>
  import { createEventDispatcher } from 'svelte'
  
  export let density = 100 // Content density: 10-100% (10 = minimal, 100 = full content)
  export let contentMode = 'manual' // 'manual' or 'density' mode
  
  const dispatch = createEventDispatcher()
  
  const handleDensityChange = (newDensity) => {
    dispatch('densityChange', { density: newDensity })
  }
  
  const handleModeChange = (newMode) => {
    dispatch('modeChange', { contentMode: newMode })
  }
</script>

<!-- Resume Length Controls -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="card-title text-sm">📏 Resume Length</h3>
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <span class="label-text text-xs">Density Mode</span>
          <input 
            type="checkbox" 
            class="toggle toggle-primary toggle-xs" 
            checked={contentMode === 'density'}
            on:change={() => handleModeChange(contentMode === 'density' ? 'manual' : 'density')}
          />
        </label>
      </div>
    </div>
    <div class="space-y-3" class:opacity-50={contentMode === 'manual'} class:pointer-events-none={contentMode === 'manual'}>
      <div class="flex justify-between items-center text-xs">
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => handleDensityChange(10)}
          disabled={contentMode === 'manual'}
        >
          Minimal
        </button>
        <span class="font-medium">{density}%</span>
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => handleDensityChange(100)}
          disabled={contentMode === 'manual'}
        >
          Full
        </button>
      </div>
      <input 
        type="range" 
        min="10" 
        max="100" 
        step="10"
        value={density}
        on:input={(e) => handleDensityChange(parseInt(e.target.value))}
        class="range range-primary range-sm" 
        disabled={contentMode === 'manual'}
      />
      <div class="flex justify-between text-xs text-base-content/50">
        <span>10%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {#if contentMode === 'manual'}
        <div class="text-xs text-center text-base-content/60 italic">
          Enable Density Mode to use slider
        </div>
      {/if}
    </div>
  </div>
</div> 