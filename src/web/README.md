# Resume Optimizer Web App

🚀 **Production Ready** - Interactive resume customizer with component-based architecture and real-time statistics

## Current Features

The web application provides a comprehensive resume customization experience with:

### ✨ Core Functionality
- **Interactive Resume Preview** - Real-time resume display with professional styling
- **Mobile-First Responsive Design** - DaisyUI drawer with hamburger menu for optimal mobile experience
- **Strategic Content Curation** - Index-based selection system for intelligent content optimization
- **34 DaisyUI Themes** - Complete theme system with seamless switching
- **DaisyUI Wrapper Components** - Consistent UI with Button, Toggle, Card, Badge, and Checkbox wrappers
- **Universal Section Rendering** - All 11 resume sections with consistent architecture
- **URL State Management** - Bookmarkable resume configurations with compact encoding (`?preset=one-page&sections=exp,proj,edu,skills`)
- **Real-time Statistics** - Dynamic content metrics that update as you customize
- **PDF Export Ready** - One-click PDF generation with auto-generated filenames
- **Component-Based Architecture** - Modular design with extracted control panel components

### 🎛️ Advanced Controls
- **Intelligent Filtering System** - Two-tier priority-based content reduction with cutoff filtering
- **Content Density Controls** - 10-100% slider with Manual vs Density mode toggle
- **Dynamic Statistics Panel** - Real-time metrics showing:
  - Visible sections count (X of Y total)
  - Content items (experience, projects, skills counts)
  - Estimated page length with density-adjusted word count
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
- **DaisyUI + Tailwind CSS 4** - Professional UI components and modern styling with responsive drawer layout
- **Universal SectionRenderer** - Consistent architecture across all 11 sections
- **Scoped CSS** - Proper isolation between UI framework and resume styling
- **Mobile-First Design** - Responsive hamburger navigation with DaisyUI drawer component

**Data Flow:**
```
JSON Profile Data → Preset Merger → Priority-Based Filtering → Section Renderers → Svelte Components → HTML
```

**Strategic Content Curation:**
- **Index-Based Selection**: Strategic experience/project picking (e.g., selected_indices: [0, 2, 4])
- **Priority-Based Bullet Filtering**: Direct threshold control (bullet_priority_threshold: 7)
- **Intelligent Content Optimization**: Replaces chronological truncation with strategic curation
- **Unified Filtering System**: Index selection + bullet filtering working together seamlessly

**Intelligent Filtering System:**
- **Cutoff-Based Logic**: Lower density = higher priority cutoff = fewer bullets
- **Two-Tier Filtering**: Section-level + bullet-level filtering with single control
- **Manual vs Density Modes**: Toggle between checkbox control and automatic filtering
- **URL State Persistence**: Filter settings persist in browser URL for bookmarking

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
│   │   ├── PresetSelector.svelte    # Version dropdown with URL navigation
│   │   ├── SectionControls.svelte   # Accordion section toggles with category controls
│   │   ├── DensityControls.svelte   # Content density slider with quick-select
│   │   ├── ResumeStats.svelte       # **Dynamic stats with real-time updates**
│   │   ├── ComingSoonFeatures.svelte # Future features placeholder
│   │   ├── ui/                      # **DaisyUI wrapper components**
│   │   │   ├── Button.svelte        # Consistent button component with DaisyUI styling
│   │   │   ├── ButtonGroup.svelte   # Button group wrapper
│   │   │   ├── Card.svelte          # Card component wrapper
│   │   │   ├── Toggle.svelte        # Toggle switch component
│   │   │   ├── Checkbox.svelte      # Checkbox component wrapper
│   │   │   └── Badge.svelte         # Badge component wrapper
│   │   └── resume/                  # Individual section components
│   │       ├── ExperienceSection.svelte
│   │       ├── ProjectsSection.svelte
│   │       ├── SkillsSection.svelte
│   │       └── [8 more sections...]
│   ├── utils/               # Section renderers and utilities
│   │   ├── section-renderer.js      # Universal base class
│   │   ├── experience-renderer.js   # Company-based grouping
│   │   ├── projects-renderer.js     # Dual-section architecture
│   │   ├── url-state-manager.js     # **URL encoding/decoding utilities**
│   │   └── [8 more renderers...]
│   └── stores/              # Svelte stores
│       ├── theme.js         # Theme management
│       └── url-state.js     # **Reactive URL state management**
└── static/                  # Static assets
```

## Core Components

### Component-Based Architecture (NEW)
Extracted 5 control panel components for better maintainability:
- **PresetSelector** - Version dropdown with URL navigation
- **SectionControls** - All section toggles with category-specific controls
- **DensityControls** - Content density slider with quick-select buttons
- **ResumeStats** - **Real-time statistics with dynamic content calculation**
- **ComingSoonFeatures** - Future features placeholder

### Section Rendering System
All 11 resume sections use the universal SectionRenderer pattern:
- **Filtering** - Priority-based content filtering
- **Grouping** - Logical content organization (companies, categories, etc.)
- **Rendering** - Consistent HTML structure with `.section-wrapper` pattern

### State Management
- **URL State Management** - Compact encoding with proper reactive updates (`?preset=one-page&sections=exp,proj,edu,skills`)
- **Theme Store** - Global theme state with localStorage persistence
- **Reactive Updates** - Real-time preview updates as controls change
- **Statistics Store** - Dynamic content metrics that update with user interactions

### Advanced UX Features
- **Real-time Statistics** - Dynamic content metrics showing actual resume data
- **Content Density Control** - Slider with 10% increments and quick-select buttons
- **Category-Specific Controls** - Safe section management within logical groups
- **45% Code Reduction** - Main file reduced from 724 → 393 lines through component extraction
- **Zero Build Warnings** - Production-ready with clean builds and resolved lint issues

## Next Development Phase

The strategic content curation system is now implemented! Next priorities:

1. **Complete Priority Data Implementation** - Add bullet_priorities to remaining 17 experience entries and other sections
2. **Content Length Optimization** - Verify one-page preset achieves target length with complete priority data
3. **Strategic Selection Enhancement** - Fine-tune selected_indices for optimal impact across different presets
4. **Enhanced PDF Export** - Direct integration with Playwright CLI for server-side generation with filtering
5. **Advanced Presets** - Multiple resume variations (technical, leadership, startup-focused) with different strategic selections

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