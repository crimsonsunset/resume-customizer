<script>
  import { HonorsAwardsRenderer } from '@web/lib/utils/honors-awards-renderer.js'

  export let honorsAwards = []
  export let config = {}
  export let bulletDensity = 100
  export let profile = null

  // Create renderer instance with profile support
  $: renderer = new HonorsAwardsRenderer({ bulletDensity, profile })

  // Render the section
  $: renderedHTML = renderer.render(honorsAwards, config)
</script>

{@html renderedHTML} 