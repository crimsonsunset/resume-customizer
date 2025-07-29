import { render } from 'svelte/server'
import { loadAllProfileSections, applyPreset, loadPreset } from '@shared/preset-merger.js'
import { readdirSync } from 'node:fs'
import path from 'node:path'

// Import resume header for initial SSR
import ResumeHeader from '@web/lib/components/resume/ResumeHeader.svelte'

/**
 * Loads available presets from the presets directory
 * @returns {Array} Array of preset objects with name, value, and description
 */
function loadAvailablePresets() {
  try {
    const presetsPath = path.join(process.cwd(), 'input', 'profiles', 'presets')
    const files = readdirSync(presetsPath).filter(file => file.endsWith('.json'))
    
    const presets = []
    
    // Add default "full" option
    presets.push({
      value: 'full',
      name: 'Comprehensive Resume',
      description: 'Complete professional history and achievements'
    })
    
    // Load each preset file
    for (const file of files) {
      const presetName = file.replace('.json', '')
      const preset = loadPreset(presetName)
      if (preset && preset.meta) {
        presets.push({
          value: presetName,
          name: preset.meta.name || presetName,
          description: preset.meta.description || `${presetName} preset`,
          order: preset.meta.order || 999 // Default to end if no order specified
        })
      }
    }
    
    // Sort presets by order (Comprehensive Resume first, then by order field)
    presets.sort((a, b) => {
      // Comprehensive Resume always first
      if (a.value === 'full' && b.value === 'full') return 0
      if (a.value === 'full') return -1
      if (b.value === 'full') return 1
      
      // Sort others by order field
      return (a.order || 999) - (b.order || 999)
    })
    
    return presets
  } catch (error) {
    console.warn('⚠️ Could not load presets:', error.message)
          return [
        {
          value: 'full',
          name: 'Comprehensive Resume', 
          description: 'Complete professional history and achievements'
        }
      ]
  }
}

// eslint-disable-next-line complexity
export async function load({ url }) {
  try {

    
    // Load available presets
    const availablePresets = loadAvailablePresets()

    
    // Load raw JSON data
    const rawData = loadAllProfileSections()

    
    // Get preset parameter
    const presetParam = url.searchParams.get('preset')

    
    // Get density and timeframe parameters 
    const densityParam = Number.parseInt(url.searchParams.get('density') || '100', 10)
    const timeframeParam = Number.parseInt(url.searchParams.get('timeframe') || '0', 10) // 0 = all years
    console.log('📏 Density parameter:', densityParam, 'Timeframe:', timeframeParam === 0 ? 'all years' : `${timeframeParam} years`)
    
    // Apply preset if specified
    const finalData = presetParam ? applyPreset(rawData, presetParam) : rawData

    
    // Log basic info
    console.log('👤 Basic info:', {
      name: finalData.basic_info?.name,
      headline: finalData.basic_info?.headline,
      location: finalData.basic_info?.location,
      summary: finalData.basic_info?.summary,
      email: finalData.basic_info?.contact?.email,
      phone: finalData.basic_info?.contact?.phone,
      address: finalData.basic_info?.contact?.address,
      linkedin: finalData.basic_info?.contact?.linkedin,
      website: finalData.basic_info?.contact?.website,
      hasContact: Boolean(finalData.basic_info?.contact)
    })
    
    // Log experience data
    console.log('💼 Experience data:', {
      experienceExists: Boolean(finalData.sections?.experience),
      experienceCount: finalData.sections?.experience?.length || 0,
      firstExpTitle: finalData.sections?.experience?.[0]?.title || 'none'
    })
    
    // Log skills data
    console.log('🛠️ Skills data:', {
      skillsExists: Boolean(finalData.sections?.skills),
      skillsStructure: Object.keys(finalData.sections?.skills || {}),
      skillsCount: finalData.sections?.skills?.skills?.length || 0
    })
    
    // Log projects data
    console.log('🚀 Projects data:', {
      projectsExists: Boolean(finalData.sections?.projects),
      projectsCount: finalData.sections?.projects?.length || 0,
      firstProjectName: finalData.sections?.projects?.[0]?.name || 'none'
    })
    
    // Log education data
    console.log('🎓 Education data:', {
      educationExists: Boolean(finalData.sections?.education?.education),
      educationCount: finalData.sections?.education?.education?.length || 0,
      firstEducationInstitution: finalData.sections?.education?.education?.[0]?.institution || 'none'
    })

    // Log volunteering data
    console.log('🤝 Volunteering data:', {
      volunteeringExists: Boolean(finalData.sections?.volunteering),
      volunteeringCount: finalData.sections?.volunteering?.length || 0,
      firstVolunteerRole: finalData.sections?.volunteering?.[0]?.role || 'none',
      firstVolunteerOrg: finalData.sections?.volunteering?.[0]?.organization || 'none'
    })

    // Log honors-awards data
    console.log('🏆 Honors & Awards data:', {
      honorsAwardsExists: Boolean(finalData.sections?.['honors-awards']),
      honorsAwardsCount: finalData.sections?.['honors-awards']?.length || 0,
      firstAwardTitle: finalData.sections?.['honors-awards']?.[0]?.title || 'none',
      firstAwardIssuer: finalData.sections?.['honors-awards']?.[0]?.issuer || 'none'
    })

    // Log recommendations data
    console.log('💬 Recommendations data:', {
      recommendationsExists: Boolean(finalData.sections?.recommendations),
      givenCount: finalData.sections?.recommendations?.given?.length || 0,
      receivedCount: finalData.sections?.recommendations?.received?.length || 0,
      firstReceivedFrom: finalData.sections?.recommendations?.received?.[0]?.recommender_name || 'none'
    })

    // Log activities data
    console.log('🎭 Activities data:', {
      activitiesExists: Boolean(finalData.sections?.activities),
      activitiesCount: finalData.sections?.activities?.activities?.length || 0,
      personalInterestsCount: finalData.sections?.activities?.personal_interests?.length || 0,
      firstActivityOrg: finalData.sections?.activities?.activities?.[0]?.organization || 'none'
    })

    // Log courses data
    console.log('📚 Courses data:', {
      coursesExists: Boolean(finalData.sections?.courses),
      coursesCount: finalData.sections?.courses?.length || 0,
      firstCourseName: finalData.sections?.courses?.[0]?.name || 'none',
      firstCourseInstitution: finalData.sections?.courses?.[0]?.institution || 'none'
    })

    // Log certifications data
    console.log('📜 Certifications data:', {
      certificationsExists: Boolean(finalData.sections?.certifications),
      certificationsCount: finalData.sections?.certifications?.length || 0,
      firstCertName: finalData.sections?.certifications?.[0]?.name || 'none',
      firstCertOrg: finalData.sections?.certifications?.[0]?.issuing_organization || 'none'
    })
    
    // Render header for initial load information only
    const headerResult = render(ResumeHeader, { 
      props: { 
        profile: finalData,
        sections: finalData.sections || {},
        basicInfo: finalData.basic_info || {}
      } 
    })
    console.log('✅ ResumeHeader rendered, length:', headerResult.body.length)
    
    // NOTE: Moving to client-side progressive loading for better performance
    // Server-side rendering of all sections removed to reduce initial bundle size
    
    // Get section order from data or use default
    const sectionOrder = finalData.sections_order || ['headline', 'objective', 'summary', 'education', 'skills', 'experience', 'projects', 'honors-awards', 'volunteering', 'activities', 'certifications', 'courses', 'location', 'recommendations']
    console.log('📋 Sections order:', sectionOrder)
    
    // Get all possible sections from actual data structure
    const allPossibleSections = [
      'headline',
      'objective', 
      'summary',
      ...Object.keys(finalData.sections || {}),
      'location' // Special section that's derived from basic_info
    ].filter((section, index, arr) => arr.indexOf(section) === index) // Remove duplicates
    
    console.log('🎨 Client-side progressive loading enabled')
    console.log('📊 Data prepared for lazy loading:', {
      sectionsCount: Object.keys(finalData.sections || {}).length,
      sectionOrder: sectionOrder.length
    })
    
        // Calculate both filtered and total counts from actual raw data
    const totalCounts = {
      experience: Array.isArray(rawData.sections?.experience) ? rawData.sections.experience.length : 0,
      projects: Array.isArray(rawData.sections?.projects) ? rawData.sections.projects.length : 0,
      skills: rawData.sections?.skills?.skills?.length || 0,
      // education: Array.isArray(rawData.sections?.education?.education) ? rawData.sections.education.education.length : 0,
      // certifications: Array.isArray(rawData.sections?.certifications) ? rawData.sections.certifications.length : 0,
      recommendations: rawData.sections?.recommendations?.received?.length || 0,
      // activities: Array.isArray(rawData.sections?.activities?.activities) ? rawData.sections.activities.activities.length : 0,
      // volunteering: Array.isArray(rawData.sections?.volunteering) ? rawData.sections.volunteering.length : 0,
      // 'honors-awards': Array.isArray(rawData.sections?.['honors-awards']) ? rawData.sections['honors-awards'].length : 0
    }
    
    const filteredStats = {
      experience: finalData.sections?.experience?.preset_filters?.selected_indices === undefined ?
                  (Array.isArray(finalData.sections?.experience) ? finalData.sections.experience.length : 0) :
                  finalData.sections.experience.preset_filters.selected_indices.length,
      projects: finalData.sections?.projects?.preset_filters?.selected_indices === undefined ?
                (Array.isArray(finalData.sections?.projects) ? finalData.sections.projects.length : 0) :
                finalData.sections.projects.preset_filters.selected_indices.length,
      skills: finalData.sections?.skills?.preset_skills ?
              Object.values(finalData.sections.skills.preset_skills).reduce((total, categorySkills) =>
                  total + (Array.isArray(categorySkills) ? categorySkills.length : 0), 0) :
              (finalData.sections?.skills?.skills?.length || 0),
      // Calculate other filtered counts based on actual rendered sections
      // education: Array.isArray(finalData.sections?.education?.education) ? finalData.sections.education.education.length : 0,
      // certifications: Array.isArray(finalData.sections?.certifications) ? finalData.sections.certifications.length : 0,
      recommendations: finalData.sections?.recommendations?.preset_filters?.selected_indices === undefined ? 
                       (finalData.sections?.recommendations?.received?.length || 0) :
                       finalData.sections.recommendations.preset_filters.selected_indices.length,
      // activities: Array.isArray(finalData.sections?.activities?.activities) ? finalData.sections.activities.activities.length : 0,
      // volunteering: Array.isArray(finalData.sections?.volunteering) ? finalData.sections.volunteering.length : 0,
      // 'honors-awards': Array.isArray(finalData.sections?.['honors-awards']) ? finalData.sections['honors-awards'].length : 0
    }
    
    
    
    return {
      resumeContent: null, // No server-rendered content
      preset: presetParam || 'full',
      bulletDensity: densityParam,
      availablePresets,
      availableSections: sectionOrder, // Add the sections that are actually rendered
      totalAvailableSections: allPossibleSections, // All possible sections regardless of preset
      actuallyVisibleSections: [], // No server-side visibility tracking
      sections: finalData.sections, // Add the actual section data for stats calculation
      filteredStats, // Add pre-calculated filtered stats
      totalStats: totalCounts,
      data: finalData, // Pass full data for client-side rendering
      sections_order: sectionOrder,
      ...data
    }
    
  } catch (error) {
    console.error('❌ Error in load function:', error)
    
    return {
      resumeContent: null,
      error: error.message,
      preset: 'full',
      bulletDensity: 100,
      availablePresets: [],
      availableSections: [],
      totalAvailableSections: [],
      actuallyVisibleSections: [],
      sections: {},
      filteredStats: {},
      totalStats: {},
      data: null,
      sections_order: []
    }
  }
} 
