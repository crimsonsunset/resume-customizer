<script>
  import { onMount } from 'svelte'
  import ThemeSelector from '@web/lib/components/ThemeSelector.svelte'
  
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
  
  // Hardcoded John Doe resume data
  const resumeData = {
    basic_info: {
      name: "John Doe",
      headline: "Senior Software Engineer | Full-Stack Development | Team Leadership",
      location: "San Francisco, CA",
      email: "john.doe@email.com", 
      phone: "(555) 123-4567",
      linkedin: "linkedin.com/in/johndoe",
      summary: "Experienced software engineer with 8+ years building scalable web applications. Proven track record leading development teams and delivering complex projects on time. Passionate about clean code, system architecture, and mentoring junior developers."
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        duration: "Jan 2022 - Present",
        bulletPoints: [
          "Led development of microservices architecture serving 10M+ daily users",
          "Mentored team of 5 junior developers, improving code quality by 40%",
          "Reduced API response times by 60% through optimization and caching strategies"
        ]
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ", 
        duration: "Mar 2020 - Dec 2021",
        bulletPoints: [
          "Built responsive web applications using React and Node.js",
          "Implemented CI/CD pipelines reducing deployment time by 50%",
          "Collaborated with design team to create intuitive user experiences"
        ]
      },
      {
        title: "Junior Developer",
        company: "WebSolutions LLC",
        duration: "Jun 2018 - Feb 2020", 
        bulletPoints: [
          "Developed and maintained e-commerce platforms for small businesses",
          "Fixed critical bugs improving application stability by 30%"
        ]
      }
    ],
    projects: [
      {
        name: "E-Commerce Platform",
        company: "TechCorp Inc.",
        description: "Built scalable e-commerce solution processing $2M+ monthly transactions",
        skills: ["React", "Node.js", "PostgreSQL", "AWS"]
      },
      {
        name: "Real-time Analytics Dashboard", 
        company: "StartupXYZ",
        description: "Created live analytics dashboard with WebSocket integration",
        skills: ["Vue.js", "Express", "Socket.io", "MongoDB"]
      }
    ],
    education: [
      {
        institution: "State University",
        degree: "Bachelor of Science, Computer Science",
        dates: "2014 - 2018",
        gpa: "3.7/4.0"
      }
    ],
    skills: [
      "JavaScript", "TypeScript", "React", "Node.js", "Python", 
      "AWS", "Docker", "PostgreSQL", "MongoDB", "Git"
    ]
  }
  
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
                <div class="stat-value text-lg">{resumeData.experience.length}</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Projects</div>
                <div class="stat-value text-lg">{resumeData.projects.length}</div>
              </div>
              <div class="stat py-2">
                <div class="stat-title text-xs">Skills</div>
                <div class="stat-value text-lg">{resumeData.skills.length}</div>
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
    <div class="flex-1 bg-white h-screen overflow-y-auto">
      <div class="p-8">
        <div class="max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 resume-container"
             class:space-y-2={density === 'compact'}
             class:space-y-4={density === 'medium'}
             class:space-y-6={density === 'spacious'}>
          
          <!-- Resume Header -->
          <div class="p-8 border-b border-gray-200">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{resumeData.basic_info.name}</h1>
            <p class="text-lg text-gray-600 mb-4">{resumeData.basic_info.headline}</p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📧 {resumeData.basic_info.email}</span>
              <span>📞 {resumeData.basic_info.phone}</span>
              <span>📍 {resumeData.basic_info.location}</span>
              <span>💼 {resumeData.basic_info.linkedin}</span>
            </div>
          </div>

          <!-- Resume Content -->
          <div class="p-8 space-y-6">
            
            <!-- Summary Section -->
            {#if visibleSections.summary}
              <section class="space-y-2">
                <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-1">Summary</h2>
                <p class="text-gray-700 leading-relaxed">{resumeData.basic_info.summary}</p>
              </section>
            {/if}

            <!-- Experience Section -->
            {#if visibleSections.experience}
              <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-1">Experience</h2>
                {#each resumeData.experience as exp}
                  <div class="space-y-2">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-semibold text-gray-900">{exp.title}</h3>
                        <p class="text-gray-600">{exp.company}</p>
                      </div>
                      <span class="text-sm text-gray-500">{exp.duration}</span>
                    </div>
                    <ul class="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      {#each exp.bulletPoints as bullet}
                        <li>{bullet}</li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </section>
            {/if}

            <!-- Projects Section -->
            {#if visibleSections.projects}
              <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-1">Projects</h2>
                {#each resumeData.projects as project}
                  <div class="space-y-2">
                    <h3 class="font-semibold text-gray-900">{project.name}</h3>
                    <p class="text-gray-700">{project.description}</p>
                    <div class="flex flex-wrap gap-2">
                      {#each project.skills as skill}
                        <span class="badge badge-outline badge-sm">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </section>
            {/if}

            <!-- Education Section -->
            {#if visibleSections.education}
              <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-1">Education</h2>
                {#each resumeData.education as edu}
                  <div>
                    <h3 class="font-semibold text-gray-900">{edu.degree}</h3>
                    <p class="text-gray-600">{edu.institution} • {edu.dates}</p>
                    {#if edu.gpa}
                      <p class="text-sm text-gray-500">GPA: {edu.gpa}</p>
                    {/if}
                  </div>
                {/each}
              </section>
            {/if}

            <!-- Skills Section -->
            {#if visibleSections.skills}
              <section class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-900 border-b border-gray-300 pb-1">Skills</h2>
                <div class="flex flex-wrap gap-2">
                  {#each resumeData.skills as skill}
                    <span class="badge badge-primary badge-md">{skill}</span>
                  {/each}
                </div>
              </section>
            {/if}

          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Ensure resume preview maintains clean styling */
  .resume-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.5;
  }
  
  .resume-container h1,
  .resume-container h2,
  .resume-container h3 {
    font-weight: 600;
  }
</style> 