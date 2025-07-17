<script>
  import { ProjectsRenderer } from '@web/lib/utils/projects-renderer.js'

  export let projects = []
  export let config = {}
  export let bulletDensity = 100

  // Create renderer instance
  $: renderer = new ProjectsRenderer({ bulletDensity, config })

  // Render the section
  $: renderedHTML = renderer.render(projects, config)
</script>

{@html renderedHTML} 