<script>
  // Import global CSS with Tailwind and DaisyUI
  import '@web/app.css'
  
  // SEO and meta management  
  import SEO from 'sk-seo'
  
  // Theme management
  import { onMount } from 'svelte'
  import { currentTheme } from '@web/lib/stores/theme.js'
  
  // Get SEO data from load function
  export let data
  
  onMount(() => {
    // Initialize theme on app load
    const theme = $currentTheme
    document.documentElement.dataset.theme = theme
  })
</script>

<!-- SEO meta tags - proper sk-seo implementation with native imageURL support -->
<SEO 
  title={data?.seo?.title}
  description={data?.seo?.description}
  canonical={data?.seo?.canonical}
  imageURL={data?.seo?.imageURL}
  openGraph={data?.seo?.openGraph}
  twitter={data?.seo?.twitter}
  jsonLd={data?.seo?.jsonld}
/>

<slot />

 