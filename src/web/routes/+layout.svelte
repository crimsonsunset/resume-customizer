<script>
  // Import global CSS with Tailwind and shadcn-svelte
  import '../app.css'
  
  // Future: Global state management, theme handling, etc.
  import { onMount } from 'svelte'
  
  onMount(() => {
    console.log('🎨 SvelteKit Layout Loaded')
  })
</script>

<slot />

 