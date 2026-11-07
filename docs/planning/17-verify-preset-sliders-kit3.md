# #17: Verify preset dropdown and sliders after the Kit 3 `$app/state` migration

## Flow state

| Field | Value |
|---|---|
| Gate | 2 (plan ready) |
| Ticket | [#17](https://github.com/crimsonsunset/resume-customizer/issues/17) |
| Branch | bugfix/17-verify-preset-sliders-kit3 |
| Repos | resume-customizer |
| Isolation | worktree |
| Worktrees | /Users/joe/Desktop/Repos/Personal/resume-customizer/.worktrees/17 |
| Base | origin/master @ 31a7f49 |
| QA mode | browser-qa (chrome-devtools via mux) |
| Gates | all |
| Updated | 2026-11-07 |

**Status:** planned, nothing implemented.
**Estimate:** about half a day.

## Overview

[#9](https://github.com/crimsonsunset/resume-customizer/pull/9) moved `+page.svelte` and `PresetSelector.svelte` from `$app/stores` (`$page.url`) to `$app/state` (`page.url`). Both files are still legacy Svelte (`export let`, `$:`, `on:`). Presets and sliders have felt broken since the Sync2Hire work landed, and #17 asks whether #9 is the cause.

This ticket is **verify first, fix only what fails**. It is NOT the architecture rework (see Out of scope).

## What the dig found

- All six `page.url` reads are inside event handlers, or inside `$:` bodies where `page.url` is read once as an argument. No `$:` block is written to depend on `page.url` by design. Whether Svelte 5 legacy mode tracks it anyway is **unproven** and is settled in the browser.
- `densityStore`, `timeframeStore` and `sectionVisibilityStore` are seeded from the URL once: `initializeDensity` in `onMount`, `initializeSections` on first load. A `goto` changes the URL but nothing writes the URL back into the stores. Back/forward is the likeliest failing check.
- The same gap existed under `$page.url` on Kit 2, so it may predate #9. The `329b4dc` A/B settles that.
- No test framework, no CI workflows, `npm test` is a stub. `playwright` is already a dependency.

## Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Verify in Chrome through `chrome-devtools`, A/B `master` against `329b4dc` | Checklist is behavioral and the issue asks for the A/B |
| 2 | Fix style is `afterNavigate` re-sync. No runes conversion | Smallest diff for the gap found. Runes rewrite and URL-as-source-of-truth belong to #20 |
| 3 | Add a small regression check whether or not a fix is needed | Chosen at Gate 1 |
| 4 | No fix is written unless a check fails | Verify-first ticket |

## Scope

**In**
- Run the five checks from #17 on `master` (and on `329b4dc` if anything fails)
- If back/forward (or any check) fails: one `afterNavigate` in `src/web/routes/+page.svelte` that re-runs `initializeSections`, `initializeDensity` (which seeds density and timeframe) from `page.url.searchParams` on `popstate`, guarded so `goto` from our own handlers cannot loop
- One regression script covering URL to state
- Docs: update this plan; amend `docs/system` only if behavior changes

**Out**
- Moving to runes or making the URL the single source of truth: [#20](https://github.com/crimsonsunset/resume-customizer/issues/20) (one filter model for presets and sliders)
- Preset `selected_indices` drift and the orphaned override in `one-page.json`: [#18](https://github.com/crimsonsunset/resume-customizer/issues/18), with stable ids in [#19](https://github.com/crimsonsunset/resume-customizer/issues/19). Not a Kit 3 problem
- Slider tier and data-inflation differences between `pre-s2h` and `master`: data, not reactivity

## Architecture

```
user action -> handler -> store.set + goto(url, replaceState)  [works today]
back/forward -> URL changes -> (nothing)                        [gap]
fix:         -> afterNavigate(type === 'popstate') -> stores re-seeded from page.url.searchParams
```

Loop guard: only act on `popstate`. Handler-driven `goto` calls are `goto` navigations, so they never re-enter.

## Files

| File | Change |
|---|---|
| `src/web/routes/+page.svelte` | Add `afterNavigate` re-sync. Only if a check fails |
| `src/web/lib/stores/url-state.js` | Possibly a small `syncStoresFromURL(url, availableSections)` helper. Only if needed to avoid duplicating init logic |
| `scripts/check-url-state.mjs` | Playwright check: preset, density, timeframe, sections, back/forward. Run with a `npm run check:url-state` script |
| `package.json` | `check:url-state` script |
| `docs/planning/17-verify-preset-sliders-kit3.md` | This doc |

## Phasing

### Phase 1: Verify on master (about 1 hour, Stage 4)
- User starts Vite from the worktree. Drive Chrome through the five checks, record URL and DOM evidence per check.
- If anything fails, repeat on `329b4dc` (detached worktree or checkout) to classify as Kit 3 regression or pre-existing.

**Outcome:** each of the five checks has a pass/fail with the URL and visible content recorded. A failure is labeled "Kit 3 regression" or "pre-existing".

### Phase 2: Fix, only if Phase 1 shows a failure (about 1 hour)
- Add `afterNavigate` re-sync in `+page.svelte` per Decision 2.

**Outcome:** the failed check passes on a re-run, and the other four still pass.

### Phase 3: Regression check (about 1 to 2 hours)
- Add `scripts/check-url-state.mjs` and `npm run check:url-state`. It covers the five checks and fails with a clear message when a store or URL does not follow.

**Outcome:** `npm run check:url-state` exits 0 against a running dev server and exits non-zero when the Phase 2 fix is reverted (when a fix was needed).

## Acceptance criteria

1. Preset dropdown switch updates content and URL
2. Density slider updates `density=` and bullets change (Comprehensive view)
3. Timeframe slider updates `timeframe=` and older roles drop (Comprehensive view)
4. Section toggles update `sections=`, content hides and restores
5. Back/forward restores each state
6. If A/B was needed, result recorded: Kit 3 regression or pre-existing
7. `npm run check:url-state` exists and passes
8. `npm run lint` and `npm run build:web` pass (Local CI Mirror; there is no CI workflow, so lint and build are the PR bar)

## Local CI Mirror

No `.github/workflows`. Mirror is `npm run lint` and `GOTENBERG_URL=http://localhost:3000 npm run build:web` in the worktree. `npm test` is a stub.

## Related

- Issue [#17](https://github.com/crimsonsunset/resume-customizer/issues/17), PR [#9](https://github.com/crimsonsunset/resume-customizer/pull/9)
- Follow-ups: [#18](https://github.com/crimsonsunset/resume-customizer/issues/18) (one-page preset), [#19](https://github.com/crimsonsunset/resume-customizer/issues/19) (data model), [#20](https://github.com/crimsonsunset/resume-customizer/issues/20) (filter model epic)
