<script>
  import { onMount } from 'svelte'
  import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
  
  // Future: Import from stores
  // import { profileStore, skillsStore } from '@web/lib/stores'
  
  let mounted = false
  
  onMount(() => {
    mounted = true
    console.log('🚀 Resume Optimizer SvelteKit App Loaded!')
  })
</script>

<svelte:head>
  <title>Resume Optimizer - Web App</title>
  <meta name="description" content="Modern resume optimization with AI-powered matching" />
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-6xl">
  <header class="text-center mb-12">
    <div class="flex justify-center items-center mb-4">
      <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        🚀 Resume Optimizer
      </h1>
      <div class="ml-4">
        <ThemeSelector />
      </div>
    </div>
    <p class="text-xl opacity-70">
      Modern resume optimization with AI-powered matching
    </p>
  </header>

  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <h2 class="card-title text-2xl">🎯 SvelteKit Web App Ready</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div class="alert alert-success">
          <span>✅ SvelteKit configured</span>
        </div>
        <div class="alert alert-success">
          <span>✅ Netlify adapter ready</span>
        </div>
        <div class="alert alert-success">
          <span>✅ Path aliases working</span>
        </div>
        <div class="alert alert-success">
          <span>✅ CSS isolation configured</span>
        </div>
        <div class="alert alert-success">
          <span>✅ DaisyUI 5.0.46 ready</span>
        </div>
        <div class="alert alert-success">
          <span>✅ Theme selector working</span>
        </div>
      </div>
    </div>
  </div>

  <section class="mb-8">
    <h2 class="text-3xl font-bold mb-6">🚀 Coming Soon</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg">📄 Resume Preview</h3>
          <p>Live preview of your resume with real-time updates</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg">🎨 Theme Selector</h3>
          <p>✅ Now working! Switch between 35 professional themes</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg">🔧 Interactive Controls</h3>
          <p>Toggle sections, adjust spacing, and customize layout</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title text-lg">📊 Skills Highlighting</h3>
          <p>Prioritize relevant skills based on job requirements</p>
        </div>
      </div>
    </div>
  </section>

  <section class="mb-8">
    <h2 class="text-3xl font-bold mb-6">🛠️ Technology Stack</h2>
    <div class="flex flex-wrap gap-2">
      <div class="badge badge-primary">SvelteKit</div>
      <div class="badge badge-secondary">Vite</div>
      <div class="badge badge-accent">Playwright</div>
      <div class="badge badge-primary">Netlify</div>
      <div class="badge badge-secondary">CSS Grid</div>
      <div class="badge badge-accent">ES Modules</div>
      <div class="badge badge-primary">Tailwind CSS 4</div>
      <div class="badge badge-secondary">DaisyUI 5.0.46</div>
    </div>
  </section>

  {#if mounted}
    <div class="alert alert-success shadow-lg">
      <div>
        <h3 class="text-lg font-bold">🔧 Development Status</h3>
        <div class="text-sm">
          <p>App mounted successfully! SvelteKit is running in development mode.</p>
          <p>🎨 Theme selector is now working with all 35 DaisyUI themes!</p>
          <p>Next steps: JSON data loading → Resume preview → Interactive controls</p>
        </div>
      </div>
    </div>
  {/if}
</main> 