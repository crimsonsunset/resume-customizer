<script>
  import { onMount } from 'svelte'
  
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

<main class="container">
  <header class="hero">
    <h1>🚀 Resume Optimizer</h1>
    <p class="subtitle">Modern resume optimization with AI-powered matching</p>
  </header>

  <section class="status-card">
    <h2>🎯 SvelteKit Web App Ready</h2>
    <div class="status-grid">
      <div class="status-item">
        <span class="status-icon">✅</span>
        <span>SvelteKit configured</span>
      </div>
      <div class="status-item">
        <span class="status-icon">✅</span>
        <span>Netlify adapter ready</span>
      </div>
      <div class="status-item">
        <span class="status-icon">✅</span>
        <span>Path aliases working</span>
      </div>
      <div class="status-item">
        <span class="status-icon">✅</span>
        <span>CSS isolation configured</span>
      </div>
      <div class="status-item">
        <span class="status-icon">🔄</span>
        <span>shadcn-svelte (next)</span>
      </div>
      <div class="status-item">
        <span class="status-icon">🔄</span>
        <span>JSON data integration (next)</span>
      </div>
    </div>
  </section>

  <section class="features-preview">
    <h2>🚀 Coming Soon</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h3>📄 Resume Preview</h3>
        <p>Live preview of your resume with real-time updates</p>
      </div>
      <div class="feature-card">
        <h3>🎨 Theme Selector</h3>
        <p>Multiple professional themes with custom color schemes</p>
      </div>
      <div class="feature-card">
        <h3>🔧 Interactive Controls</h3>
        <p>Toggle sections, adjust spacing, and customize layout</p>
      </div>
      <div class="feature-card">
        <h3>📊 Skills Highlighting</h3>
        <p>Prioritize relevant skills based on job requirements</p>
      </div>
    </div>
  </section>

  <section class="tech-stack">
    <h2>🛠️ Technology Stack</h2>
    <div class="tech-grid">
      <span class="tech-badge">SvelteKit</span>
      <span class="tech-badge">Vite</span>
      <span class="tech-badge">Playwright</span>
      <span class="tech-badge">Netlify</span>
      <span class="tech-badge">CSS Grid</span>
      <span class="tech-badge">ES Modules</span>
    </div>
  </section>

  {#if mounted}
    <section class="dev-info">
      <h3>🔧 Development Status</h3>
      <p>App mounted successfully! SvelteKit is running in development mode.</p>
      <p>Next steps: shadcn-svelte integration → JSON data loading → Resume preview</p>
    </section>
  {/if}
</main>

<style>
  /* Scoped web-ui styles - isolated from resume styles */
  :global(.web-ui) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8f9fa;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .hero h1 {
    font-size: 3rem;
    margin: 0;
    color: #2c3e50;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.25rem;
    color: #6c757d;
    margin: 0.5rem 0 0 0;
  }

  .status-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .status-card h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .features-preview {
    margin-bottom: 2rem;
  }

  .features-preview h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid #e9ecef;
  }

  .feature-card h3 {
    color: #495057;
    margin-bottom: 0.75rem;
  }

  .feature-card p {
    color: #6c757d;
    margin: 0;
    line-height: 1.5;
  }

  .tech-stack {
    margin-bottom: 2rem;
  }

  .tech-stack h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .tech-badge {
    background: #667eea;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .dev-info {
    background: #e8f5e8;
    border: 1px solid #4caf50;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .dev-info h3 {
    color: #2e7d32;
    margin-bottom: 0.75rem;
  }

  .dev-info p {
    color: #388e3c;
    margin: 0.5rem 0;
  }
</style> 