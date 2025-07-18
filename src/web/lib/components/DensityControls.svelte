<script>
  import { createEventDispatcher } from 'svelte'
  import { uiConfig } from '@shared/ui-config.js'
  
  export let density = 100 // Content density: 10-100% (10 = minimal, 100 = full content)
  export let contentMode = 'manual' // 'manual' or 'density' mode
  export let experienceYears = 7 // Years of experience: 0 = all, 1-N = filter by years
  export let totalExperienceYears = 10 // Total years calculated from data
  
  const dispatch = createEventDispatcher()
  
  const handleDensityChange = (newDensity) => {
    dispatch('densityChange', { density: newDensity })
  }
  
  const handleModeChange = (newMode) => {
    dispatch('modeChange', { contentMode: newMode })
  }
  
  const handleYearsChange = (newYears) => {
    dispatch('yearsChange', { experienceYears: newYears })
  }
  
  // Years mapping for display
  const getYearsDisplay = (years) => {
    if (years === 0) return 'All'
    return `${years} year${years === 1 ? '' : 's'}`
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

{#if uiConfig.showTimeframeSlider}
<!-- Experience Years Controls -->
<div class="card bg-base-100 shadow-sm border border-base-300 mt-4">
  <div class="card-body p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="card-title text-sm">📅 Timeframe</h3>
      <span class="text-xs text-base-content/60 italic">Experience & Projects</span>
    </div>
    <div class="space-y-3">
      <div class="flex justify-between items-center text-xs">
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => handleYearsChange(1)}
          title="Recent experience only"
        >
          👶 Recent
        </button>
        <span class="font-medium">{getYearsDisplay(experienceYears)}</span>
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => handleYearsChange(totalExperienceYears)}
          title="All experience"
        >
          👴 All
        </button>
      </div>
      <input 
        type="range" 
        min="0" 
        max={totalExperienceYears} 
        step="1"
        value={experienceYears}
        on:input={(e) => handleYearsChange(Number.parseInt(e.target.value, 10))}
        class="range range-secondary range-sm"
      />
      <div class="flex justify-between text-xs text-base-content/50">
        <span>👶 1yr</span>
        <span>{Math.floor(totalExperienceYears / 2)}yr</span>
        <span>👴 All ({totalExperienceYears}yr)</span>
      </div>
      <div class="text-xs text-center text-base-content/60">
        {#if experienceYears >= totalExperienceYears}
          Showing all experience & projects ({totalExperienceYears} years)
        {:else if experienceYears === 1}
          Showing last 1 year only
        {:else}
          Showing last {experienceYears} years
        {/if}
      </div>
    </div>
  </div>
</div>
{/if} 