<script>
  // Import global CSS with Tailwind and DaisyUI
  import '@web/app.css'

  // SEO and meta management
  import { MetaTags, JsonLd } from 'svelte-meta-tags'

  // Theme management
  import { onMount } from 'svelte'
  import { currentTheme } from '@web/lib/stores/theme.js'

  // Get SEO data from load function
  export let data

  $: seo = data?.seo

  onMount(() => {
    // Initialize theme on app load
    const theme = $currentTheme
    document.documentElement.dataset.theme = theme
  })
</script>

{#if seo}
  <MetaTags
    title={seo.title}
    description={seo.description}
    keywords={seo.keywords?.split(',').map((keyword) => keyword.trim())}
    canonical={seo.canonical}
    openGraph={{
      url: seo.canonical,
      type: seo.type,
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      images: [{ url: seo.imageURL }]
    }}
    twitter={{
      cardType: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      image: seo.imageURL
    }}
  />
  <JsonLd schema={seo.jsonld} />
{/if}

<slot />
