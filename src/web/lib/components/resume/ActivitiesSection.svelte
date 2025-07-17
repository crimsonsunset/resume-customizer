<script>
  import { ActivitiesRenderer } from '@web/lib/utils/activities-renderer.js'

  export let activities = {}
  export let config = {}
  export let bulletDensity = 100

  // Create renderer instance
  $: renderer = new ActivitiesRenderer({ bulletDensity, config })

  // Render the section
  $: renderedHTML = renderer.render(activities, config)
</script>

{@html renderedHTML} 