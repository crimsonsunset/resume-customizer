<script>
  import { createEventDispatcher } from 'svelte'
  
  export let label = ''
  export let checked = false
  export let size = 'md'          // xs, sm, md, lg
  export let color = 'primary'    // primary, secondary, accent, success, warning, error
  export let disabled = false
  export let labelPosition = 'right' // left, right
  
  const dispatch = createEventDispatcher()
  
  /**
   * Handle toggle change
   */
  const handleChange = (event) => {
    checked = event.target.checked
    dispatch('change', { checked })
  }
  
  // Generate toggle classes
  $: toggleClasses = [
    'toggle',
    `toggle-${color}`,
    size !== 'md' && `toggle-${size}`
  ].filter(Boolean).join(' ')
</script>

<div class="form-control">
  <label class="label cursor-pointer gap-2" class:flex-row-reverse={labelPosition === 'left'}>
    {#if label}
      <span class="label-text text-xs">{label}</span>
    {/if}
    <input 
      type="checkbox" 
      class={toggleClasses}
      {checked}
      {disabled}
      on:change={handleChange}
      on:focus
      on:blur
    />
  </label>
</div> 