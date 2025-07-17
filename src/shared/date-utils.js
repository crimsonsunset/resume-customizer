/**
 * Date utilities for resume data
 * Handles dynamic calculation of "Present" entries
 */
import { parse, differenceInMonths, format, startOfMonth } from 'date-fns';

/**
 * Parses date strings in various formats and returns a Date object
 * Supports: "Jan 2024", "Jun 2017", "Oct 2017", etc.
 */
export function parseResumeDate(dateString) {
  // Handle formats like "Jan 2024", "Jun 2017"
  const monthYearMatch = dateString.match(/^([A-Za-z]{3})\s+(\d{4})$/)
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch
    // Use date-fns to parse and get start of month
    return startOfMonth(parse(`${month} ${year}`, 'MMM yyyy', new Date()))
  }
  
  // Fallback to standard Date parsing
  return new Date(dateString)
}

/**
 * Calculates duration between two dates and formats it
 * Returns format like "1 yr 6 mos" or "8 yrs 9 mos"
 */
export function calculateDuration(startDate, endDate = new Date()) {
  const start = typeof startDate === 'string' ? parseResumeDate(startDate) : startDate
  const end = typeof endDate === 'string' ? parseResumeDate(endDate) : endDate
  
  // Use date-fns for precise month calculation
  const totalMonths = differenceInMonths(end, start)
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  
  // Format output
  const parts = []
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`)
  }
  if (months > 0) {
    parts.push(`${months} mo${months > 1 ? 's' : ''}`)
  }
  
  // Handle edge case of less than 1 month
  if (parts.length === 0) {
    return 'Less than 1 mo'
  }
  
  return parts.join(' ')
}

/**
 * Updates a duration string that contains "Present" with current calculation
 * Input: "Jan 2024 - Present · 1 yr 6 mos" or "Jan 2024 - Present"
 * Output: "Jan 2024 - Present · 1 yr 7 mos" (with current duration)
 */
export function updatePresentDuration(durationString) {
  if (!durationString.includes('Present')) {
    return durationString
  }
  
  // Extract start date from formats like "Jan 2024 - Present" or "Jan 2024 - Present · 1 yr 6 mos"
  const startDateMatch = durationString.match(/^([A-Za-z]{3}\s+\d{4})\s*-\s*Present/)
  if (!startDateMatch) {
    return durationString
  }
  
  const startDateString = startDateMatch[1]
  const currentDuration = calculateDuration(startDateString)
  
  // Return updated format: "StartDate - Present · Duration"
  return `${startDateString} - Present · ${currentDuration}`
}

/**
 * Updates all "Present" entries in resume data
 * Works on both experience (duration field) and projects (date field)
 * Handles both object structure and direct arrays
 */
export function updateAllPresentEntries(resumeData) {
  const updated = structuredClone(resumeData) // Deep clone
  
  // Handle direct arrays (section files)
  if (Array.isArray(updated)) {
    for (const item of updated) {
      // Experience entries have 'duration' field
      if (item.duration && item.duration.includes('Present')) {
        item.duration = updatePresentDuration(item.duration)
      }
      // Project entries have 'date' field
      if (item.date && item.date.includes('Present')) {
        item.date = updatePresentDuration(item.date)
      }
    }
    return updated
  }
  
  // Handle object structure (profile files)
  // Update experience entries
  if (updated.experience && Array.isArray(updated.experience)) {
    for (const exp of updated.experience) {
      if (exp.duration && exp.duration.includes('Present')) {
        exp.duration = updatePresentDuration(exp.duration)
      }
    }
  }
  
  // Update project entries  
  if (updated.projects && Array.isArray(updated.projects)) {
    for (const project of updated.projects) {
      if (project.date && project.date.includes('Present')) {
        project.date = updatePresentDuration(project.date)
      }
    }
  }
  
  return updated
} 