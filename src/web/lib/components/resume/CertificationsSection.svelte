<script>
  import { CertificationsRenderer } from '@web/lib/utils/certifications-renderer.js'

  export let certifications = []
  export let config = {}

  // Create renderer instance
  $: renderer = new CertificationsRenderer()

  // Render the section
  $: renderedHTML = renderer.render(certifications, config)
</script>

{@html renderedHTML} 