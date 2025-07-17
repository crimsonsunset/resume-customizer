<script>
    import { RecommendationsRenderer } from '@web/lib/utils/recommendations-renderer.js'

    export let recommendations = {}
    export let config = {}
    export let bulletDensity = 100

    // Create renderer instance with density support
    $: renderer = new RecommendationsRenderer({ bulletDensity })

    // Render the section
    $: renderedHTML = renderer.render(recommendations, config)
</script>

{@html renderedHTML} 
