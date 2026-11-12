# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers evaluating Joe Sangiorgio for an engineering leadership or senior IC role. They arrive from a shared link (LinkedIn, Slack, email), usually with a specific role in mind, and want to see quickly whether Joe's experience fits it. Not a product for sale; there is no second audience of end users building their own resumes.

## Product Purpose

An interactive version of Joe's resume. Visitors reshape it to their role (presets, sections, content density, timeframe) and export a PDF of the result. Success is both: the visitor tailors the resume and then reaches out or downloads the PDF, and they leave convinced Joe builds well-crafted products, because the tool itself is the proof.

## Positioning

A static resume says what someone did. This one lets the reader choose which version of the candidate they're looking at, driven by real per-bullet priorities and curated presets written by the candidate himself.

## Operating Context

- Main surface: the customizer at `/` with a control sidebar (preset, sections, density, timeframe, theme, stats) beside a live resume preview. On mobile the controls live in a drawer.
- Secondary surface: `/pdf`, a PDF upload/convert page.
- Configurations are encoded in the URL so a tailored view can be bookmarked and shared.
- PDF export runs through Gotenberg on Google Cloud Run, with Playwright as a fallback.

## Capabilities and Constraints

- Nine presets: Comprehensive, One-Page, Senior Engineering Leadership, Startup Pioneer, AI & Innovation Leader, Principal IC+, Consultant/Advisory, Tech Teacher/Coach, Reference Sheet.
- All DaisyUI themes stay available, and the theme picker stays. UI styling must hold up across every theme.
- The rendered resume's layout and typography are locked: `.resume-container`, `input/templates/*.css`, and the PDF output. Theme colors keep flowing into the resume preview and PDF as they do today.
- Stack: SvelteKit, Tailwind CSS 4, DaisyUI 5, deployed on Netlify.

## Brand Commitments

- UI copy is first person and conversational, with Joe speaking directly to the reader (e.g. "Hi, I'm Joe, an engineering leader who's built great products and great teams for 15+ years.").
- The resume header shows name, email and location only. No phone number.

## Evidence on Hand

- Full profile data: `input/profiles/` (experience, projects, recommendations, skills inventory, presets).
- Real recommendations live in the profile data. Use them as they are; never invent testimonials, metrics or employers.
- Social share image: `static/og-image.png`.

## Product Principles

1. The resume is the hero. Controls serve it and never compete with it.
2. Show craft, don't claim it. The UI's quality is part of the pitch.
3. Fast to a tailored result: a recruiter should reach a role-fit view in a click or two.
4. Respect the visitor's time: sensible defaults, no overwhelming first view.
