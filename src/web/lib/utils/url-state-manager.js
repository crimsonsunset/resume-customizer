/**
 * URL State Manager Utility
 * Handles encoding/decoding of resume section visibility state in URL parameters
 * Provides a clean API for URL state management across the application
 */

// Section name mapping for compact URL encoding
const SECTION_CODES = {
  'objective': 'obj',
  'experience': 'exp', 
  'projects': 'proj',
  'education': 'edu',
  'skills': 'skills',
  'certifications': 'cert',
  'courses': 'course',
  'volunteering': 'vol',
  'honors-awards': 'award',
  'recommendations': 'rec',
  'activities': 'act'
}

// Reverse mapping for decoding
const CODE_TO_SECTION = Object.fromEntries(
  Object.entries(SECTION_CODES).map(([section, code]) => [code, section])
)

/**
 * Encode visible sections to URL-friendly string
 * @param {object} sections - Object with section names as keys, boolean visibility as values
 * @returns {string} Comma-separated compact codes for visible sections
 */
export const encodeSectionsForURL = (sections) => {
  return Object.entries(sections)
    .filter(([_, visible]) => visible)
    .map(([section, _]) => SECTION_CODES[section] || section)
    .sort()
    .join(',')
}

/**
 * Decode URL string to sections visibility object
 * @param {string} urlString - Comma-separated compact codes
 * @param {Array} availableSections - Available sections from server
 * @returns {object} Section visibility object
 */
export const decodeSectionsFromURL = (urlString, availableSections) => {
  if (!urlString || !availableSections) return {}
  
  const visibleCodes = urlString.split(',').filter(Boolean)
  const visibleSectionNames = new Set(visibleCodes.map(code => CODE_TO_SECTION[code] || code))
  
  const result = {}
  for (const section of availableSections) {
    result[section] = visibleSectionNames.has(section)
  }
  return result
}

/**
 * Initialize section visibility from URL parameters or defaults
 * @param {URLSearchParams} searchParams - Current URL search parameters
 * @param {Array} availableSections - Available sections from server
 * @returns {object} Section visibility object
 */
export const initializeSectionVisibility = (searchParams, availableSections) => {
  const urlSections = searchParams.get('sections')
  
  if (urlSections && availableSections) {
    // Initialize from URL if present
    return decodeSectionsFromURL(urlSections, availableSections)
  }
  
  if (availableSections) {
    // Default all to visible
    const defaultVisibility = {}
    for (const section of availableSections) {
      defaultVisibility[section] = true
    }
    return defaultVisibility
  }
  
  return {}
}

/**
 * Update URL with current section visibility state
 * @param {URL} currentURL - Current page URL
 * @param {object} visibleSections - Current section visibility state
 * @returns {URL} Updated URL object
 */
export const updateURLWithSections = (currentURL, visibleSections) => {
  const newURL = new URL(currentURL)
  const encodedSections = encodeSectionsForURL(visibleSections)
  
  if (encodedSections) {
    newURL.searchParams.set('sections', encodedSections)
  } else {
    newURL.searchParams.delete('sections')
  }
  
  return newURL
}

/**
 * Update URL preset parameter
 * @param {URL} currentURL - Current page URL  
 * @param {string} presetValue - Preset value ('full' removes parameter)
 * @returns {URL} Updated URL object
 */
export const updateURLWithPreset = (currentURL, presetValue) => {
  const newURL = new URL(currentURL)
  
  if (presetValue === 'full') {
    newURL.searchParams.delete('preset')
  } else {
    newURL.searchParams.set('preset', presetValue)
  }
  
  return newURL
}

/**
 * Check if two section visibility objects are different
 * @param {object} sections1 - First section visibility object
 * @param {object} sections2 - Second section visibility object
 * @returns {boolean} True if different
 */
export const areSectionsDifferent = (sections1, sections2) => {
  const encoded1 = encodeSectionsForURL(sections1 || {})
  const encoded2 = encodeSectionsForURL(sections2 || {})
  return encoded1 !== encoded2
}

/**
 * Preserve existing section state for sections that exist in new available sections
 * @param {object} currentSections - Current section visibility state
 * @param {Array} newAvailableSections - New available sections
 * @returns {object} Updated section visibility preserving existing state
 */
export const preserveSectionState = (currentSections, newAvailableSections) => {
  const newVisibleSections = {}
  for (const section of newAvailableSections) {
    newVisibleSections[section] = currentSections[section] ?? true
  }
  return newVisibleSections
}

/**
 * Initialize density and mode from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} { density: number, contentMode: string }
 */
export const initializeDensityMode = (searchParams) => {
  const density = parseInt(searchParams.get('density') || '100')
  const contentMode = searchParams.get('mode') || 'manual'
  return { density, contentMode }
}

/**
 * Update URL with density and mode parameters
 * @param {URL} currentURL - Current URL object
 * @param {number} density - Density value (10-100)
 * @param {string} contentMode - Content mode ('manual' or 'density')
 * @returns {URL} Updated URL object
 */
export const updateURLWithDensity = (currentURL, density, contentMode) => {
  const newURL = new URL(currentURL)
  
  if (contentMode === 'density') {
    newURL.searchParams.set('density', density.toString())
    newURL.searchParams.set('mode', 'density')
    // Remove sections parameter - density mode shows all sections by default
    newURL.searchParams.delete('sections')
  } else {
    newURL.searchParams.delete('density')
    newURL.searchParams.delete('mode')
    // Keep sections parameter for manual mode (if it exists)
  }
  
  return newURL
}

/**
 * Extract density value from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {number} Density value (10-100)
 */
export const getDensityFromURL = (searchParams) => {
  return parseInt(searchParams.get('density') || '100')
}

/**
 * Extract content mode from URL  
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string} Content mode ('manual' or 'density')
 */
export const getModeFromURL = (searchParams) => {
  return searchParams.get('mode') || 'manual'
} 