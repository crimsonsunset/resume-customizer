import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the directory of this module and calculate input directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine input directory based on environment
let inputDir
if (process.env.NETLIFY_DEV || process.env.NETLIFY) {
  // In Netlify function environment, look for input at the function root
  inputDir = path.resolve(process.cwd(), 'input')
  if (!existsSync(inputDir)) {
    // Fallback for bundled functions - input might be at different location
    inputDir = path.resolve(__dirname, 'input')
  }
} else {
  // Local development - use relative path
  inputDir = path.resolve(__dirname, '../../input')
}

/**
 * Loads a preset file by name with error handling
 * @param {string} presetName - Name of the preset (e.g., 'one-page')
 * @returns {object|null} Preset data or null if not found
 */
export function loadPreset(presetName) {
  try {
    const presetPath = path.join(inputDir, 'profiles', 'presets', `${presetName}.json`)
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
  const sectionsPath = path.join(inputDir, 'profiles', 'sections')
  const profilePath = path.join(inputDir, 'profiles', 'profile.json')
  const skillsInventoryPath = path.join(inputDir, 'profiles', 'skills-inventory.json')
  
  try {
    // Load main profile
    const profile = JSON.parse(readFileSync(profilePath, 'utf8'))
    
    // Load skills inventory
    let skillsInventory = null
    try {
      skillsInventory = JSON.parse(readFileSync(skillsInventoryPath, 'utf8'))
    } catch (error) {
      console.warn(`⚠️ Could not load skills inventory: ${error.message}`)
    }
    
    // Load all sections
    const sections = {}
    const sectionFiles = ['experience.json', 'projects.json', 'education.json', 'skills.json', 'certifications.json', 'volunteering.json', 'honors-awards.json', 'recommendations.json', 'activities.json']
    
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
    
    // Enhance skills section with inventory data if available
    if (skillsInventory && sections.skills) {
      sections.skills.skillsInventory = skillsInventory
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
    // Preserve the original experience array structure
    if (Array.isArray(merged.sections.experience)) {
      // Apply bullet priority overrides first
      merged.sections.experience = applyBulletPriorityOverrides(
        merged.sections.experience, 
        overrides.experience
      )
      // Keep the array and add metadata
      merged.sections.experience.preset_filters = overrides.experience
    } else {
      // If it's not an array, preserve existing structure and add filters
      merged.sections.experience = {
        ...merged.sections.experience,
        preset_filters: overrides.experience
      }
    }
  }
  
  // Apply project filtering
  if (overrides.projects) {
    merged.sections = merged.sections || {}
    // Preserve the original projects array structure
    if (Array.isArray(merged.sections.projects)) {
      // Apply bullet priority overrides first
      merged.sections.projects = applyBulletPriorityOverrides(
        merged.sections.projects, 
        overrides.projects
      )
      // Keep the array and add metadata
      merged.sections.projects.preset_filters = overrides.projects
    } else {
      // If it's not an array, preserve existing structure and add filters
      merged.sections.projects = {
        ...merged.sections.projects,
        preset_filters: overrides.projects
      }
    }
  }

  // Apply activities filtering (if it exists)
  if (overrides.activities) {
    merged.sections = merged.sections || {}
    if (Array.isArray(merged.sections.activities?.activities)) {
      // Apply bullet priority overrides to activities
      merged.sections.activities.activities = applyBulletPriorityOverrides(
        merged.sections.activities.activities, 
        overrides.activities
      )
    }
    // Add preset filters
    merged.sections.activities = {
      ...merged.sections.activities,
      preset_filters: overrides.activities
    }
  }

  // Apply recommendations filtering (if it exists)
  if (overrides.recommendations) {
    merged.sections = merged.sections || {}
    // Add preset filters to recommendations
    merged.sections.recommendations = {
      ...merged.sections.recommendations,
      preset_filters: overrides.recommendations
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
 * Applies bullet priority overrides to section entries
 * @param {Array} sectionData - Array of section entries (experiences, projects, etc.)
 * @param {object} overrides - Section overrides containing bullet_priorities_overrides
 * @returns {Array} Section data with preset bullet priorities applied
 */
function applyBulletPriorityOverrides(sectionData, overrides) {
  if (!overrides.bullet_priorities_overrides || !Array.isArray(sectionData)) {
    return sectionData
  }

  // Create a copy to avoid mutating original data
  const updatedData = [...sectionData]
  
  // Apply bullet priority overrides to specific indices
  for (const [indexStr, priorities] of Object.entries(overrides.bullet_priorities_overrides)) {
    const index = Number.parseInt(indexStr, 10)
    if (index >= 0 && index < updatedData.length && Array.isArray(priorities)) {
      // Create a copy of the entry and apply priority override
      updatedData[index] = {
        ...updatedData[index],
        bullet_priorities: priorities
      }
    }
  }
  
  return updatedData
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