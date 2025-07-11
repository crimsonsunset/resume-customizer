# Resume Optimizer

A modern resume optimization tool with CLI, future web app, and AI-powered matching capabilities.

## ✨ Features

- **Modern HTML → PDF** conversion with Playwright (CSS Grid, modern layouts)
- **ES Module** architecture with path aliases
- **Consistent tooling** (ESLint, Prettier, TypeScript support)
- **Netlify-ready** structure for future web app deployment
- **Shared utilities** for CLI and web components

## 🚀 Quick Start

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
│   ├── cli/                 # CLI tool (current focus)
│   │   └── convert.js       # Main CLI script
│   ├── shared/              # Shared utilities
│   │   └── resume-generator.js # Resume generation logic
│   ├── web/                 # Future web app
│   │   └── README.md        # Web app planning
│   └── functions/           # Netlify Functions (future)
├── input/                   # Input data (organized by type)
│   ├── profiles/            # Profile data (original + working copies)
│   │   ├── profile.json     # Original profile (never modified)
│   │   ├── profile-working.json # Working copy for edits
│   │   └── skills-*.json    # Skills data
│   ├── templates/           # CSS templates
│   │   └── resume-styles.css # CSS Grid layout
│   ├── working/             # Auto-saved working files
│   ├── examples/            # Sample resumes
│   └── assets/              # Images, fonts, etc.
├── output/                  # Generated files
├── netlify/                 # Netlify configuration
├── public/                  # Static assets
└── netlify.toml            # Netlify deployment config
```

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Run CLI in development mode
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# CLI Operations
npm run cli -- --help    # Show all commands
npm run html-to-pdf      # Convert HTML to PDF
npm run json-to-html     # Generate HTML from profile.json
npm run json-to-pdf      # Generate PDF from profile.json
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

- **Runtime**: Node.js with ES Modules
- **PDF Generation**: Playwright (Chrome-based, CSS Grid support)
- **Linting**: ESLint with oclif configuration
- **Formatting**: Prettier
- **TypeScript**: Type checking and path aliases
- **Future Deployment**: Netlify Functions + Static hosting

## 📋 Roadmap

- ✅ **Phase 1**: CLI tool with modern PDF generation
- ✅ **Phase 2**: Clean file organization with input/ structure
- 🎯 **Phase 3**: Enhanced HTML editing and content optimization
- 🔮 **Phase 4**: Recruiter-facing web application

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
