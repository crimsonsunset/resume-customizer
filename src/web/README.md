# Resume Optimizer Web App

🚀 **Production Ready** - Interactive resume customizer with advanced UX controls

## Current Features

The web application provides a comprehensive resume customization experience with:

### ✨ Core Functionality
- **Interactive Resume Preview** - Real-time resume display with professional styling
- **34 DaisyUI Themes** - Complete theme system with seamless switching
- **Universal Section Rendering** - All 11 resume sections with consistent architecture
- **URL State Management** - Bookmarkable resume configurations with compact encoding
- **PDF Export Ready** - One-click PDF generation with auto-generated filenames

### 🎛️ Advanced Controls
- **Content Density Slider** - 10-100% granular control over resume content
- **Category-Specific Section Controls** - "All" and "None" buttons for each section group:
  - 📋 Primary Sections (experience, projects, education, skills)
  - 🏆 Credentials (certifications, courses, honors-awards)
  - 💬 Social Proof (recommendations, volunteering)
  - 🎭 Personality (objective, activities)
- **Individual Section Toggles** - Checkbox controls for specific sections
- **Preset System** - Full/One-Page resume variations with smart merge logic

### 🏗️ Technical Architecture

**Framework Stack:**
- **SvelteKit** - Full-stack SSR with excellent performance
- **DaisyUI + Tailwind CSS 4** - Professional UI components and modern styling
- **Universal SectionRenderer** - Consistent architecture across all 11 sections
- **Scoped CSS** - Proper isolation between UI framework and resume styling

**Data Flow:**
```
JSON Profile Data → Preset Merger → Section Renderers → Svelte Components → HTML
```

## Directory Structure

```
src/web/
├── app.html                # App shell with theme loading
├── routes/
│   ├── +page.svelte       # Main resume customizer interface
│   ├── +page.server.js    # Server-side data loading and preset application
│   └── api/               # API endpoints (PDF generation, etc.)
├── lib/
│   ├── components/
│   │   ├── ThemeSelector.svelte     # 34 theme selector
│   │   ├── ResumeViewer.svelte      # Scoped resume display
│   │   └── resume/                  # Individual section components
│   │       ├── ExperienceSection.svelte
│   │       ├── ProjectsSection.svelte
│   │       ├── SkillsSection.svelte
│   │       └── [8 more sections...]
│   ├── utils/               # Section renderers and utilities
│   │   ├── section-renderer.js      # Universal base class
│   │   ├── experience-renderer.js   # Company-based grouping
│   │   ├── projects-renderer.js     # Dual-section architecture
│   │   └── [8 more renderers...]
│   └── stores/              # Svelte stores
│       └── theme.js         # Theme management
└── static/                  # Static assets
```

## Core Components

### Section Rendering System
All 11 resume sections use the universal SectionRenderer pattern:
- **Filtering** - Priority-based content filtering
- **Grouping** - Logical content organization (companies, categories, etc.)
- **Rendering** - Consistent HTML structure with `.section-wrapper` pattern

### State Management
- **URL Parameters** - Section visibility and preset selection persist in URLs
- **Theme Store** - Global theme state with localStorage persistence
- **Reactive Updates** - Real-time preview updates as controls change

### Advanced UX Features
- **Content Density Control** - Slider with 10% increments and quick-select buttons
- **Category-Specific Controls** - Safe section management within logical groups
- **Zero Build Warnings** - Production-ready with clean builds
- **Stable State Management** - No cyclical dependencies or crashes

## Next Development Phase

The web application foundation is complete. Next priorities:

1. **Backend Integration** - Connect density slider to existing `filterBullets()` system
2. **Real-time Filtering** - Priority-based content filtering with live preview
3. **Enhanced PDF Export** - Direct integration with Playwright CLI for server-side generation
4. **Advanced Presets** - Multiple resume variations (technical, leadership, etc.)

## Usage

```bash
# Start development server
npm run dev:web

# Build for production
npm run build:web

# Preview production build
npm run preview:web
```

The application runs at `localhost:3000` with full hot module replacement and instant updates.

---

*Interactive resume customizer with production-ready architecture and advanced UX controls.* 