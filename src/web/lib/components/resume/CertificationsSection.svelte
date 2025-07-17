<script>
  import { CertificationsRenderer } from '@web/lib/utils/certifications-renderer.js'

  export let certifications = []
  export let config = {}
  export let bulletDensity = 100
  export let profile = null

  // Create renderer instance with profile support
  $: renderer = new CertificationsRenderer({ bulletDensity, profile })

  // Render the section
  $: renderedHTML = renderer.render(certifications, config)
</script>

{@html renderedHTML} 