<!-- ResumeViewer.svelte - Resume display component with scoped styling -->
<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { currentTheme } from '@web/lib/stores/theme.js'

    // Extract colors from DaisyUI theme (simplified approach)
    function extractThemeColors() {
        if (!browser) return { primary: '#4285f4', secondary: '#666' } // fallback for SSR
        
        try {
            // DaisyUI provides --color-primary and --color-secondary directly in usable format
            const computedStyle = getComputedStyle(document.documentElement)
            const primaryColor = computedStyle.getPropertyValue('--color-primary').trim()
            const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim()
            
            const colors = {
                primary: primaryColor || '#4285f4',
                secondary: secondaryColor || '#666'
            }
            
            console.log(`🎨 Theme: ${$currentTheme} → Primary: ${colors.primary}, Secondary: ${colors.secondary}`)
            return colors
        } catch (error) {
            console.warn('🎨 Theme color extraction failed:', error)
        }
        
        // Fallback colors
        console.log(`🎨 Using fallback colors for theme: ${$currentTheme}`)
        return { primary: '#4285f4', secondary: '#666' }
    }

    // Reactive theme colors
    let themeColors = { primary: '#4285f4', secondary: '#666' }
    
    // Update theme colors when theme changes
    $: if (browser && $currentTheme) {
        const newColors = extractThemeColors()
        if (JSON.stringify(newColors) !== JSON.stringify(themeColors)) {
            themeColors = newColors
            console.log(`🎨 Resume colors updated:`, themeColors)
        }
    }

    onMount(() => {
        // Initial color extraction on mount
        themeColors = extractThemeColors()
    })
</script>

<div class="resume-viewer" style="--color-primary: {themeColors.primary}; --color-secondary: {themeColors.secondary}">
    <slot/>
</div>

<style>
    /* Resume Styles - CSS Grid Layout (Playwright Compatible) */

    /* CSS Variables - Scoped to resume viewer only */
    .resume-viewer {
        /* Font sizes */
        --font-size-base: 9pt;
        --font-size-header: 22pt;
        --font-size-h3: 10pt;
        --font-size-small: 8pt;

        /* Colors - primary will be overridden dynamically */
        --color-primary: #4285f4;
        --color-text: #333;
        --color-text-light: #666;
        --color-text-medium: #555;
        --color-bg: #fff;

        /* Layout */
        --page-width: 8.5in;
        --page-margin: 0.01in;
        --column-left-width: 1in;
        --column-gap: 0px;
        --row-gap: 0.05in;

        /* Spacing */
        --spacing-xs: 0.05em;
        --spacing-sm: 0.1em;
        --spacing-md: 0.15em;
        --spacing-lg: 0.2em;
        --spacing-xl: 0.3em;
        --spacing-xxl: 0.4em;
        --spacing-section: 0.5em;
        --spacing-header: 0.8em;

        /* Line heights */
        --line-height-tight: 1.2;
        --line-height-normal: 1.3;
        --line-height-relaxed: 1.25;

        /* Base styling */
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: var(--font-size-base);
        line-height: var(--line-height-normal);
        color: var(--color-text);
        background: white;
        /* Web-specific: limit width to page size and center */
        max-width: var(--page-width);
        margin: 0 auto;
        padding: var(--page-margin);
        /* Force consistent rendering */
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
        print-color-adjust: exact;
        /* Debug: Show body boundaries */
    }

    /* Reset and base styles */
    .resume-viewer * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    /* Add responsive padding for web viewing */
    @media screen and (max-width: 9in) {
        .resume-viewer {
            padding: 0.5in;
        }
    }

    @media screen and (max-width: 6in) {
        .resume-viewer {
            padding: 0.25in;
        }
    }

    /* Header section - full width */
    .resume-viewer :global(.header) {
        text-align: center;
        margin-bottom: var(--spacing-header);
        padding-bottom: var(--spacing-xl);
        border-bottom: 2px solid var(--color-primary);
        background: white;
        /* Debug: Show header boundaries */
    }

    .resume-viewer :global(.header h1) {
        font-size: var(--font-size-header);
        color: var(--color-primary);
        margin-bottom: var(--spacing-lg);
        font-weight: bold;
        letter-spacing: 0.5px;
    }

    .resume-viewer :global(.header p) {
        font-size: var(--font-size-base);
        line-height: var(--line-height-tight);
        margin: var(--spacing-xs) 0;
        color: var(--color-text-light);
    }

    /* Main content using CSS Grid - Optimized for better balance */
    .resume-viewer :global(.resume-content) {
        background: white;
        display: grid;
        grid-template-columns: var(--column-left-width) 1fr;
        column-gap: var(--column-gap);
        row-gap: var(--row-gap);
        align-items: start;
        /* Debug: Show grid info */
        position: relative;
    }

    /* Section wrapper for table-like behavior */
    .resume-viewer :global(.section-wrapper) {
        display: contents;
        /* Debug: Show section wrapper boundaries (won't show due to display:contents) */
    }

    /* Section labels (left column) - Enhanced styling with underlines */
    .resume-viewer :global(.section-label) {
        font-weight: bold;
        font-size: var(--font-size-base);
        color: var(--color-primary);
        text-align: left;
        text-transform: capitalize;
        letter-spacing: 0.5px;
        line-height: var(--line-height-tight);
        text-decoration: underline;
        /* Debug: Show section label boundaries */
    }

    /* Section content (right column) - Optimized spacing */
    .resume-viewer :global(.section-content) {
        margin-bottom: var(--spacing-section);
        line-height: var(--line-height-normal);
        /* Debug: Show section content boundaries */
    }

    /* Typography improvements */
    .resume-viewer :global(.section-content h3) {
        font-size: var(--font-size-h3);
        font-weight: bold;
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
        margin-top: calc(var(--spacing-xxl) * 2); /* Increased spacing between companies */
    }

    .resume-viewer :global(.section-content h3:first-child) {
        margin-top: 0;
    }

    /* Company header wrapper - just for company names (no dates) */
    .resume-viewer :global(.company-header) {
        margin-top: calc(var(--spacing-xxl) * 2);
        margin-bottom: var(--spacing-sm);
    }

    .resume-viewer :global(.company-header:first-child) {
        margin-top: 0;
    }

    .resume-viewer :global(.company-header h3) {
        margin: 0;
    }

    /* Job title header wrapper - groups h4 and date-range on same line */
    .resume-viewer :global(.job-title-header) {
        display: flex;
        align-items: baseline;
        margin-bottom: var(--spacing-sm);
    }

    .resume-viewer :global(.job-title-header h4) {
        margin: 0;
    }

    .resume-viewer :global(.job-title-header .date-range) {
        margin: 0;
        margin-left: 0.5em; /* Add moderate space to the left of the date */
        font-size: var(--font-size-base);
        color: var(--color-text-light);
        font-style: italic;
    }

    .resume-viewer :global(.section-content h4) {
        font-size: var(--font-size-base);
        font-weight: bold;
        color: var(--color-text-medium);
        margin-bottom: var(--spacing-xs);
        font-style: italic;
    }

    .resume-viewer :global(.section-content p) {
        margin-bottom: var(--spacing-md);
        text-align: justify;
        line-height: var(--line-height-relaxed);
    }

    .resume-viewer :global(.section-content p strong) {
        font-weight: bold;
        color: var(--color-text);
    }

    .resume-viewer :global(.section-content ul) {
        margin-bottom: var(--spacing-md);
        padding-left: 1.2em;
        list-style-type: disc;
        list-style-position: outside;
    }

    .resume-viewer :global(.section-content li) {
        margin-bottom: var(--spacing-sm);
        line-height: var(--line-height-relaxed);
        text-align: justify;
        display: list-item;
    }

    .resume-viewer :global(.section-content a) {
        color: var(--color-primary);
        text-decoration: underline;
    }

    .resume-viewer :global(.section-content a:hover) {
        text-decoration: none;
    }

    .resume-viewer :global(.section-content h3 + .date-range) {
        margin-top: -0.3em;
    }

    .resume-viewer :global(.section-content h4 + .date-range) {
        margin-top: -0.2em;
    }

    .resume-viewer :global(.section-content h3 + h4) {
        margin-top: var(--spacing-xs);
    }

    .resume-viewer :global(.section-content .date-range + ul) {
        margin-top: var(--spacing-sm);
    }

    .resume-viewer :global(.section-content ul + h3) {
        margin-top: calc(var(--spacing-xxl) * 2);
    }

    .resume-viewer :global(.section-content ul + h4) {
        margin-top: calc(var(--spacing-xxl) * 1.5);
    }

    .resume-viewer :global(.section-wrapper:first-child .section-content) {
        margin-top: 0;
    }

    @media print {
        .resume-viewer :global(.section-wrapper) {
            page-break-inside: avoid;
        }

        .resume-viewer :global(.section-content h3) {
            page-break-after: avoid;
        }

        .resume-viewer :global(.section-content h4) {
            page-break-after: avoid;
        }

        .resume-viewer :global(.section-content ul) {
            page-break-inside: avoid;
        }
    }

    .resume-viewer :global(.section-wrapper) {
        /* Additional debug info */
    }

    .resume-viewer :global(.section-content h3) {
        /* Additional debug info */
    }

    .resume-viewer :global(.section-content h4) {
        /* Additional debug info */
    }

    /* Recommendations section specific styling */
    .resume-viewer :global(.recommendation-item) {

        margin-bottom: var(--spacing-xxl);
    }

    /* Break long words in section labels */
    .resume-viewer :global(.section-label) {
        word-break: break-word;
        hyphens: auto;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
    }

    /* Force word breaking specifically for recommendations section */
    .resume-viewer :global(.recommendations-section .section-label) {
        word-break: break-all;
        line-height: var(--line-height-tight);
    }

    .resume-viewer :global(.recommendation-item h4) {
        margin-bottom: var(--spacing-xs);
        font-weight: bold;
        color: var(--color-text-medium);
        font-style: italic;
    }

    .resume-viewer :global(.recommendation-item .title-date) {
        margin: 0;
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-base);
        color: var(--color-text-light);
        font-style: italic;
    }

    .resume-viewer :global(.recommendation-item .relationship) {
        margin: 0;
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-small);
        color: var(--color-text-light);
        font-style: italic;
    }

    .resume-viewer :global(.recommendation-quote) {
        margin: 0;
        margin-bottom: var(--spacing-md);
        padding: 8px;
        background-color: #f8f9fa;
        border-left: 4px solid var(--color-secondary);
        border-radius: 4px;
        font-size: var(--font-size-base);
        line-height: var(--line-height-relaxed);
        color: var(--color-text);
        font-style: normal;
    }
</style>
