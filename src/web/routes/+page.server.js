import { render } from 'svelte/server'
import { loadAllProfileSections, applyPreset } from '@shared/preset-merger.js'

// Import resume section components
import ResumeHeader from '@web/lib/components/resume/ResumeHeader.svelte'
import ObjectiveSection from '@web/lib/components/resume/ObjectiveSection.svelte'
import ExperienceSection from '@web/lib/components/resume/ExperienceSection.svelte'
import SkillsSection from '@web/lib/components/resume/SkillsSection.svelte'
import ProjectsSection from '@web/lib/components/resume/ProjectsSection.svelte'
import EducationSection from '@web/lib/components/resume/EducationSection.svelte'
import VolunteeringSection from '@web/lib/components/resume/VolunteeringSection.svelte'
import HonorsAwardsSection from '@web/lib/components/resume/HonorsAwardsSection.svelte'
import ActivitiesSection from '@web/lib/components/resume/ActivitiesSection.svelte'

export async function load({ url }) {
  try {
    console.log('🔄 Starting server load...')
    
    // Load raw JSON data
    const rawData = loadAllProfileSections()
    console.log('📊 Raw data loaded successfully')
    console.log('🔍 Raw data structure:', Object.keys(rawData))
    
    // Get preset parameter
    const presetParam = url.searchParams.get('preset')
    console.log('🎯 Preset parameter:', presetParam)
    
    // Apply preset if specified
    const finalData = presetParam ? applyPreset(rawData, presetParam) : rawData
    console.log('✅ Final data prepared')
    console.log('🔍 Final data structure:', Object.keys(finalData))
    console.log('🔍 Final data.sections:', Object.keys(finalData.sections || {}))
    
    // Log basic info
    console.log('👤 Basic info:', {
      name: finalData.basic_info?.name,
      email: finalData.basic_info?.contact?.email,
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

    // Log activities data
    console.log('🎭 Activities data:', {
      activitiesExists: Boolean(finalData.sections?.activities),
      activitiesCount: finalData.sections?.activities?.activities?.length || 0,
      personalInterestsCount: finalData.sections?.activities?.personal_interests?.length || 0,
      firstActivityOrg: finalData.sections?.activities?.activities?.[0]?.organization || 'none'
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
          objective: finalData.objective || null
        } 
      }),
      experience: () => render(ExperienceSection, { 
        props: { 
          experiences: finalData.sections?.experience || [],
          bulletDensity: 100
        } 
      }),
      skills: () => render(SkillsSection, { 
        props: { 
          skillsData: finalData.sections?.skills || { skills: [] },
          config: { preset: presetParam }
        } 
      }),
      projects: () => render(ProjectsSection, { 
        props: { 
          projects: finalData.sections?.projects || [],
          config: { preset: presetParam }
        } 
      }),
      education: () => render(EducationSection, { 
        props: { 
          education: finalData.sections?.education?.education || [],
          config: { preset: presetParam }
        } 
      }),
      volunteering: () => render(VolunteeringSection, { 
        props: { 
          volunteering: finalData.sections?.volunteering || [],
          config: { preset: presetParam }
        } 
      }),
      'honors-awards': () => render(HonorsAwardsSection, { 
        props: { 
          honorsAwards: finalData.sections?.['honors-awards'] || [],
          config: { preset: presetParam }
        } 
      }),
      activities: () => render(ActivitiesSection, { 
        props: { 
          activities: finalData.sections?.activities || {},
          config: { preset: presetParam }
        } 
      })
    }
    
    // Get section order from data or use default
    const sectionOrder = finalData.sections_order || ['objective', 'experience', 'projects', 'skills', 'education', 'volunteering', 'honors-awards', 'activities']
    console.log('📋 Sections order:', sectionOrder)
    
    // Render sections in specified order
    const sectionResults = []
    for (const sectionName of sectionOrder) {
      if (componentRenderers[sectionName]) {
        console.log(`🎨 Rendering ${sectionName}Section...`)
        const result = componentRenderers[sectionName]()
        console.log(`✅ ${sectionName}Section rendered, length:`, result.body.length)
        sectionResults.push(result.body)
      }
    }
    
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
    
    return {
      resumeContent,
      preset: presetParam || 'full',
      bulletDensity: 100
    }
  } catch (error) {
    console.error('❌ Error in server load:', error.message)
    console.error('❌ Stack:', error.stack)
    return {
      resumeContent: `<p>Error: ${error.message}</p>`,
      preset: 'full',
      bulletDensity: 100
    }
  }
} 