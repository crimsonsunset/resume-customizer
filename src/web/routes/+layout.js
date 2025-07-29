import seoConfig from '../config/seo.json'

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
  
  // Merge configurations with URL-specific data
  const seoData = {
    ...baseSeo,
    ...pageConfig,
    canonical,
    // Add current URL to Open Graph
    openGraph: {
      ...seoConfig.social.openGraph,
      url: canonical,
      title: pageConfig.title || baseSeo.title,
      description: pageConfig.description || baseSeo.description,
      image: baseSeo.imageURL
    },
    // Add Twitter card data
    twitter: {
      ...seoConfig.social.twitter,
      title: pageConfig.title || baseSeo.title,
      description: pageConfig.description || baseSeo.description,
      image: baseSeo.imageURL
    },
    // Update JSON-LD with current URL
    jsonld: {
      ...baseSeo.jsonld,
      url: canonical
    }
  }
  
  return {
    seo: seoData
  }
}