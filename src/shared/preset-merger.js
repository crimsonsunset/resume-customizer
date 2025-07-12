import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Loads a preset file by name with error handling
 * @param {string} presetName - Name of the preset (e.g., 'one-page')
 * @returns {object|null} Preset data or null if not found
 */
export function loadPreset(presetName) {
  try {
    const presetPath = path.join(process.cwd(), 'input', 'profiles', 'presets', `${presetName}.json`)
    const presetData = readFileSync(presetPath, 'utf8')
    return JSON.parse(presetData)
  } catch (error) {
    console.warn(`⚠️ Preset '${presetName}' not found or malformed: ${error.message}`)
    return null
  }
}

/**
 * Loads all profile section files
 * @returns {object} Combined profile data from all sections
 */
export function loadAllProfileSections() {
  const sectionsPath = path.join(process.cwd(), 'input', 'profiles', 'sections')
  const profilePath = path.join(process.cwd(), 'input', 'profiles', 'profile.json')
  
  try {
    // Load main profile
    const profile = JSON.parse(readFileSync(profilePath, 'utf8'))
    
    // Load all sections
    const sections = {}
    const sectionFiles = ['experience.json', 'projects.json', 'education.json', 'skills.json', 'recommendations.json', 'activities.json']
    
    for (const file of sectionFiles) {
      try {
        const sectionPath = path.join(sectionsPath, file)
        const sectionData = JSON.parse(readFileSync(sectionPath, 'utf8'))
        const sectionName = file.replace('.json', '')
        sections[sectionName] = sectionData
      } catch (error) {
        console.warn(`⚠️ Could not load section ${file}: ${error.message}`)
      }
    }
    
    return {
      ...profile,
      sections
    }
  } catch (error) {
    console.error(`❌ Failed to load profile data: ${error.message}`)
    throw error
  }
}

/**
 * Merges preset overrides with raw profile data
 * @param {object} rawData - Raw profile data from sections
 * @param {object} preset - Preset configuration with overrides
 * @returns {object} Merged profile data
 */
export function mergePresetWithRawData(rawData, preset) {
  if (!preset || !preset.overrides) {
    console.warn('🔄 No preset overrides found, using raw data')
    return rawData
  }
  
  const merged = { ...rawData }
  const { overrides } = preset
  
  // Apply skill overrides
  if (overrides.skills) {
    merged.sections = merged.sections || {}
    merged.sections.skills = {
      ...merged.sections.skills,
      preset_skills: overrides.skills
    }
  }
  
  // Apply experience filtering
  if (overrides.experience) {
    merged.sections = merged.sections || {}
    merged.sections.experience = {
      ...merged.sections.experience,
      filters: overrides.experience
    }
  }
  
  // Apply project filtering
  if (overrides.projects) {
    merged.sections = merged.sections || {}
    merged.sections.projects = {
      ...merged.sections.projects,
      filters: overrides.projects
    }
  }
  
  // Add objective if specified
  if (overrides.objective) {
    merged.objective = overrides.objective
  }
  
  // Add sections order if specified
  if (overrides.sections_order) {
    merged.sections_order = overrides.sections_order
  }
  
  return merged
}

/**
 * Main function to apply preset to profile data
 * @param {object} rawData - Raw profile data
 * @param {string} presetName - Name of preset to apply
 * @returns {object} Profile data with preset applied
 */
export function applyPreset(rawData, presetName) {
  // Default to raw data if no preset specified
  if (!presetName || presetName === 'full') {
    return rawData
  }
  
  // Load preset
  const preset = loadPreset(presetName)
  if (!preset) {
    console.warn(`🔄 Falling back to raw data due to preset load failure`)
    return rawData
  }
  
  // Merge preset with raw data
  try {
    const merged = mergePresetWithRawData(rawData, preset)
    console.log(`✅ Successfully applied preset: ${preset.meta?.name || presetName}`)
    return merged
  } catch (error) {
    console.error(`❌ Failed to merge preset: ${error.message}`)
    console.warn('🔄 Falling back to raw data')
    return rawData
  }
} 