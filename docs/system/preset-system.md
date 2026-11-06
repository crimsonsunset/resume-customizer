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

The system includes **8 strategic presets**, each optimized for different career contexts:

1. **`one-page.json`** (order: 1) - Space-constrained applications
2. **`senior-engineering-leadership.json`** (order: 2) - Management-focused roles  
3. **`startup-pioneer.json`** (order: 3) - Early-stage company positions
4. **`ai-innovation-leader.json`** (order: 4) - AI/innovation leadership roles
5. **`principal-ic-plus.json`** (order: 5) - Senior individual contributor positions
6. **`consultant-advisory.json`** (order: 6) - Strategic consulting roles
7. **`tech-teacher-coach.json`** (order: 7) - Educational/mentoring positions  
8. **`reference-sheet.json`** (order: 8) - Pure testimonials document

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

**One-Page Example:**
```json
"experience": {
  "selected_indices": [0, 1, 2],  // First 3 experiences only
  "bullet_priority_threshold": 7,
  "bullet_priorities_overrides": {
    "0": [10, 9, 10, 8, 6, 5, 6, 6],  // Override priorities for experience #0
    "1": [10, 6, 6, 9, 8],            // Override priorities for experience #1
    "2": [9, 10, 6, 6, 6, 8]          // Override priorities for experience #2
  }
}
```

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
    "objective": null,        // Remove objective
    "skills": null,          // Remove skills  
    "experience": { "selected_indices": [] },  // Remove all experience
    "projects": { "selected_indices": [] },    // Remove all projects
    "recommendations": { 
      "selected_indices": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14] 
    },
    "sections_order": ["headline", "recommendations"]  // Only these two sections
  }
}
```

**Reference Sheet Strategy:**
- **Pure Testimonials**: Only recommendations section visible
- **Networking Tool**: Designed for credibility building and referrals
- **Minimal Structure**: Just headline + recommendations for clean presentation
- **Complete Coverage**: Includes all available recommendations

### **Senior Engineering Leadership** - Management Focus
```json
{
  "experience": {
    "selected_indices": [1, 2, 3, 4],  // Management roles
    "bullet_priority_threshold": 7,
    "bullet_priorities_overrides": {
      "1": [10, 8, 7, 9, 8],  // Emphasize leadership bullets
      "2": [10, 10, 7, 7, 8, 9],
      "3": [9, 9, 8, 7, 7, 7, 6],
      "4": [8, 9, 9, 7, 7, 6, 8]
    }
  },
  "recommendations": { "selected_indices": [0, 1, 2, 3] }
}
```

**Leadership Strategy:**
- **Skills Emphasis**: "Engineering Management", "Strategic Planning", "Organizational Development"
- **Role Selection**: Focuses on management positions (indices 1-4)
- **High Threshold**: `bullet_priority_threshold: 7` ensures only top-tier bullets
- **Social Proof**: Includes recommendations for credibility

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
      "0": [10, 9, 10, 8, 6, 5, 6, 6],
      "1": [10, 6, 6, 9, 8],
      "2": [9, 10, 6, 6, 6, 8]
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
3. **Default threshold filtering** (when no priorities exist)

### **Skills Resolution Order:**
1. **Preset `skills` object** (complete replacement)
2. **Skills inventory data** (skillsInventory.json)
3. **Raw skills array** (profile sections)

### **Content Selection Order:**
1. **Preset `selected_indices`** (strategic picking)
2. **Timeframe filtering** (years-based)
3. **Priority threshold** (bullet-level filtering)
4. **Density filtering** (fallback mechanism)

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

```bash
# Test specific preset
npm run dev:web
# Navigate to: localhost:3000?preset=one-page

# Or use CLI for quick testing
npm run json-to-pdf -- --preset one-page -o test-onepage.pdf
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

# Test preset application
npm run json-to-html -- --preset one-page --verbose

# Validate all presets
ls input/profiles/presets/*.json | xargs -I {} bash -c 'echo {}; cat {} | jq .'
```

---

## 📚 Related Documentation

- **[Bullet Priority System](bullet-priority-system.md)** - Detailed priority scoring framework
- **[PDF Generation System](pdf-generation-system.md)** - How presets integrate with PDF output
- **[State Resolution](../state-resolution.md)** - URL state management and filtering hierarchy

---

*Last Updated: September 10, 2025*
