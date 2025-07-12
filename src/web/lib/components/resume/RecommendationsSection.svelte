<script>
    import { RecommendationsRenderer } from '@web/lib/utils/recommendations-renderer.js'

    export let recommendations = {}
    export let config = {}

    // Create renderer instance
    $: renderer = new RecommendationsRenderer()

    // Render the section
    $: renderedHTML = renderer.render(recommendations, config)
</script>

{@html renderedHTML} 
