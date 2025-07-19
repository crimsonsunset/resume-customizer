<script>
  import { createEventDispatcher } from 'svelte'
  import Button from './Button.svelte'
  
  export let items = []           // Array of {text, action, variant?, disabled?}
  export let size = 'xs'          // xs, sm, md, lg
  export let variant = 'outline'  // Default variant for all buttons
  export let vertical = false     // Stack vertically instead of horizontally
  
  const dispatch = createEventDispatcher()
  
  /**
   * Handle button click from items array
   * @param {number} index - Index of clicked item
   * @param {object} item - The clicked item object
   */
  const handleItemClick = (index, item) => {
    if (item.action) {
      item.action()
    }
    dispatch('itemClick', { index, item })
  }
</script>

<div class="join" class:join-vertical={vertical}>
  {#each items as item, index}
    <Button
      variant={item.variant || variant}
      {size}
      disabled={item.disabled}
      ariaLabel={item.ariaLabel}
      on:click={() => handleItemClick(index, item)}
      class="join-item"
    >
      {item.text}
    </Button>
  {/each}
  
  <!-- Allow custom button content via slot -->
  <slot />
</div> 