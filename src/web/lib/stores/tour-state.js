import { writable } from 'svelte/store'
import { browser } from '$app/environment'

/**
 * Tour State Store for Resume Customizer
 * Manages tour activation and completion state with localStorage persistence
 */

// Tour state management
export const tourActiveStore = writable(false)
export const tourCompletedStore = writable(false)

/**
 * Read a localStorage value without letting storage errors break the page.
 * @param {string} key Storage key
 * @returns {string|null} Stored value, or null when unavailable
 */
const safeGetItem = (key) => {
  if (!browser) return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('Tour storage read failed:', error)
    return null
  }
}

/**
 * Write a localStorage value without letting storage errors break the page.
 * @param {string} key Storage key
 * @param {string} value Value to persist
 */
const safeSetItem = (key, value) => {
  if (!browser) return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn('Tour storage write failed:', error)
  }
}

/**
 * Remove a localStorage value without letting storage errors break the page.
 * @param {string} key Storage key
 */
const safeRemoveItem = (key) => {
  if (!browser) return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Tour storage remove failed:', error)
  }
}

/**
 * Get initial tour completion state from localStorage
 * @returns {boolean} Whether tour has been completed
 */
const getTourCompleted = () => {
  return safeGetItem('resume-tour-completed') === 'true'
}

// Initialize tour completion state
export const tourCompletedState = writable(getTourCompleted())

// Subscribe to changes and persist to localStorage
if (browser) {
  tourCompletedState.subscribe((completed) => {
    safeSetItem('resume-tour-completed', completed.toString())
  })
}

/**
 * Mark tour as completed and update stores
 */
export const markTourCompleted = () => {
  tourCompletedState.set(true)
  tourActiveStore.set(false)
  
  if (browser) {
    console.log('🎯 Tour completed and saved to localStorage')
    // Track tour completion for analytics
    if (globalThis.gtag) {
      globalThis.gtag('event', 'resume_tour_completed', {
        event_category: 'engagement',
        event_label: 'tour_completion'
      })
    }
  }
}

/**
 * Reset tour completion state (for testing or retaking tour)
 */
export const resetTour = () => {
  tourCompletedState.set(false)
  tourActiveStore.set(false)
  
  if (browser) {
    safeRemoveItem('resume-tour-completed')
    console.log('🔄 Tour state reset')
  }
}

/**
 * Start tour and update active state
 */
export const startTour = () => {
  tourActiveStore.set(true)
  
  if (browser) {
    console.log('🎯 Tour started')
    // Track tour start for analytics
    if (globalThis.gtag) {
      globalThis.gtag('event', 'resume_tour_started', {
        event_category: 'engagement',
        event_label: 'tour_start'
      })
    }
  }
}

/**
 * Cancel tour and update active state
 */
export const cancelTour = () => {
  tourActiveStore.set(false)
  
  if (browser) {
    console.log('🚫 Tour cancelled')
    // Track tour cancellation for analytics
    if (globalThis.gtag) {
      globalThis.gtag('event', 'resume_tour_cancelled', {
        event_category: 'engagement',
        event_label: 'tour_cancel'
      })
    }
  }
}
