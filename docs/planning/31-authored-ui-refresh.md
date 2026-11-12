# #31: Make the UI look authored, not generated

## Flow state

| Field | Value |
|---|---|
| Gate | 2 (plan ready) |
| Ticket | [#31](https://github.com/crimsonsunset/resume-customizer/issues/31) |
| Branch | feature/31-authored-ui-refresh |
| Repos | resume-customizer |
| Isolation | worktree |
| Worktrees | /Users/joe/Desktop/Repos/Personal/resume-customizer/.worktrees/31 |
| Base | origin/master @ d1ce463 |
| QA mode | browser-qa (chrome-devtools via mux) |
| Gates | none |
| Updated | 2026-11-12 |

**Status:** Plan written. Not started.
**Estimate:** 1 to 2 days across the six child tickets.

## Overview

The app chrome reads as AI-generated (critique score 18/40). This epic is **refine, not redesign**: one branch, one PR, covering children [#25](https://github.com/crimsonsunset/resume-customizer/issues/25) to [#30](https://github.com/crimsonsunset/resume-customizer/issues/30). Constraints from `PRODUCT.md`: every DaisyUI theme and the theme picker stay, and the resume layout, typography and PDF output are locked (`.resume-container`, `.resume-viewer` styles, `input/templates/*.css`).

## Decisions

Gate 1 questions were skipped, so these are defaults picked for the lowest risk. Reverse any of them before merge.

| # | Decision | Rationale |
|---|---|---|
| 1 | One branch and one PR for the whole epic | Children overlap heavily on the same files (`+page.svelte`, sidebar components). Split PRs would conflict |
| 2 | Fine-tune group is collapsed by default, sliders inside stay interactive | No behavior change. The slider/preset model is [#20](https://github.com/crimsonsunset/resume-customizer/issues/20) |
| 3 | UI typeface: one self-hosted variable sans in `static/fonts/`, preloaded in `src/web/app.html`, with the system stack as fallback and `size-adjust` fallback metrics | Issue asks for self-host or preload with no layout shift. No new npm dependency |
| 4 | Header title is "Joe Sangiorgio" with one first-person intro line beneath | Matches `PRODUCT.md` brand commitments |
| 5 | PDF failure fallback email is read from `input/profiles/profile.json` (`basic_info.contact.email`) | Single source of truth, no hardcoded address |
| 6 | Hover is a color/background change only. Motion respects `prefers-reduced-motion` | [#25](https://github.com/crimsonsunset/resume-customizer/issues/25) |

## Scope

**In:** everything checked in #25 to #30, plus README and `docs/` mentions of "Resume Optimizer" and ComingSoon that go stale.

**Out**
- Preset/slider unification: [#20](https://github.com/crimsonsunset/resume-customizer/issues/20)
- `console.log` emoji (never rendered), anything inside `.resume-container` or `input/templates`
- `src/web/app.html` loader colors (Phase 9.5 color audit in `docs/roadmap.md`), unless the font preload edit touches them

## Files

| File | Change |
|---|---|
| `src/web/routes/+page.svelte` | Header identity, intro, Reset/PDF buttons, toasts, sidebar order, spacing, resume wrapper class |
| `src/web/routes/pdf/+page.svelte` | Emoji, drop zone shadow/scale, FAB hover, toast copy |
| `src/web/lib/components/PresetSelector.svelte` | Dominant preset control, "Which role are you hiring for?", per-preset line |
| `src/web/lib/components/SectionControls.svelte` | Emoji and scale removal, moved into fine-tune group |
| `src/web/lib/components/DensityControls.svelte` | Emoji removal, moved into fine-tune group |
| `src/web/lib/components/ResumeStats.svelte` | Single-line stats |
| `src/web/lib/components/ComingSoonFeatures.svelte` | Delete, and its import |
| `src/web/lib/components/ThemeSelector.svelte`, `ui/MobileMenu.svelte` | Emoji and scale removal only |
| `src/web/app.css`, `src/web/app.html`, `static/fonts/*` | Font, type scale, overline utility |
| `README.md`, `docs/roadmap.md`, `docs/next-session.md` | Rename and stale feature mentions |
| `docs/planning/31-authored-ui-refresh.md` | This doc |

## Phasing

### Phase 1: Quieter (#25, about 1 hour)
- Remove emoji from card titles, header, buttons, toasts, `/pdf` hero and bullets.
- Remove `hover:scale-*`, `active:scale-*`, the reset toast `animate-pulse scale-110`, and the `/pdf` drop zone `shadow-2xl scale-105` and FAB scales.

**Outcome:** `rg "scale-|animate-pulse" src/web` shows none in chrome files (resume styles excluded), and no emoji renders in `/` or `/pdf` chrome.

### Phase 2: Distill sidebar (#26, about 2 hours)
- Preset on top and visually dominant. Sections, length and timeframe inside one collapsed "Fine-tune" group. Stats as one line. Delete `ComingSoonFeatures.svelte`. Theme picker stays.

**Outcome:** first view of the sidebar shows the preset control and a collapsed fine-tune group, 15+ checkboxes are not visible, and the theme picker still opens.

### Phase 3: Layout (#27, about 1 hour)
- Consistent sidebar rhythm, desktop header split into title and a controls row, labeled mobile reset, resume wrapper inline style replaced with a class (still white).

**Outcome:** header rows are not crammed at 1280px and 390px widths, and the resume card is still white in a dark theme.

### Phase 4: Typeset (#28, about 2 hours)
- One UI typeface, 3 to 4 step type scale, group labels as overlines. Resume typography untouched.

**Outcome:** UI chrome renders in the new font, the resume preview font is unchanged, and no visible layout shift on reload.

### Phase 5: Clarify and onboard (#29, about 2 hours)
- Header shows Joe's name, one intro line, preset framed as a question with a one-line description per preset, calm first-person toasts, human PDF error with email fallback on `/` and `/pdf`.

**Outcome:** no raw `error.message` is shown to the user, and every toast is a plain one-line sentence.

### Phase 6: Polish (#30, about 2 hours)
- Run `impeccable detect` on changed files, spot-check light, dark and high-contrast themes, confirm resume and PDF unchanged, re-run critique and record the score.

**Outcome:** re-critique score recorded here against the 18/40 baseline, and the resume preview DOM and PDF output match `master`.

## Acceptance criteria

1. All checkboxes in #25 to #29 are met (or listed here as deferred with a reason)
2. Theme picker works and every theme stays selectable
3. `.resume-container`, `.resume-viewer` styles and `input/templates/*.css` have no diff
4. `npm run lint` clean, `npm run build:web` passes, `npm run check:url-state` passes
5. Re-critique score recorded, spot-check of 4 to 5 themes done

## Local CI Mirror

No `.github/workflows`. Mirror is `npm run lint`, `GOTENBERG_URL=http://localhost:3000 npm run build:web`, and `npm run check:url-state` against a running dev server.

## Key files referenced

| File | Note |
|---|---|
| `PRODUCT.md` | Constraints and brand voice |
| `input/profiles/profile.json` | Name and email source |
| `scripts/url-state.check.js` | Regression check for preset and sliders |
| `docs/planning/17-verify-preset-sliders-kit3.md` | Format precedent, and the #20 boundary |

## Related

Epic [#31](https://github.com/crimsonsunset/resume-customizer/issues/31); children #25, #26, #27, #28, #29, #30; overlap [#20](https://github.com/crimsonsunset/resume-customizer/issues/20).
