import { render } from 'svelte/server'
import { loadAllProfileSections, applyPreset } from '@shared/preset-merger.js'

// Import resume section components
import ResumeHeader from '@web/lib/components/resume/ResumeHeader.svelte'
import ObjectiveSection from '@web/lib/components/resume/ObjectiveSection.svelte'
import ExperienceSection from '@web/lib/components/resume/ExperienceSection.svelte'
import SkillsSection from '@web/lib/components/resume/SkillsSection.svelte'

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
    
    // Render each component with the data
    console.log('🎨 Rendering ResumeHeader...')
    const headerResult = render(ResumeHeader, { 
      props: { 
        basicInfo: finalData.basic_info 
      } 
    })
    console.log('✅ ResumeHeader rendered, length:', headerResult.body.length)
    
    console.log('🎨 Rendering ObjectiveSection...')
    const objectiveResult = render(ObjectiveSection, { 
      props: { 
        objective: finalData.objective || null
      } 
    })
    console.log('✅ ObjectiveSection rendered, length:', objectiveResult.body.length)
    
    console.log('🎨 Rendering ExperienceSection...')
    const experienceResult = render(ExperienceSection, { 
      props: { 
        experiences: finalData.sections?.experience || [],
        bulletDensity: 100
      } 
    })
    console.log('✅ ExperienceSection rendered, length:', experienceResult.body.length)
    
    console.log('🎨 Rendering SkillsSection...')
    const skillsResult = render(SkillsSection, { 
      props: { 
        skillsData: finalData.sections?.skills || { skills: [] },
        config: { preset: presetParam }
      } 
    })
    console.log('✅ SkillsSection rendered, length:', skillsResult.body.length)
    
    // Combine all rendered HTML
    const resumeContent = `
      ${headerResult.body}
      ${objectiveResult.body}
      ${experienceResult.body}
      ${skillsResult.body}
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