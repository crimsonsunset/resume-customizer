<script>
  import { ExperienceRenderer } from '@web/lib/utils/experience-renderer.js'

  export let experiences = []
  export let config = {}
  export let bulletDensity = 100

  // Create renderer instance
  $: renderer = new ExperienceRenderer({ bulletDensity })

  // Render the section
  $: renderedHTML = renderer.render(experiences, config)
</script>

{@html renderedHTML} 