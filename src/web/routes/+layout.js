import seoConfig from '@web/config/seo.json'

/**
 * Layout load function that provides SEO configuration to all pages
 * Integrates with sk-seo for automatic meta tag generation
 * @param {Object} params - SvelteKit load function parameters
 * @param {URL} params.url - Current page URL
 * @param {Object} params.route - Current route information
 * @returns {Object} SEO configuration for sk-seo component
 */
export const load = async ({ url, route }) => {
  // Get base SEO configuration
  const baseSeo = seoConfig.default
  
  // Get page-specific overrides if they exist
  const pageConfig = seoConfig.pages[route.id] || {}
  
  // Build canonical URL
  const canonical = url.origin + url.pathname
  
  // Merge configurations with URL-specific data for sk-seo
  const seoData = {
    // Basic meta tags
    title: pageConfig.title || baseSeo.title,
    description: pageConfig.description || baseSeo.description,
    keywords: baseSeo.keywords,
    author: baseSeo.author,
    canonical,
    
    // Image for social sharing
    imageURL: baseSeo.imageURL,
    
    // Enable sk-seo's built-in Open Graph and Twitter Card generation
    openGraph: true,
    twitter: true,
    schemaOrg: baseSeo.schemaOrg,
    
    // JSON-LD structured data
    jsonld: {
      ...baseSeo.jsonld,
      url: canonical
    }
  }
  
  return {
    seo: seoData
  }
}