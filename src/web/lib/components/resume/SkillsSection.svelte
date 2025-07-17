<script>
  import { SkillsRenderer } from '@web/lib/utils/skills-renderer.js'

  export let skillsData = {}
  export let bulletDensity = 100
  export let config = {}

  // Create renderer instance
  $: renderer = new SkillsRenderer()

  // Render the section
  $: renderedHTML = renderer.render(skillsData, config, bulletDensity)
</script>

{@html renderedHTML} 