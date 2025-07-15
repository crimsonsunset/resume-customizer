<script>
  export let objective = ''

  $: hasObjective = objective && objective.trim().length > 0
</script>

{#if hasObjective}
<div class="section-wrapper" data-section="objective">
  <div class="section-label">Objective</div>
  <div class="section-content">
    <p>{objective}</p>
  </div>
</div>
{/if} 