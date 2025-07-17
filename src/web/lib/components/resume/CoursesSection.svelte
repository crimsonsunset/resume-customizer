<script>
  import { CoursesRenderer } from '@web/lib/utils/courses-renderer.js'

  export let courses = []
  export let config = {}
  export let bulletDensity = 100
  export let profile = null

  // Create renderer instance with profile support
  $: renderer = new CoursesRenderer({ bulletDensity, profile })

  // Render the section
  $: renderedHTML = renderer.render(courses, config)
</script>

{@html renderedHTML} 