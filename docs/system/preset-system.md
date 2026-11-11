# Preset System Documentation

## Overview

The Resume Customizer uses a **sophisticated, multi-layered content curation engine** that transforms a comprehensive resume into strategically targeted versions for different career contexts. It operates on an **override-based architecture** where presets selectively modify base profile data rather than redefining everything from scratch.

---

## 🏗️ Architecture & Data Flow

### **Core Components**
```
📁 input/profiles/presets/ (8 preset JSON files)
    ↓ loaded by
📄 src/shared/preset-merger.js (merge logic)
    ↓ applied in  
📄 src/web/routes/+page.server.js (server-side processing)
    ↓ consumed by
📄 src/web/lib/utils/*-renderer.js (section renderers)
```

### **Data Flow Pipeline**
```
1. Raw Profile Data (profile.json + sections/*.json)
2. Preset Selection (URL parameter or default)
3. Preset Loading & Merging (preset-merger.js)
4. Section Rendering (individual renderers)
5. HTML Output (Svelte components)
```

---

## 📊 Available Presets

The system includes **8 preset JSON files** under `input/profiles/presets/`. The web dropdown only lists the curated subset below; the others still work via `?preset=<name>` while they finish curation (`+page.server.js` hides them from `availablePresets`).

**In the dropdown today:**
1. **`one-page.json`** (order: 1) - Space-constrained applications
2. **`senior-engineering-leadership.json`** (order: 2) - Management-focused roles
3. **`principal-ic-plus.json`** (order: 5) - Senior individual contributor positions
4. **`reference-sheet.json`** (order: 8) - Pure testimonials document
5. **`full`** (synthetic) - Comprehensive resume with no preset overrides

**URL-only for now** (files exist; omitted from the dropdown):
- **`startup-pioneer.json`** (order: 3) - Early-stage company positions → `?preset=startup-pioneer`
- **`ai-innovation-leader.json`** (order: 4) - AI/innovation leadership roles → `?preset=ai-innovation-leader`
- **`consultant-advisory.json`** (order: 6) - Strategic consulting roles → `?preset=consultant-advisory`
- **`tech-teacher-coach.json`** (order: 7) - Educational/mentoring positions → `?preset=tech-teacher-coach`

### **Preset JSON Structure**

Each preset follows this structure:

```json
{
  "meta": {
    "name": "Display Name",
    "description": "User-facing description", 
    "order": 1  // Controls dropdown ordering
  },
  "overrides": {
    "objective": "Custom objective text",
    "skills": { /* Curated skills by category */ },
    "experience": { /* Experience filtering config */ },
    "projects": { /* Projects filtering config */ },
    "recommendations": { /* Recommendations selection */ },
    "sections_order": ["section1", "section2", "..."]
  }
}
```

---

## 🎛️ Content Curation Mechanisms

### **1. Strategic Skills Override**
Presets completely replace the default skills with curated lists organized by category:

**Example from AI Innovation Leader:**
```json
"skills": {
  "Leadership": ["Innovation Management", "AI Strategy", "Technology Evangelism"],
  "Programming Languages": ["JavaScript/TypeScript", "Python", "HTML"],
  "Frameworks & Libraries": ["Enterprise AI APIs", "LLMs", "Prompt Engineering"],
  "Tools & Platforms": ["Cursor", "GitHub Copilot", "OpenAI APIs"],
  "Concepts & Methodologies": ["Artificial Intelligence (AI)", "AI Ethics & Safety"]
}
```

**Skills Override Strategy:**
- **Complete Replacement**: Preset skills entirely replace base profile skills
- **Category Organization**: Skills grouped by logical categories for better presentation
- **Preset-Specific Focus**: Each preset emphasizes relevant technologies/concepts
- **Density Integration**: Skills section respects density filtering within preset selections

### **2. Experience Index Selection**
The `selected_indices` array picks specific experiences by their position in the base array:

**One-Page Example** (matches `one-page.json`):
```json
"experience": {
  "selected_indices": [0, 1, 2],  // First 3 experiences only
  "bullet_priority_threshold": 7,
  "bullet_priorities_overrides": {
    "1": [10, 9, 10, 8, 6, 5, 6, 6],  // Override priorities for experience #1
    "2": [10, 6, 6, 9, 8],            // Override priorities for experience #2
    "3": [9, 10, 6, 6, 6, 8]          // Override priorities for experience #3
  }
}
```

Override keys are base-array indices, not positions inside `selected_indices`. Index `0` is selected but has no override (base priorities apply).

**Index Selection Strategy:**
- **Strategic Picking**: Select most relevant experiences for target role
- **Chronological Flexibility**: Can skip recent experiences if not relevant
- **Array Preservation**: Original experience array stays intact, only filtering changes
- **Cross-Reference Safety**: Selected indices must exist in base experience array

### **3. Bullet Priority Overrides**
This is the **most sophisticated feature** - presets can override the priority scores of individual bullet points:

**Base Data** (from `sections/experience.json`):
```json
{
  "bulletPoints": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "bullet_priorities": [7, 8, 6]  // Default priorities
}
```

**Preset Override** transforms this to:
```json
{
  "bulletPoints": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "bullet_priorities": [10, 9, 10]  // Preset-specific priorities
}
```

**Priority Override Logic:**
- **Index-Based Mapping**: `"0": [10, 9, 10]` applies to experience at index 0
- **Complete Override**: Preset priorities replace base priorities entirely
- **Threshold Integration**: Works with `bullet_priority_threshold` for filtering
- **Fallback Safety**: If no override exists, uses base priorities

### **4. Section Ordering Control**
Presets can reorder entire sections:

```json
"sections_order": ["headline", "objective", "education", "skills", "experience", "projects"]
```

**Section Ordering Strategy:**
- **Context-Appropriate Flow**: Different orders for different career focuses
- **Strategic Positioning**: Lead with most relevant sections for target audience
- **Consistency**: All presets maintain logical section relationships
- **Override Complete**: Preset order completely replaces default ordering

---

## 🔍 Preset-Specific Strategies

### **Reference Sheet** - Unique Architecture
```json
{
  "overrides": {
    "objective": null,        // Ignored by merge (truthy-only); does not clear base objective
    "skills": null,          // Ignored by merge (truthy-only); does not clear base skills
    "experience": { "selected_indices": [] },  // Hide all experience entries
    "projects": { "selected_indices": [] },    // Hide all projects
    "recommendations": { 
      "selected_indices": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] 
    },
    "sections_order": ["headline", "recommendations"]  // Hides other sections from render order
  }
}
```

`mergePresetWithRawData` only applies truthy `objective` / `skills` overrides, so `null` is a no-op on base data. This preset hides those sections through `sections_order` (and empty `selected_indices` for experience/projects), not via null deletion.

**Reference Sheet Strategy:**
- **Pure Testimonials**: Only recommendations section visible
- **Networking Tool**: Designed for credibility building and referrals
- **Minimal Structure**: Just headline + recommendations for clean presentation
- **Complete Coverage**: Includes all available recommendations

### **Senior Engineering Leadership** - Management Focus
```json
{
  "experience": {
    "selected_indices": [0, 1, 2, 3, 4, 6, 7, 10],
    "bullet_priority_threshold": 7,
    "bullet_priorities_overrides": {
      "1": [8, 8, 10, 10, 4, 4, 4, 4],
      "2": [10, 8, 4, 10, 4],
      "3": [10, 10, 4, 4, 8, 10],
      "4": [10, 10, 10, 4, 4, 4, 4],
      "6": [8, 4, 4, 8, 4],
      "7": [4, 8, 10, 4, 10, 10],
      "10": [10, 4, 10, 10, 4, 4, 4]
    }
  }
}
```

**Leadership Strategy:**
- **Skills Emphasis**: "Engineering Management", "Strategic Planning", "Organizational Development"
- **Role Selection**: Broader leadership-relevant set (indices 0-4, 6, 7, 10), not only 1-4
- **High Threshold**: `bullet_priority_threshold: 7` ensures only top-tier bullets
- **No recommendations block**: This preset omits a recommendations override

### **Startup Pioneer** - Innovation Focus  
```json
{
  "experience": {
    "selected_indices": [0, 8, 9],  // Innovative/founding roles
    "bullet_priority_threshold": 8  // Higher threshold for impact
  },
  "projects": {
    "selected_indices": [0, 3, 6, 18],  // Innovation projects
    "bullet_priorities_overrides": {
      "0": [10, 8, 9, 7],
      "3": [10, 9, 9, 9]
    }
  }
}
```

**Startup Strategy:**
- **Innovation Focus**: AI, rapid prototyping, modern tech stack
- **Higher Standards**: `bullet_priority_threshold: 8` shows only highest-impact work
- **Founding Experience**: Emphasizes early-stage and innovative roles
- **No Social Proof**: Omits recommendations for action-focused document

### **One-Page** - Space Optimization
```json
{
  "experience": {
    "selected_indices": [0, 1, 2],
    "bullet_priority_threshold": 7,
    "bullet_priorities_overrides": {
      "1": [10, 9, 10, 8, 6, 5, 6, 6],
      "2": [10, 6, 6, 9, 8],
      "3": [9, 10, 6, 6, 6, 8]
    }
  },
  "projects": {
    "selected_indices": [0, 6],  // Only 2 projects
    "bullet_priorities_overrides": {
      "0": [10, 7, 9, 6],
      "6": [10, 7, 6, 9, 6, 6, 6, 8]
    }
  },
  "sections_order": ["headline", "education", "skills", "experience", "projects"]
}
```

**One-Page Strategy:**
- **Aggressive Filtering**: Minimal content selection for space constraints
- **Strategic Overrides**: Boost priority of most impactful bullets
- **Essential Sections**: Removes summary/objective to save space
- **Balanced Skills**: Comprehensive skills list to show breadth quickly

---

## ⚙️ Technical Implementation

### **Preset Loading & Merging** (`src/shared/preset-merger.js`)

```javascript
/**
 * Main function to apply preset to profile data
 */
export function applyPreset(rawData, presetName) {
  // Default to raw data if no preset specified
  if (!presetName || presetName === 'full') {
    return rawData
  }
  
  // Load preset
  const preset = loadPreset(presetName)
  if (!preset) {
    return rawData  // Fallback safety
  }
  
  // Merge preset with raw data
  return mergePresetWithRawData(rawData, preset)
}
```

**Merging Process:**
1. **Load Base Data**: Combines `profile.json` + all `sections/*.json`
2. **Load Preset**: Reads specific preset JSON from `presets/` directory  
3. **Apply Overrides**: Merges preset overrides with base data
4. **Bullet Priority Processing**: Applies `bullet_priorities_overrides` to individual entries
5. **Structure Preservation**: Maintains array structures while adding `preset_filters` metadata

### **Rendering Integration**

**Each section renderer** checks for preset data:

```javascript
// From experience-renderer.js  
static experienceFilterStrategy(experiences, config) {
  // Get filters from config or from preset_filters attached to the array
  const filters = config || experiences.preset_filters || {}
  
  // Apply index-based selection (from preset)
  if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
    filtered = filters.selected_indices
      .filter(index => index >= 0 && index < experiences.length)
      .map(index => experiences[index])
  }
  
  return filtered
}
```

**Bullet filtering** uses preset priorities:

```javascript
// From section-renderer.js
static filterBulletsWithConfig(bulletPoints, bulletPriorities, bulletDensity, config) {
  const priorityThreshold = config.bullet_priority_threshold
  
  return priorityThreshold 
    ? this.filterBulletsByPriority(bulletPoints, bulletPriorities, priorityThreshold)
    : this.filterBullets(bulletPoints, bulletPriorities, bulletDensity)
}
```

### **Server-Side Integration** (`src/web/routes/+page.server.js`)

```javascript
export async function load({ url }) {
  // Get preset from URL parameter or default to 'full'
  const preset = url.searchParams.get('preset') || 'full'
  
  // Load and apply preset to raw data
  const rawData = loadAllProfileSections()
  const profileData = applyPreset(rawData, preset)
  
  return {
    profileData,
    preset,
    availablePresets: loadAvailablePresets()
  }
}
```

**Integration Flow:**
1. **URL Parameter**: `?preset=one-page` determines active preset
2. **Server Processing**: Preset applied during server-side data loading
3. **Component Rendering**: Svelte components receive pre-filtered data
4. **Client Hydration**: Preset state maintained in client-side stores

---

## 🎯 Priority Resolution Hierarchy

### **Bullet Priority Resolution Order:**
1. **Preset `bullet_priorities_overrides`** (highest precedence)
2. **Base JSON `bullet_priorities`** (fallback)
3. **No priority filtering** (when priorities are absent, `SectionRenderer` returns all bullets; threshold/density filters are skipped)

### **Skills Resolution Order:**
1. **Preset `skills` object** (complete replacement)
2. **Skills inventory data** (skillsInventory.json)
3. **Raw skills array** (profile sections)

### **Content Selection Order (experience):**
1. **Timeframe filtering** runs first against the working list (years-based)
2. **Role filtering** (`experience_filter`) applies next
3. **`selected_indices` rebuilds from the original array** when present, so a selected older entry can reappear even if timeframe would have dropped it
4. **Bullet filtering**: `bullet_priority_threshold` takes precedence over density. When the threshold is set, `SectionRenderer` uses it and skips density filtering (so changing density does not change One-Page experience bullets). Density filtering only applies when no threshold is set.

---

## 🔧 Configuration Examples

### **Creating a New Preset**

```json
{
  "meta": {
    "name": "DevOps Engineer",
    "description": "Infrastructure and deployment-focused resume for DevOps roles",
    "order": 9
  },
  "overrides": {
    "objective": "DevOps engineer with expertise in cloud infrastructure...",
    "skills": {
      "DevOps & Infrastructure": ["AWS", "Docker", "Kubernetes", "Terraform"],
      "Programming Languages": ["Python", "Bash", "YAML", "JSON"],
      "Monitoring & Logging": ["Prometheus", "Grafana", "ELK Stack"]
    },
    "experience": {
      "selected_indices": [0, 5, 10],
      "bullet_priority_threshold": 6,
      "bullet_priorities_overrides": {
        "0": [10, 9, 8, 7, 9, 8, 7, 8]
      }
    },
    "projects": {
      "selected_indices": [7, 12, 15]
    },
    "sections_order": ["headline", "summary", "skills", "experience", "projects", "education"]
  }
}
```

### **Modifying Existing Presets**

To adjust the One-Page preset:

1. **Edit** `input/profiles/presets/one-page.json`
2. **Modify** `selected_indices` to change which experiences appear
3. **Adjust** `bullet_priorities_overrides` to emphasize different bullets
4. **Update** `bullet_priority_threshold` to be more/less selective

### **Testing Preset Changes**

The CLI `json-to-pdf` / `json-to-html` commands do not define `--preset` (or `--verbose` on `json-to-html`). Test presets through the web app:

```bash
npm run dev:web
# Navigate to: http://localhost:3000?preset=one-page
# URL-only presets work the same way, e.g. ?preset=startup-pioneer
```

---

## 🛠️ Advanced Features

### **Conditional Overrides**
Future enhancement: Presets could support conditional logic based on profile data:

```json
{
  "conditional_overrides": {
    "if_experience_years > 10": {
      "bullet_priority_threshold": 8
    },
    "if_has_management_experience": {
      "sections_order": ["headline", "summary", "experience", "skills"]
    }
  }
}
```

### **Preset Inheritance**
Future enhancement: Allow presets to inherit from others:

```json
{
  "inherits_from": "senior-engineering-leadership",
  "overrides": {
    // Only specify differences
    "skills": {
      "AI & Machine Learning": ["LLMs", "Prompt Engineering"]
    }
  }
}
```

### **Dynamic Preset Generation**
Future enhancement: Generate presets from job descriptions:

```javascript
// Theoretical API
const preset = generatePresetFromJobDescription(jobDescriptionText)
```

---

## 📋 Best Practices

### **Preset Design Guidelines**
1. **Clear Purpose**: Each preset should target a specific career context
2. **Consistent Quality**: Maintain high standards across all preset variations
3. **Strategic Focus**: Emphasize 3-5 key themes per preset
4. **Content Balance**: Ensure adequate content remains after filtering

### **Priority Assignment**
- **10**: Revolutionary impact, award-winning work, company-defining moments
- **8-9**: Strategic leadership, major technical achievements
- **7-8**: Strong professional competence, solid technical work
- **5-6**: Standard responsibilities, routine work
- **3-4**: Low-priority or administrative tasks

### **Index Selection Strategy**
- **Recent First**: Usually select most recent relevant experiences
- **Strategic Gaps**: Skip experiences that don't align with preset theme
- **Diversity**: Include variety of company types/sizes when possible
- **Impact Focus**: Prioritize roles with measurable business impact

---

## 🔍 Troubleshooting

### **Common Issues**

**Preset Not Loading:**
- Check file exists in `input/profiles/presets/`
- Verify JSON syntax is valid
- Ensure `meta.order` is unique number

**Selected Indices Out of Range:**
- Verify indices exist in base experience/projects arrays
- Check for zero-based indexing (first item is index 0)
- Review console logs for filtering warnings

**Bullet Overrides Not Working:**
- Ensure `bullet_priorities_overrides` keys match array indices
- Verify priority arrays match bullet point count
- Check `bullet_priority_threshold` is appropriate

**Missing Content:**
- Lower `bullet_priority_threshold` if sections appear empty
- Verify `selected_indices` include relevant entries
- Check base data has adequate `bullet_priorities`

### **Debug Commands**

```bash
# Check preset structure
cat input/profiles/presets/one-page.json | jq '.'

# Validate all presets
ls input/profiles/presets/*.json | xargs -I {} bash -c 'echo {}; cat {} | jq .'

# Exercise a preset in the browser (CLI has no --preset flag)
npm run dev:web
# open http://localhost:3000?preset=one-page
```

---

## 📚 Related Documentation

- **[Bullet Priority System](bullet-priority-system.md)** - Detailed priority scoring framework
- **[PDF Generation System](pdf-generation-system.md)** - How presets integrate with PDF output
- **[State Resolution](../state-resolution.md)** - URL state management and filtering hierarchy

---

*Last Updated: November 11, 2026*
