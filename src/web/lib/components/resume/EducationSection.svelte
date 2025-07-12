<script>
  import { EducationRenderer } from '@web/lib/utils/education-renderer.js'

  export let education = []
  export let config = {}

  // Create renderer instance
  $: renderer = new EducationRenderer()

  // Render the section
  $: renderedHTML = renderer.render(education, config)
</script>

{@html renderedHTML} 