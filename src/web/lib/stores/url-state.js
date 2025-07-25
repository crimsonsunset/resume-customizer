import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { 
  initializeSectionVisibility, 
  updateURLWithSections, 
  updateURLWithPreset,
  areSectionsDifferent,
  preserveSectionState,
  initializeFilters,
  updateURLWithDensity
} from '@web/lib/utils/url-state-manager.js'

/**
 * URL State Store for Resume Customizer
 * Manages section visibility and preset state with URL persistence
 */

// Section visibility store
export const sectionVisibilityStore = writable({})

// Density and timeframe stores
export const densityStore = writable(100)
export const timeframeStore = writable(0) // 0 = all years
export const densityInitializedStore = writable(false)

// Mounted state to avoid SSR issues
export const mountedStore = writable(false)

/**
 * Updates section visibility and optionally syncs to URL
 * @param {object} newVisibility - New section visibility state
 * @param {URL} currentURL - Current page URL
 * @param {boolean} updateURL - Whether to update the URL
 */
export const updateSectionVisibility = (newVisibility, currentURL, updateURL = true) => {
  sectionVisibilityStore.set(newVisibility)
  
  if (updateURL && browser) {
    const newURL = updateURLWithSections(currentURL, newVisibility)
    goto(newURL.toString(), { 
      replaceState: true, 
      noScroll: true,
      keepFocus: true
    })
  }
}

/**
 * Initializes section visibility from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {Array} availableSections - Available sections from server 
 */
export const initializeSections = (searchParams, availableSections) => {
  const initialVisibility = initializeSectionVisibility(searchParams, availableSections)
  sectionVisibilityStore.set(initialVisibility)
}

/**
 * Handles preset changes by preserving existing state for overlapping sections
 * @param {Array} newAvailableSections - New available sections from preset
 * @param {object} currentSections - Current section visibility state  
 */
export const handlePresetChange = (newAvailableSections, currentSections) => {
  const preservedSections = preserveSectionState(currentSections, newAvailableSections)
  sectionVisibilityStore.set(preservedSections)
  return preservedSections
}

/**
 * Navigate to a new preset URL
 * @param {string} presetValue - Preset value to navigate to
 * @param {URL} currentURL - Current page URL
 */
export const navigateToPreset = (presetValue, currentURL) => {
  if (!browser) return
  
  const newURL = updateURLWithPreset(currentURL, presetValue)
  goto(newURL.toString(), { 
    noScroll: true,
    keepFocus: true
  })
}

/**
 * Check if section visibility should trigger URL update
 * @param {object} newSections - New section visibility
 * @param {object} previousSections - Previous section visibility  
 * @param {boolean} isMounted - Whether component is mounted
 * @returns {boolean} True if URL should be updated
 */
export const shouldUpdateURL = (newSections, previousSections, isMounted) => {
  return isMounted && 
         Object.keys(newSections).length > 0 && 
         areSectionsDifferent(newSections, previousSections)
}

/**
 * Updates density and timeframe, syncing with URL
 * @param {number} density - Density value (10-100)
 * @param {number} timeframe - Timeframe in years (0 = all years)
 * @param {URL} currentURL - Current page URL
 * @param {boolean} updateURL - Whether to update browser URL
 */
export const updateFilters = (density, timeframe, currentURL, updateURL = true) => {
  densityStore.set(density)
  timeframeStore.set(timeframe)
  
  if (updateURL && browser) {
    const newURL = updateURLWithDensity(currentURL, density, timeframe)
    goto(newURL.toString(), { 
      replaceState: true, 
      noScroll: true,
      keepFocus: true
    })
  }
}

/**
 * Initializes density and timeframe from URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 */
export const initializeDensity = (searchParams) => {
  const { density, timeframe } = initializeFilters(searchParams)
  densityStore.set(density)
  timeframeStore.set(timeframe)
  densityInitializedStore.set(true)
} 