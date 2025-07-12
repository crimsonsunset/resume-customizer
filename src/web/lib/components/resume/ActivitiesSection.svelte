<script>
  import { ActivitiesRenderer } from '@web/lib/utils/activities-renderer.js'

  export let activities = {}
  export let config = {}

  // Create renderer instance
  $: renderer = new ActivitiesRenderer()

  // Render the section
  $: renderedHTML = renderer.render(activities, config)
</script>

{@html renderedHTML} 