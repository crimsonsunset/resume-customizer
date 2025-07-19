<script>
  import { createEventDispatcher } from 'svelte'
  
  export let label = ''
  export let checked = false
  export let indeterminate = false
  export let size = 'sm'          // xs, sm, md, lg
  export let color = 'primary'    // primary, secondary, accent, success, warning, error
  export let disabled = false
  
  const dispatch = createEventDispatcher()
  
  /**
   * Handle checkbox change
   */
  const handleChange = (event) => {
    checked = event.target.checked
    dispatch('change', { checked })
  }
  
  // Generate checkbox classes
  $: checkboxClasses = [
    'checkbox',
    `checkbox-${size}`,
    color !== 'primary' && `checkbox-${color}`
  ].filter(Boolean).join(' ')
</script>

<label class="label cursor-pointer justify-start gap-2 hover:bg-base-200 p-1 rounded transition-all">
  <input 
    type="checkbox" 
    class={checkboxClasses}
    {checked}
    {indeterminate}
    {disabled}
    on:change={handleChange}
    on:focus
    on:blur
  />
  {#if label}
    <span class="label-text text-sm">{label}</span>
  {/if}
  <slot />
</label> 