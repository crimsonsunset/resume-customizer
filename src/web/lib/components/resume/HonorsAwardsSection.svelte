<script>
  import { HonorsAwardsRenderer } from '@web/lib/utils/honors-awards-renderer.js'

  export let honorsAwards = []
  export let config = {}

  // Create renderer instance
  $: renderer = new HonorsAwardsRenderer()

  // Render the section
  $: renderedHTML = renderer.render(honorsAwards, config)
</script>

{@html renderedHTML} 