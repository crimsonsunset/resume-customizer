<script>
  import { ButtonGroup, Card, Badge, Button } from '@web/lib/components/ui'
  
  export let visibleSections
  export let availableSectionsByCategory
  export let disabled = false // Gray out controls in density mode
  
  // Accordion state - Primary expanded, others collapsed
  let accordionState = {
    primary: true,
    credentials: false,
    socialProof: false,
    personality: false
  }
  
  // Category configuration for section controls
  const categoryConfig = {
    primary: { sections: ['headline', 'summary', 'experience', 'education', 'skills', 'projects'] },
    credentials: { sections: ['certifications', 'honors-awards', 'courses'] },
    socialProof: { sections: ['recommendations', 'volunteering'] },
    personality: { sections: ['activities', 'objective'] }
    // Note: 'location' excluded from controls since it's already displayed in the resume header
  }
  
  /**
   * Select all sections across all categories
   */
  const selectAllSections = () => {
    Object.keys(visibleSections).forEach(section => {
      visibleSections[section] = true
    })
    visibleSections = { ...visibleSections } // Trigger reactivity
    // Also expand all accordions to show what was selected
    accordionState.primary = true
    accordionState.credentials = true
    accordionState.socialProof = true
    accordionState.personality = true
  }
  
  /**
   * Generic function to set visibility for all sections in a category
   * @param {string} categoryName - The category name (primary, credentials, etc.)
   * @param {boolean} isVisible - Whether to show (true) or hide (false) all sections
   */
  const setCategoryVisibility = (categoryName, isVisible) => {
    availableSectionsByCategory[categoryName]?.forEach(section => {
      visibleSections[section] = isVisible
    })
    visibleSections = { ...visibleSections }
  }
</script>

<!-- Section Toggles -->
<Card 
  title="👁️ Visible Sections" 
  disabled={disabled}
  badge={disabled ? { text: 'Density Mode', variant: 'info' } : null}
>
  <div slot="actions">
    <Button 
      variant="outline" 
      size="xs" 
      ariaLabel="Select All"
      on:click={selectAllSections}
    >
      All
    </Button>
  </div>
    <div class="space-y-2">
      
      <!-- Primary Sections (Main Content) -->
      <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.primary}>
        <input type="checkbox" bind:checked={accordionState.primary} />
        <div class="collapse-title text-sm font-medium">
          📋 Primary Sections
        </div>
        <div class="collapse-content space-y-2">
          {#if availableSectionsByCategory.primary.length > 0}
            <div class="mb-3">
              <ButtonGroup 
                items={[
                  { text: 'All', action: () => setCategoryVisibility('primary', true), ariaLabel: 'Select All Primary' },
                  { text: 'None', action: () => setCategoryVisibility('primary', false), ariaLabel: 'Select None Primary' }
                ]}
              />
            </div>
          {/if}
          {#each availableSectionsByCategory.primary as section}
            <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
              <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
              <span class="text-sm capitalize">{section.replace('-', ' & ')}</span>
            </label>
          {/each}
          {#if availableSectionsByCategory.primary.length === 0}
            <p class="text-xs text-base-content/60">No primary sections in this preset</p>
          {/if}
        </div>
      </div>

      <!-- Credentials (Proof Points) -->
      <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.credentials}>
        <input type="checkbox" bind:checked={accordionState.credentials} />
        <div class="collapse-title text-sm font-medium">
          🏆 Credentials
        </div>
        <div class="collapse-content space-y-2">
          {#if availableSectionsByCategory.credentials.length > 0}
            <div class="flex gap-2 mb-3">
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('credentials', true)}
                title="Select All Credentials"
              >
                All
              </button>
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('credentials', false)}
                title="Select None Credentials"
              >
                None
              </button>
            </div>
          {/if}
          {#each availableSectionsByCategory.credentials as section}
            <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
              <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
              <span class="text-sm">
                {#if section === 'honors-awards'}Honors & Awards
                {:else if section === 'courses'}Relevant Coursework  
                {:else}{section.charAt(0).toUpperCase() + section.slice(1)}{/if}
              </span>
            </label>
          {/each}
          {#if availableSectionsByCategory.credentials.length === 0}
            <p class="text-xs text-base-content/60">No credential sections in this preset</p>
          {/if}
        </div>
      </div>

      <!-- Social Proof -->
      <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.socialProof}>
        <input type="checkbox" bind:checked={accordionState.socialProof} />
        <div class="collapse-title text-sm font-medium">
          💬 Social Proof
        </div>
        <div class="collapse-content space-y-2">
          {#if availableSectionsByCategory.socialProof.length > 0}
            <div class="flex gap-2 mb-3">
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('socialProof', true)}
                title="Select All Social Proof"
              >
                All
              </button>
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('socialProof', false)}
                title="Select None Social Proof"
              >
                None
              </button>
            </div>
          {/if}
          {#each availableSectionsByCategory.socialProof as section}
            <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
              <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
              <span class="text-sm capitalize">{section}</span>
            </label>
          {/each}
          {#if availableSectionsByCategory.socialProof.length === 0}
            <p class="text-xs text-base-content/60">No social proof sections in this preset</p>
          {/if}
        </div>
      </div>

      <!-- Personality -->
      <div class="collapse collapse-arrow bg-base-200 transition-all hover:bg-base-300" class:collapse-open={accordionState.personality}>
        <input type="checkbox" bind:checked={accordionState.personality} />
        <div class="collapse-title text-sm font-medium">
          🎭 Personality
        </div>
        <div class="collapse-content space-y-2">
          {#if availableSectionsByCategory.personality.length > 0}
            <div class="flex gap-2 mb-3">
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('personality', true)}
                title="Select All Personality"
              >
                All
              </button>
              <button 
                class="btn btn-xs btn-outline transition-transform hover:scale-110 active:scale-95" 
                on:click={() => setCategoryVisibility('personality', false)}
                title="Select None Personality"
              >
                None
              </button>
            </div>
          {/if}
          {#each availableSectionsByCategory.personality as section}
            <label class="flex items-center space-x-2 cursor-pointer transition-all hover:bg-base-100 p-1 rounded">
              <input type="checkbox" class="checkbox checkbox-sm transition-transform hover:scale-110" bind:checked={visibleSections[section]} />
              <span class="text-sm">
                {#if section === 'activities'}Activities & Interests
                {:else}Objective{/if}
              </span>
            </label>
          {/each}
          {#if availableSectionsByCategory.personality.length === 0}
            <p class="text-xs text-base-content/60">No personality sections in this preset</p>
          {/if}
        </div>
      </div>

    </div>
</Card> 