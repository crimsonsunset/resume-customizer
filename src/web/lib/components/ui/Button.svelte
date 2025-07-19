<script>
  import { createEventDispatcher } from 'svelte'
  
  export let variant = 'primary'  // primary, secondary, ghost, outline, success, warning, error
  export let size = 'md'          // xs, sm, md, lg
  export let loading = false
  export let disabled = false
  export let type = 'button'      // button, submit, reset
  export let ariaLabel = ''
  
  // Allow additional CSS classes
  let className = ''
  export { className as class }
  
  const dispatch = createEventDispatcher()
  
  /**
   * Handle button click and dispatch event
   */
  const handleClick = (event) => {
    if (!disabled && !loading) {
      dispatch('click', event)
    }
  }
  
  // Generate button classes based on props
  $: buttonClasses = [
    'btn',
    `btn-${size}`,
    variant === 'outline' ? 'btn-outline' : `btn-${variant}`,
    loading && 'loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ')
</script>

<button 
  class={buttonClasses}
  {type}
  {disabled}
  aria-label={ariaLabel}
  on:click={handleClick}
  on:keydown
  on:mouseenter
  on:mouseleave
  on:focus
  on:blur
>
  {#if loading}
    <span class="loading loading-spinner loading-sm"></span>
  {/if}
  <slot />
</button> 