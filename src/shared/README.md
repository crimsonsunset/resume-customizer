# Shared Utilities

This directory contains reusable utilities for the Resume Optimizer project.

## Structure

```
src/shared/
├── resume-generator.js     # Core resume generation logic
└── README.md              # This file
```

## Data Organization

All data files have been moved to the top-level `input/` directory:

```
input/
├── profiles/               # Profile data (original + working copies)
│   ├── profile.json       # Original profile (never modified)
│   ├── profile-working.json # Working copy for edits
│   ├── skills-*.json      # Skills data
│   └── profile-resume-schema.json # Schema template
├── templates/             # CSS/HTML templates
│   └── resume-styles.css  # Style templates
├── working/               # Auto-saved working files
├── examples/              # Sample resumes
└── assets/                # Images, fonts, etc.
```

## Usage

The resume generator automatically creates working copies to preserve originals:

```javascript
import ResumeGenerator from '@shared/resume-generator.js'

// This will create input/working/profile-working.json if it doesn't exist
const generator = new ResumeGenerator('input/profiles/profile.json')
```

## Auto-Save Logic

- **Originals preserved**: Files in `input/profiles/` are never modified
- **Working copies**: Auto-created in `input/working/` for edits
- **Safe iteration**: Multiple versions can be saved and compared 