# Resume Optimizer Web App

🚧 **Future Development** - This directory is prepared for Phase 4 of the Resume Optimizer project.

## Vision

Transform the CLI tool into an interactive web application for recruiters and hiring managers.

## Planned Architecture

- **Frontend**: Svelte application with interactive controls
- **Backend**: Netlify Functions for AI processing and PDF generation
- **AI Integration**: Direct LLM API calls for job description matching
- **Data Source**: Shared JSON files (profile.json, skills-inventory.json)

## Planned Structure

```
web-app/
├── src/
│   ├── lib/
│   │   ├── data/           # JSON data processing
│   │   ├── ai/             # LLM API integration
│   │   └── pdf/            # PDF generation utilities
│   ├── routes/
│   │   ├── +page.svelte    # Main recruiter interface
│   │   └── api/            # Netlify function endpoints
│   └── components/
│       ├── JobDescriptionInput.svelte
│       ├── ResumePreview.svelte
│       ├── ExperienceSelector.svelte
│       └── LayoutStylePicker.svelte
├── static/
└── netlify/
    └── functions/
        ├── generate-resume.js
        ├── analyze-job.js
        └── create-pdf.js
```

## Current Status

**Phase 2**: Enhanced HTML Editing (CLI tool optimization)  
**Phase 4**: Web Application (this directory)

See `../../roadmap.md` for complete development plan. 