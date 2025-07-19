/**
 * URL State Manager Utility
 * Handles encoding/decoding of resume section visibility state in URL parameters
 * Provides a clean API for URL state management across the application
 */

// Section name mapping for compact URL encoding
const SECTION_CODES = {
  'headline': 'head',
  'summary': 'sum',
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
  'activities': 'act',
  'location': 'loc' // Note: location kept for future use but currently excluded from filtering (shown in header)
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
 * Update URL preset parameter and clear sections to reset to preset defaults
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
  
  // Clear sections parameter so preset starts with its default configuration
  newURL.searchParams.delete('sections')
  
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
 * Initialize density and timeframe from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} { density: number, timeframe: number }
 */
export const initializeDensityMode = (searchParams) => {
  const density = Number.parseInt(searchParams.get('density') || '100', 10)
  const timeframe = Number.parseInt(searchParams.get('timeframe') || '0', 10) // 0 = all years
  return { density, timeframe }
}

/**
 * Update URL with density and timeframe parameters
 * @param {URL} currentURL - Current URL object
 * @param {number} density - Density value (10-100)
 * @param {number} timeframe - Timeframe in years (0 = all years)
 * @returns {URL} Updated URL object
 */
export const updateURLWithDensity = (currentURL, density, timeframe = 0) => {
  const newURL = new URL(currentURL)
  
  // Add density parameter if not default (100%)
  if (density === 100) {
    newURL.searchParams.delete('density')
  } else {
    newURL.searchParams.set('density', density.toString())
  }
  
  // Add timeframe parameter if not showing all years
  if (timeframe > 0) {
    newURL.searchParams.set('timeframe', timeframe.toString())
  } else {
    newURL.searchParams.delete('timeframe')
  }
  
  return newURL
}

/**
 * Extract density value from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {number} Density value (10-100)
 */
export const getDensityFromURL = (searchParams) => {
  return Number.parseInt(searchParams.get('density') || '100', 10)
}

 

/**
 * Extract timeframe value from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {number} Timeframe value in years (0 = all years)
 */
export const getTimeframeFromURL = (searchParams) => {
  return Number.parseInt(searchParams.get('timeframe') || '0', 10)
} 