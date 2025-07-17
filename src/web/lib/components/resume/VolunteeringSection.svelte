<script>
  import { VolunteeringRenderer } from '@web/lib/utils/volunteering-renderer.js'

  export let volunteering = []
  export let config = {}
  export let bulletDensity = 100
  export let profile = null

  // Create renderer instance with profile support
  $: renderer = new VolunteeringRenderer({ bulletDensity, profile })

  // Render the section
  $: renderedHTML = renderer.render(volunteering, config)
</script>

{@html renderedHTML} 