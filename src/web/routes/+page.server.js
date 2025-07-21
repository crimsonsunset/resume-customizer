import { render } from 'svelte/server'
import { loadAllProfileSections, applyPreset, loadPreset } from '@shared/preset-merger.js'
import { readdirSync } from 'node:fs'
import path from 'node:path'

// Import resume section components
import ResumeHeader from '@web/lib/components/resume/ResumeHeader.svelte'
import ObjectiveSection from '@web/lib/components/resume/ObjectiveSection.svelte'
import ExperienceSection from '@web/lib/components/resume/ExperienceSection.svelte'
import SkillsSection from '@web/lib/components/resume/SkillsSection.svelte'
import ProjectsSection from '@web/lib/components/resume/ProjectsSection.svelte'
import EducationSection from '@web/lib/components/resume/EducationSection.svelte'
import CoursesSection from '@web/lib/components/resume/CoursesSection.svelte'
import CertificationsSection from '@web/lib/components/resume/CertificationsSection.svelte'
import VolunteeringSection from '@web/lib/components/resume/VolunteeringSection.svelte'
import HonorsAwardsSection from '@web/lib/components/resume/HonorsAwardsSection.svelte'
import RecommendationsSection from '@web/lib/components/resume/RecommendationsSection.svelte'
import ActivitiesSection from '@web/lib/components/resume/ActivitiesSection.svelte'
import HeadlineSection from '@web/lib/components/resume/HeadlineSection.svelte'
import LocationSection from '@web/lib/components/resume/LocationSection.svelte'
import SummarySection from '@web/lib/components/resume/SummarySection.svelte'

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
          description: preset.meta.description || `${presetName} preset`
        })
      }
    }
    
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

export async function load({ url }) {
  try {
    console.log('🔄 Starting server load...')
    
    // Load available presets
    const availablePresets = loadAvailablePresets()
    console.log('📋 Available presets:', availablePresets.map(p => p.name))
    
    // Load raw JSON data
    const rawData = loadAllProfileSections()
    console.log('📊 Raw data loaded successfully')
    console.log('🔍 Raw data structure:', Object.keys(rawData))
    
    // Get preset parameter
    const presetParam = url.searchParams.get('preset')
    console.log('🎯 Preset parameter:', presetParam)
    
    // Get density and timeframe parameters 
    const densityParam = Number.parseInt(url.searchParams.get('density') || '100', 10)
    const timeframeParam = Number.parseInt(url.searchParams.get('timeframe') || '0', 10) // 0 = all years
    console.log('📏 Density parameter:', densityParam, 'Timeframe:', timeframeParam === 0 ? 'all years' : `${timeframeParam} years`)
    
    // Apply preset if specified
    const finalData = presetParam ? applyPreset(rawData, presetParam) : rawData
    console.log('✅ Final data prepared')
    console.log('🔍 Final data structure:', Object.keys(finalData))
    console.log('🔍 Final data.sections:', Object.keys(finalData.sections || {}))
    
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
    
    // Render each component with the data
    console.log('🎨 Rendering ResumeHeader...')
    const headerResult = render(ResumeHeader, { 
      props: { 
        basicInfo: finalData.basic_info 
      } 
    })
    console.log('✅ ResumeHeader rendered, length:', headerResult.body.length)
    
    // Create component renderers map
    const componentRenderers = {
      objective: () => render(ObjectiveSection, { 
        props: { 
          objective: finalData.objective || null,
          bulletDensity: densityParam,
          profile: finalData
        } 
      }),
      experience() {
        const baseConfig = finalData.sections?.experience?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(ExperienceSection, { 
          props: { 
            experiences: finalData.sections?.experience || [],
            bulletDensity: densityParam,
            config
          } 
        })
      },
      skills: () => render(SkillsSection, { 
        props: { 
          skillsData: finalData.sections?.skills || { skills: [] },
          bulletDensity: densityParam,
          config: finalData.sections?.skills?.preset_filters || {}
        } 
      }),
      projects() {
        const baseConfig = finalData.sections?.projects?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(ProjectsSection, { 
          props: { 
            projects: finalData.sections?.projects || [],
            bulletDensity: densityParam,
            config
          } 
        })
      },
      education() {
        const baseConfig = finalData.sections?.education?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(EducationSection, { 
          props: { 
            education: finalData.sections?.education?.education || [],
            config
          } 
        })
      },
      courses() {
        const baseConfig = finalData.sections?.courses?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(CoursesSection, { 
          props: { 
            courses: finalData.sections?.education?.courses || [],
            bulletDensity: densityParam,
            config,
            profile: finalData
          } 
        })
      },
      certifications() {
        const baseConfig = finalData.sections?.certifications?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(CertificationsSection, { 
          props: { 
            certifications: finalData.sections?.certifications || [],
            bulletDensity: densityParam,
            config,
            profile: finalData
          } 
        })
      },
      volunteering() {
        const baseConfig = finalData.sections?.volunteering?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(VolunteeringSection, { 
          props: { 
            volunteering: finalData.sections?.volunteering || [],
            bulletDensity: densityParam,
            config,
            profile: finalData
          } 
        })
      },
      'honors-awards'() {
        const baseConfig = finalData.sections?.['honors-awards']?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(HonorsAwardsSection, { 
          props: { 
            honorsAwards: finalData.sections?.['honors-awards'] || [],
            bulletDensity: densityParam,
            config,
            profile: finalData
          } 
        })
      },
      recommendations() {
        const baseConfig = finalData.sections?.recommendations?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(RecommendationsSection, { 
          props: { 
            recommendations: finalData.sections?.recommendations || { received: [] },
            bulletDensity: densityParam,
            config
          } 
        })
      },
      activities() {
        const baseConfig = finalData.sections?.activities?.preset_filters || {}
        const config = {
          ...baseConfig,
          timeframeYears: timeframeParam > 0 ? timeframeParam : null
        }
        return render(ActivitiesSection, { 
          props: { 
            activities: finalData.sections?.activities || {},
            bulletDensity: densityParam,
            config
          } 
        })
      },
      headline: () => render(HeadlineSection, {
        props: {
          headline: finalData.basic_info?.headline || '',
          bulletDensity: densityParam,
          profile: finalData
        }
      }),
      location: () => render(LocationSection, {
        props: {
          location: finalData.basic_info?.location || ''
        }
        // Note: location renderer kept for future use but excluded from user controls (shown in header)
      }),
      summary: () => render(SummarySection, {
        props: {
          summary: finalData.basic_info?.summary || '',
          bulletDensity: densityParam,
          profile: finalData
        }
      })
    }
    
    // Get section order from data or use default
    const sectionOrder = finalData.sections_order || ['headline', 'objective', 'summary', 'education', 'skills', 'experience', 'projects', 'honors-awards', 'volunteering', 'activities', 'certifications', 'courses', 'location', 'recommendations']
    console.log('📋 Sections order:', sectionOrder)
    
    // Render sections in specified order and track visibility
    const sectionResults = []
    const actuallyVisibleSections = []
    const EMPTY_SECTION_THRESHOLD = 100 // Sections with content below this are considered empty/filtered
    
    for (const sectionName of sectionOrder) {
      if (componentRenderers[sectionName]) {
        console.log(`🎨 Rendering ${sectionName}Section...`)
        const result = componentRenderers[sectionName]()
        const isVisible = result.body.length > EMPTY_SECTION_THRESHOLD
        console.log(`✅ ${sectionName}Section rendered, length: ${result.body.length}${isVisible ? ' (visible)' : ' (filtered out)'}`)
        
        if (isVisible) {
          actuallyVisibleSections.push(sectionName)
        }
        
        sectionResults.push(result.body)
      }
    }
    
    console.log('🔍 Actually visible sections:', actuallyVisibleSections)
    
    // Combine header + sections in order with proper CSS Grid structure
    const resumeContent = `
      ${headerResult.body}
      <div class="resume-content">
        ${sectionResults.join('\n')}
      </div>
    `
    
    console.log('🎨 Components rendered successfully')
    console.log('📏 Total content length:', resumeContent.length)
    console.log('🔍 Content preview:', resumeContent.slice(0, 200))
    
    // Calculate filtered stats for ResumeStats component
    const filteredStats = {
      experience: 0,
      projects: 0, 
      skills: 0
    }
    
    // Experience count (check for preset filtering)
    if (finalData.sections.experience) {
      const expFilters = finalData.sections.experience.preset_filters || {}
      if (expFilters.selected_indices && Array.isArray(expFilters.selected_indices)) {
        filteredStats.experience = expFilters.selected_indices.length
      } else {
        filteredStats.experience = Array.isArray(finalData.sections.experience) ? finalData.sections.experience.length : 0
      }
    }
    
    // Projects count (check for preset filtering)
    if (finalData.sections.projects) {
      const projFilters = finalData.sections.projects.preset_filters || {}
      if (projFilters.selected_indices && Array.isArray(projFilters.selected_indices)) {
        filteredStats.projects = projFilters.selected_indices.length
      } else {
        filteredStats.projects = Array.isArray(finalData.sections.projects) ? finalData.sections.projects.length : 0
      }
    }
    
    // Skills count (check for preset skills)
    if (finalData.sections.skills) {
      if (finalData.sections.skills.preset_skills) {
        // Count preset skills across all categories
        const presetSkills = finalData.sections.skills.preset_skills
        filteredStats.skills = Object.values(presetSkills).reduce((total, categorySkills) => {
          return total + (Array.isArray(categorySkills) ? categorySkills.length : 0)
        }, 0)
      } else if (finalData.sections.skills.skills) {
        filteredStats.skills = finalData.sections.skills.skills.length
      }
    }
    

    
    return {
      resumeContent,
      preset: presetParam || 'full',
      bulletDensity: densityParam,
      availablePresets,
      availableSections: sectionOrder, // Add the sections that are actually rendered
      actuallyVisibleSections, // Sections that are visible after density filtering
      sections: finalData.sections, // Add the actual section data for stats calculation
      filteredStats // Add pre-calculated filtered stats
    }
  } catch (error) {
    console.error('❌ Error in server load:', error.message)
    console.error('❌ Stack:', error.stack)
    return {
      resumeContent: `<p>Error: ${error.message}</p>`,
      preset: 'full',
      bulletDensity: 100,
      availablePresets: [{ value: 'full', name: 'Comprehensive Resume', description: 'Complete professional history and achievements' }]
    }
  }
} 