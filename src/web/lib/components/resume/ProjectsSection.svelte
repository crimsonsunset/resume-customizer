<script>
  import { ProjectsRenderer } from '@web/lib/utils/projects-renderer.js'

  export let projects = []
  export let config = {}

  // Create renderer instance
  $: renderer = new ProjectsRenderer()

  // Render the section
  $: renderedHTML = renderer.render(projects, config)
</script>

{@html renderedHTML} 