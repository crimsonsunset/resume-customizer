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
    
    // Get preset parameter
    const presetParam = url.searchParams.get('preset')
    console.log('🎯 Preset parameter:', presetParam)
    
    // Apply preset if specified
    const finalData = presetParam ? applyPreset(rawData, presetParam) : rawData
    console.log('✅ Final data prepared')
    
    // Return JSON data for debugging
    return {
      resumeContent: `<div style="font-family: monospace; white-space: pre-wrap; padding: 20px; background: #f5f5f5; border: 1px solid #ddd; margin: 20px; max-height: 600px; overflow-y: auto;">${JSON.stringify(finalData, null, 2)}</div>`,
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