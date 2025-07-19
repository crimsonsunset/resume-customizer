<script>
  import Badge from './Badge.svelte'
  
  export let title = ''
  export let subtitle = ''
  export let size = 'normal'      // compact, normal
  export let bordered = true
  export let shadow = 'sm'        // none, sm, md, lg, xl
  export let disabled = false
  export let badge = null         // {text, variant}
  
  // Allow additional CSS classes
  let className = ''
  export { className as class }
  
  // Generate card classes
  $: cardClasses = [
    'card',
    'bg-base-100',
    bordered && 'border border-base-300',
    shadow !== 'none' && `shadow-${shadow}`,
    disabled && 'opacity-50 pointer-events-none',
    className
  ].filter(Boolean).join(' ')
  
  // Generate card body classes
  $: bodyClasses = [
    'card-body',
    size === 'compact' ? 'p-4' : 'p-4'
  ].join(' ')
</script>

<div class={cardClasses}>
  <div class={bodyClasses}>
    {#if title || subtitle || badge}
      <div class="flex justify-between items-center mb-3">
        <div>
          {#if title}
            <h3 class="card-title text-sm">{title}</h3>
          {/if}
          {#if subtitle}
            <p class="text-xs text-base-content/60 mt-1">{subtitle}</p>
          {/if}
        </div>
        
        {#if badge}
          <Badge variant={badge.variant || 'info'} size="sm" outline>
            {badge.text}
          </Badge>
        {/if}
        
        <!-- Actions slot for buttons, badges, etc. -->
        <slot name="actions" />
      </div>
    {/if}
    
    <!-- Main content -->
    <slot />
  </div>
</div> 