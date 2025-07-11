// Demo of path aliases working in Vite
// These imports will work when the web app is running

// Example imports using path aliases (commented out until we have the modules)
// import { generateResume } from '@shared/resume-generator.js'
// import profileData from '../../input/profiles/profile.json'
// import skillsData from '../../input/profiles/skills-inventory.json'

console.log('🚀 Resume Optimizer Web App Loaded!')
console.log('✨ Vite + Path Aliases ready for development')

// Demo function to show the web app concept
function initializeApp() {
    console.log('🔮 Future features:')
    console.log('  - AI job description matching')
    console.log('  - Interactive resume generation')
    console.log('  - Real-time PDF preview')
    console.log('  - Multiple professional templates')
    
    // Add some interactivity
    const container = document.querySelector('.container')
    if (container) {
        const viteInfo = document.createElement('div')
        viteInfo.innerHTML = `
            <div style="margin-top: 2rem; padding: 1rem; background: #e8f5e8; border-radius: 4px; border: 1px solid #4caf50;">
                <h4>✅ Vite Development Server Running</h4>
                <p>Path aliases are configured and ready for use:</p>
                <ul>
                    <li><code>@shared/*</code> → shared utilities</li>
                    <li><code>input/profiles/*</code> → profile and skills data</li>
                    <li><code>input/templates/*</code> → CSS templates</li>
                </ul>
            </div>
        `
        container.append(viteInfo)
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp)
} else {
    initializeApp()
} 