<script>
  import { CoursesRenderer } from '@web/lib/utils/courses-renderer.js'

  export let courses = []
  export let config = {}

  // Create renderer instance
  $: renderer = new CoursesRenderer()

  // Render the section
  $: renderedHTML = renderer.render(courses, config)
</script>

{@html renderedHTML} 