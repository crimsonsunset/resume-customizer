const MANAGEMENT_TITLE_KEYWORDS = ['manager', 'director', 'lead', 'principal', 'head of']

/**
 * Whether a job title is a management or leadership role.
 * Single source of truth for the `management_roles_only` experience filter,
 * shared by the web renderers and the CLI generator.
 * @param {string} [title] - Job title to test
 * @returns {boolean} True if the title contains a management keyword
 */
export function isManagementRole(title) {
  const normalizedTitle = title?.toLowerCase() || ''
  return MANAGEMENT_TITLE_KEYWORDS.some(keyword => normalizedTitle.includes(keyword))
}
