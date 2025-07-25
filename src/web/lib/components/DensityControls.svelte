<script>
  import { createEventDispatcher } from 'svelte'
  import { uiConfig } from '@shared/ui-config.js'
  import Card from '@web/lib/components/ui/Card.svelte'
  import ButtonGroup from '@web/lib/components/ui/ButtonGroup.svelte'
  
  export let density = 100 // Content density: 10-100% (10 = minimal, 100 = full content)
  export let experienceYears = 7 // Years of experience: 0 = all, 1-N = filter by years
  export let totalExperienceYears = 10 // Total years calculated from data
  
  const dispatch = createEventDispatcher()
  
  const handleDensityChange = (newDensity) => {
    dispatch('densityChange', { density: newDensity })
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
<Card title="📏 Resume Length">
  <div class="space-y-3">
    <div class="flex justify-between items-center text-xs">
      <ButtonGroup 
        items={[
          { text: 'Minimal', action: () => handleDensityChange(10) }
        ]}
        variant="outline"
      />
      <span class="font-medium">{density}%</span>
      <ButtonGroup 
        items={[
          { text: 'Full', action: () => handleDensityChange(100) }
        ]}
        variant="outline"
      />
    </div>
    <input 
      type="range" 
      min="10" 
      max="100" 
      step="10"
      value={density}
      on:input={(e) => handleDensityChange(Number.parseInt(e.target.value, 10))}
      class="range range-primary range-sm"
    />
    <div class="flex justify-between text-xs text-base-content/50">
      <span>10%</span>
      <span>50%</span>
      <span>100%</span>
    </div>
  </div>
</Card>

{#if uiConfig.showTimeframeSlider}
<!-- Experience Years Controls -->
<div class="card bg-base-100 shadow-sm border border-base-300 mt-4">
  <div class="card-body p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="card-title text-sm">📅 Timeframe</h3>
    </div>
    <div class="space-y-3">
      <div class="flex justify-between items-center text-xs">
        <button 
          class="btn btn-xs btn-outline text-base-content/70 hover:text-base-content"
          on:click={() => handleYearsChange(1)}
          title="Recent experience only"
        >
          Recent
        </button>
        <span class="font-medium">{getYearsDisplay(experienceYears)}</span>
        <button 
          class="btn btn-xs btn-outline text-base-content/70 hover:text-base-content"
          on:click={() => handleYearsChange(totalExperienceYears)}
          title="All experience"
        >
          All
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
        <span>1yr</span>
        <span>{Math.floor(totalExperienceYears / 2)}yr</span>
        <span>All ({totalExperienceYears}yr)</span>
      </div>
      <div class="text-xs text-center text-base-content/60">
        {#if experienceYears >= totalExperienceYears}
          Showing all content ({totalExperienceYears} years)
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