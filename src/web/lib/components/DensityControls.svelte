<script>
  export let density = 100 // Content density: 10-100% (10 = minimal, 100 = full content)
</script>

<!-- Density Controls -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <h3 class="card-title text-sm">📏 Content Density</h3>
    <div class="space-y-3">
      <div class="flex justify-between items-center text-xs">
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => density = 10}
        >
          Minimal
        </button>
        <span class="font-medium">{density}%</span>
        <button 
          class="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content"
          on:click={() => density = 100}
        >
          Full
        </button>
      </div>
      <input 
        type="range" 
        min="10" 
        max="100" 
        step="10"
        bind:value={density}
        class="range range-primary range-sm" 
      />
      <div class="flex justify-between text-xs text-base-content/50">
        <span>10%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</div> 