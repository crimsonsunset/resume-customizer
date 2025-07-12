<script>
  // Import global CSS with Tailwind and DaisyUI
  import '@web/app.css'
  
  // Theme management
  import { onMount } from 'svelte'
  import { currentTheme } from '@web/lib/stores/theme.js'
  
  onMount(() => {
    // Initialize theme on app load
    const theme = $currentTheme
    document.documentElement.dataset.theme = theme
  })
</script>

<slot />

 