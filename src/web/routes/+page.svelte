<script>
  import { onMount } from 'svelte'
  import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
  import ResumeViewer from '@web/lib/components/ResumeViewer.svelte'
  
  export let data
  
  let mounted = false
  
  // Resume state management
  let selectedVersion = 'full'
  let density = 'medium'
  let visibleSections = {
    summary: true,
    experience: true,
    projects: true,
    education: true,
    skills: true
  }
  
  // Resume data is now loaded from the server via data.resumeContent
  
  onMount(() => {
    mounted = true
    console.log('🚀 Resume Customizer Loaded!')
  })
  
  const toggleSection = (section) => {
    visibleSections[section] = !visibleSections[section]
  }
  
  const selectAllSections = () => {
    Object.keys(visibleSections).forEach(section => {
      visibleSections[section] = true
    })
  }
  
  const selectNoneSections = () => {
    Object.keys(visibleSections).forEach(section => {
      visibleSections[section] = false
    })
  }
  
  const exportToPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!')
  }
</script>

<svelte:head>
  <title>Resume Optimizer - Web App</title>
  <meta name="description" content="Modern resume optimization with AI-powered matching" />
</svelte:head>

<div class="min-h-screen bg-base-200">
  <!-- Header -->
  <header class="bg-base-100 border-b border-base-300 px-6 py-4">
    <div class="flex justify-between items-center max-w-7xl mx-auto">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-primary">🚀 Resume Optimizer</h1>
      </div>
      <div class="flex items-center space-x-4">
        <ThemeSelector />
        <button class="btn btn-primary" on:click={exportToPDF}>
          📥 Export PDF
        </button>
      </div>
    </div>
  </header>

  <!-- Main Split-Screen Layout -->
  <div class="flex max-w-7xl mx-auto">
    <!-- Left Control Panel -->
    <div class="w-96 bg-base-100 border-r border-base-300 h-screen overflow-y-auto">
      <div class="p-6 space-y-6">
        
        <!-- Version Selector -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📋 Resume Version</h3>
            <select class="select select-sm w-full" bind:value={selectedVersion}>
              <option value="full">Complete Resume</option>
              <option value="short">One-Page Resume</option>
              <option value="leadership">Management-Focused</option>
              <option value="technical">Technical Deep-Dive</option>
            </select>
          </div>
        </div>

        <!-- Section Toggles -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="card-title text-sm">👁️ Visible Sections</h3>
              <div class="flex space-x-1">
                <button 
                  class="btn btn-xs btn-outline" 
                  on:click={selectAllSections}
                  title="Select All"
                >
                  All
                </button>
                <button 
                  class="btn btn-xs btn-outline" 
                  on:click={selectNoneSections}
                  title="Select None"
                >
                  None
                </button>
              </div>
            </div>
            <div class="space-y-2">
              {#each Object.entries(visibleSections) as [section, visible]}
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm" 
                    bind:checked={visibleSections[section]}
                  />
                  <span class="text-sm capitalize">{section}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>

        <!-- Density Controls -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📏 Spacing Density</h3>
            <div class="btn-group btn-group-vertical w-full">
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'compact'}
                on:click={() => density = 'compact'}
              >
                Compact
              </button>
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'medium'}
                on:click={() => density = 'medium'}
              >
                Medium
              </button>
              <button 
                class="btn btn-sm" 
                class:btn-active={density === 'spacious'}
                on:click={() => density = 'spacious'}
              >
                Spacious
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">📊 Resume Stats</h3>
            <div class="stats stats-vertical shadow-none text-xs">
              <div class="stat py-2">
                <div class="stat-title text-xs">Experience Items</div>
                <div class="stat-value text-lg">8</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Projects</div>
                <div class="stat-value text-lg">5</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Skills</div>
                <div class="stat-value text-lg">30+</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coming Soon Features -->
        <div class="card bg-base-100 shadow-sm border border-base-300 opacity-60">
          <div class="card-body p-4">
            <h3 class="card-title text-sm">🔮 Coming Soon</h3>
            <div class="space-y-2 text-xs">
              <div class="flex items-center space-x-2">
                <span>🎯</span>
                <span>Job Description Matcher</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>📝</span>
                <span>Content Optimizer</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>📊</span>
                <span>ATS Score Checker</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Right Resume Preview -->
    <div class="flex-1 h-screen overflow-y-auto">
      <div class="p-8">
        <ResumeViewer>
          {@html data.resumeContent}
        </ResumeViewer>
      </div>
    </div>
  </div>
</div>
