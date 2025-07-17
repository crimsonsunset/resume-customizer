# Resume Optimizer

A modern resume optimization tool with CLI, web application, and AI-powered matching capabilities.

## ✨ Features

### Web Application (Ready to Use)
- **Interactive Resume Customizer** with split-screen design and component-based architecture
- **Real-time Statistics** showing dynamic content metrics that update as you customize
- **34 DaisyUI Themes** with seamless switching
- **Resume Version Controls** (full/short/leadership/technical)
- **Section Toggles** with category-specific all/none controls
- **Strategic Content Curation System** with index-based selection for intelligent content optimization
- **Intelligent Filtering System** with two-tier priority-based content reduction
- **Content Density Controls** with Manual vs Density mode toggle for granular content management
- **URL State Management** for bookmarkable resume configurations with compact encoding
- **Responsive Design** optimized for all devices
- **PDF-Ready Styling** with scoped CSS architecture
- **One-Click PDF Export** with auto-generated filenames (`joseph-sangiorgio-resume-2025.pdf`)

### CLI Tool (Production Ready)
- **Modern HTML → PDF** conversion with Playwright (CSS Grid, modern layouts)
- **ES Module** architecture with path aliases
- **Consistent tooling** (ESLint, Prettier, TypeScript support)
- **Shared utilities** for CLI and web components

## 🚀 Quick Start

### Web Application
```bash
# Install dependencies
npm install

# Start the web development server
npm run dev:web

# Open browser to localhost:3000
# Customize your resume with interactive controls
```

### CLI Tool
```bash
# Install dependencies
npm install

# Convert HTML to PDF
npm run html-to-pdf input.html --css styles.css -o output.pdf

# View all commands
npm run cli -- --help
```

## 📁 Project Structure

```
resume-optimizer/
├── src/
│   ├── cli/                 # CLI tool (production ready)
│   │   └── convert.js       # Main CLI script with Playwright
│   ├── shared/              # Shared utilities
│   │   └── resume-generator.js # Resume generation logic
│   ├── web/                 # SvelteKit Web Application
│   │   ├── app.html         # App shell with theme loading
│   │   ├── routes/          # SvelteKit routes
│   │   │   ├── +page.svelte # Main resume customizer interface
│   │   │   └── +page.server.js # Server-side data loading
│   │   └── lib/
│   │       └── components/  # Svelte components
│   │           ├── ThemeSelector.svelte # 34 theme selector
│   │           └── ResumeViewer.svelte  # Scoped resume display
│   └── functions/           # Netlify Functions (future)
├── input/                   # Input data (organized by type)
│   ├── profiles/            # Profile data with rich metadata
│   │   ├── profile.json     # Full profile with resume_config
│   │   ├── profile-working.json # Working copy for edits
│   │   ├── skills-inventory.json # Skills with proficiency data
│   │   ├── skills-categories.json # Skill categorization
│   │   └── profile-resume-schema.json # Data structure schema
│   ├── templates/           # CSS templates
│   │   └── resume-styles.css # CSS Grid layout (scoped in components)
│   ├── working/             # Auto-saved working files
│   └── examples/            # Sample resumes (HTML/cleaned)
├── output/                  # Generated files (HTML/PDF)
├── public/                  # Static assets for web app
├── package.json             # Unified CLI + web app scripts
├── vite.config.js           # SvelteKit + build configuration
├── tailwind.config.js       # DaisyUI + Tailwind CSS 4 config
└── netlify.toml            # Netlify deployment config
```

## 🛠️ Available Commands

```bash
# Web Application Development
npm run dev:web          # Start SvelteKit development server
npm run build:web        # Build web app for production
npm run preview:web      # Preview built web app

# CLI Development
npm run dev:cli          # Run CLI in development mode
npm run build:cli        # Build CLI for production

# CLI Operations
npm run cli -- --help    # Show all commands
npm run html-to-pdf      # Convert HTML to PDF
npm run json-to-html     # Generate HTML from profile.json
npm run json-to-pdf      # Generate PDF from profile.json

# Development Tools
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run clean            # Clean build artifacts
```

## 🎯 Project Organization

### Input Structure (Type-based)
- **`input/profiles/`** - Profile data (originals preserved, working copies auto-created)
- **`input/templates/`** - CSS and HTML templates
- **`input/working/`** - Auto-saved working files
- **`input/examples/`** - Sample resumes
- **`input/assets/`** - Images, fonts, etc.

### Path Aliases
- `@/*` → `src/*`
- `@cli/*` → `src/cli/*`
- `@shared/*` → `src/shared/*`
- `@functions/*` → `src/functions/*`
- `@web/*` → `src/web/*`

### Auto-Save Logic
- **Originals preserved**: Files in `input/profiles/` are never modified
- **Working copies**: Auto-created in `input/working/` for safe editing
- **Safe iteration**: Multiple versions can be saved and compared

## 🚀 Technology Stack

### Web Application
- **Framework**: SvelteKit with server-side rendering
- **Styling**: DaisyUI 5.0.46 + Tailwind CSS 4 
- **Architecture**: Slot-based components with scoped CSS
- **State Management**: URL parameters + SvelteKit stores
- **Themes**: 34 responsive DaisyUI themes

### CLI Tool  
- **Runtime**: Node.js with ES Modules
- **PDF Generation**: Playwright (Chrome-based, CSS Grid support)
- **Data**: JSON profiles with structured metadata

### Development Tools
- **Linting**: ESLint with oclif configuration
- **Formatting**: Prettier
- **TypeScript**: Type checking and path aliases
- **Build**: Vite for web app, Node.js for CLI
- **Deployment**: Netlify-ready structure

## 📋 Roadmap

- ✅ **Phase 1A**: CLI tool with modern PDF generation
- ✅ **Phase 1B**: SvelteKit web application with theme system
- ✅ **Phase 2A**: JSON-driven dynamic content generation
- ✅ **Phase 2B**: Enhanced CLI workflow features  
- ✅ **Phase 3**: Universal renderer architecture and component system
- ✅ **Phase 4**: Advanced UX controls and content management
- 🎯 **Phase 5**: Strategic content curation and intelligent filtering (current)
- 🔮 **Phase 6**: Complete priority data system and content optimization
- 🔮 **Phase 7**: ResumeWorded integration and AI optimization

## 🔧 Technical Details

### Why Playwright over WeasyPrint?
- **Full CSS Grid support** (WeasyPrint doesn't support CSS Grid)
- **Modern CSS features** (flexbox, custom properties, etc.)
- **Better file sizes** (204KB vs 15KB truncated files)
- **Pixel-perfect rendering** (Chrome engine)

### ES Module Benefits
- **Modern import/export** syntax
- **Better tree shaking** for smaller bundles
- **TypeScript integration** with path aliases
- **Netlify Functions compatibility**

### Netlify Deployment Ready
- **Single package.json** (recommended by Netlify)
- **Automatic dependency bundling** for Functions
- **Shared code** between CLI and web app
- **Production-ready** structure

## 🤝 Contributing

This project follows the oclif coding standards with:
- ESLint configuration
- Prettier formatting
- TypeScript type checking
- Consistent file organization

---

*Built with modern JavaScript and designed for the future web.*
