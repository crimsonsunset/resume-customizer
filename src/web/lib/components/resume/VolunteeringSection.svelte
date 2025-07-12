<script>
  import { VolunteeringRenderer } from '@web/lib/utils/volunteering-renderer.js'

  export let volunteering = []
  export let config = {}

  // Create renderer instance
  $: renderer = new VolunteeringRenderer()

  // Render the section
  $: renderedHTML = renderer.render(volunteering, config)
</script>

{@html renderedHTML} 