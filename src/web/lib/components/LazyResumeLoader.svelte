<!-- LazyResumeLoader.svelte - Progressive section loading for performance -->
<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { delay } from 'lodash-es'
    
    // Import all section components for client-side rendering
    import ResumeHeader from '@web/lib/components/resume/ResumeHeader.svelte'
    import HeadlineSection from '@web/lib/components/resume/HeadlineSection.svelte'
    import ObjectiveSection from '@web/lib/components/resume/ObjectiveSection.svelte'
    import SummarySection from '@web/lib/components/resume/SummarySection.svelte'
    import EducationSection from '@web/lib/components/resume/EducationSection.svelte'
    import SkillsSection from '@web/lib/components/resume/SkillsSection.svelte'
    import ExperienceSection from '@web/lib/components/resume/ExperienceSection.svelte'
    import ProjectsSection from '@web/lib/components/resume/ProjectsSection.svelte'
    import HonorsAwardsSection from '@web/lib/components/resume/HonorsAwardsSection.svelte'
    import VolunteeringSection from '@web/lib/components/resume/VolunteeringSection.svelte'
    import ActivitiesSection from '@web/lib/components/resume/ActivitiesSection.svelte'
    import CertificationsSection from '@web/lib/components/resume/CertificationsSection.svelte'
    import CoursesSection from '@web/lib/components/resume/CoursesSection.svelte'
    import LocationSection from '@web/lib/components/resume/LocationSection.svelte'
    import RecommendationsSection from '@web/lib/components/resume/RecommendationsSection.svelte'

    // Props
    export let data
    export let densityParam = 100
    export let timeframeParam = 0
    
    // Component mapping
    const componentMap = {
        'headline': HeadlineSection,
        'objective': ObjectiveSection,
        'summary': SummarySection,
        'education': EducationSection,
        'skills': SkillsSection,
        'experience': ExperienceSection,
        'projects': ProjectsSection,
        'honors-awards': HonorsAwardsSection,
        'volunteering': VolunteeringSection,
        'activities': ActivitiesSection,
        'certifications': CertificationsSection,
        'courses': CoursesSection,
        'location': LocationSection,
        'recommendations': RecommendationsSection
    }
    
    // Section order from data or default order
    $: sectionOrder = data.sections_order || [
        'headline', 'objective', 'summary', 'education', 'skills', 
        'experience', 'projects', 'honors-awards', 'volunteering', 
        'activities', 'certifications', 'courses', 'location', 'recommendations'
    ]
    
    // Loading state management
    let loadedSections = new Set()
    let isInitialLoad = true
    
    // Load immediate sections first (header + first 3 sections for above-fold content)
    const immediateSections = ['headline', 'objective', 'summary']
    
    // Progressive loading delays (in milliseconds)
    const SECTION_LOAD_DELAY = 150 // Delay between section loads
    const INITIAL_DELAY = 100 // Delay before starting lazy loading
    
    /**
     * Get props for a specific section
     */
    function getSectionProps(sectionName) {
        const baseProps = { bulletDensity: densityParam }
        
        switch (sectionName) {
            case 'headline':
                return {
                    headline: data.basic_info?.headline || '',
                    bulletDensity: densityParam,
                    profile: data
                }
            case 'objective':
                return {
                    objective: data.objective || null,
                    bulletDensity: densityParam,
                    profile: data
                }
            case 'summary':
                return {
                    summary: data.basic_info?.summary || '',
                    bulletDensity: densityParam,
                    profile: data
                }
            case 'experience':
                const expBaseConfig = data.sections?.experience?.preset_filters || {}
                const expConfig = {
                    ...expBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    experiences: data.sections?.experience || [],
                    bulletDensity: densityParam,
                    config: expConfig
                }
            case 'skills':
                return {
                    skillsData: data.sections?.skills || { skills: [] },
                    bulletDensity: densityParam,
                    config: data.sections?.skills?.preset_filters || {}
                }
            case 'projects':
                const projBaseConfig = data.sections?.projects?.preset_filters || {}
                const projConfig = {
                    ...projBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    projects: data.sections?.projects || [],
                    bulletDensity: densityParam,
                    config: projConfig
                }
            case 'education':
                const eduBaseConfig = data.sections?.education?.preset_filters || {}
                const eduConfig = {
                    ...eduBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    education: data.sections?.education?.education || [],
                    config: eduConfig
                }
            case 'courses':
                const coursesBaseConfig = data.sections?.courses?.preset_filters || {}
                const coursesConfig = {
                    ...coursesBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    courses: data.sections?.education?.courses || [],
                    bulletDensity: densityParam,
                    config: coursesConfig,
                    profile: data
                }
            case 'certifications':
                const certBaseConfig = data.sections?.certifications?.preset_filters || {}
                const certConfig = {
                    ...certBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    certifications: data.sections?.certifications || [],
                    bulletDensity: densityParam,
                    config: certConfig,
                    profile: data
                }
            case 'volunteering':
                const volBaseConfig = data.sections?.volunteering?.preset_filters || {}
                const volConfig = {
                    ...volBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    volunteering: data.sections?.volunteering || [],
                    bulletDensity: densityParam,
                    config: volConfig,
                    profile: data
                }
            case 'honors-awards':
                const honorsBaseConfig = data.sections?.['honors-awards']?.preset_filters || {}
                const honorsConfig = {
                    ...honorsBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    honorsAwards: data.sections?.['honors-awards'] || [],
                    bulletDensity: densityParam,
                    config: honorsConfig,
                    profile: data
                }
            case 'recommendations':
                const recBaseConfig = data.sections?.recommendations?.preset_filters || {}
                const recConfig = {
                    ...recBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    recommendations: data.sections?.recommendations || { received: [] },
                    bulletDensity: densityParam,
                    config: recConfig
                }
            case 'activities':
                const actBaseConfig = data.sections?.activities?.preset_filters || {}
                const actConfig = {
                    ...actBaseConfig,
                    timeframeYears: timeframeParam > 0 ? timeframeParam : null
                }
                return {
                    activities: data.sections?.activities || {},
                    bulletDensity: densityParam,
                    config: actConfig
                }
            case 'location':
                return {
                    location: data.basic_info?.location || ''
                }
            default:
                return baseProps
        }
    }
    
    /**
     * Progressive section loading
     */
    async function loadSectionsProgressively() {
        if (!browser) return
        
        console.log('🚀 Starting progressive section loading...')
        console.log('📋 Section order:', sectionOrder)
        
        // Load immediate sections first (no delay)
        for (const sectionName of immediateSections) {
            if (sectionOrder.includes(sectionName) && componentMap[sectionName]) {
                loadedSections.add(sectionName)
                loadedSections = loadedSections // Trigger reactivity
                console.log(`✅ Immediate load: ${sectionName}`)
            }
        }
        
        // Delay before starting lazy loading
        await delay(INITIAL_DELAY)
        
        // Load remaining sections progressively
        for (const sectionName of sectionOrder) {
            if (!immediateSections.includes(sectionName) && componentMap[sectionName]) {
                loadedSections.add(sectionName)
                loadedSections = loadedSections // Trigger reactivity
                console.log(`📦 Lazy loaded: ${sectionName}`)
                
                // Small delay between sections to avoid blocking
                await delay(SECTION_LOAD_DELAY)
            }
        }
        
        isInitialLoad = false
        console.log('🎉 All sections loaded!')
    }
    
    onMount(() => {
        loadSectionsProgressively()
    })
    
    // Check if section should be rendered
    function shouldRenderSection(sectionName) {
        return loadedSections.has(sectionName) && componentMap[sectionName]
    }
</script>

<!-- Resume Header (always load immediately) -->
<ResumeHeader
    profile={data}
    sections={data.sections || {}}
    basicInfo={data.basic_info || {}}
/>

<!-- Resume Content with Progressive Loading -->
<div class="resume-content">
    {#each sectionOrder as sectionName}
        {#if shouldRenderSection(sectionName)}
            <div class="section-container" data-section={sectionName}>
                <svelte:component 
                    this={componentMap[sectionName]} 
                    {...getSectionProps(sectionName)}
                />
            </div>
        {:else if !isInitialLoad}
            <!-- Show placeholder for unloaded sections during development -->
            <div class="section-placeholder" data-section={sectionName}>
                <div class="animate-pulse bg-gray-100 h-8 rounded mb-2"></div>
                <div class="animate-pulse bg-gray-50 h-4 rounded mb-1"></div>
                <div class="animate-pulse bg-gray-50 h-4 rounded w-3/4"></div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .section-container {
        /* Add any section-specific styling */
    }
    
    .section-placeholder {
        padding: 1rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>