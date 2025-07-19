<script>
  export let variant = 'neutral'  // neutral, primary, secondary, accent, success, warning, error, info
  export let size = 'md'          // xs, sm, md, lg
  export let outline = false
  export let ghost = false
  
  // Allow additional CSS classes
  let className = ''
  export { className as class }
  
  // Generate badge classes
  $: badgeClasses = [
    'badge',
    size !== 'md' && `badge-${size}`,
    outline ? 'badge-outline' : (variant !== 'neutral' && `badge-${variant}`),
    ghost && 'badge-ghost',
    className
  ].filter(Boolean).join(' ')
</script>

<div class={badgeClasses}>
  <slot />
</div> 