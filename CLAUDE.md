# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pro Performance Coach (PPC) — a personal-training coaching platform built as a set of **static, self-contained HTML files** (vanilla JS, no framework, no bundler). Firebase (Firestore + Auth) is the only backend, loaded via CDN `<script>` tags directly in each HTML file (`firebase-app-compat.js`, `firebase-firestore-compat.js`, `firebase-auth-compat.js`). There is no build step — files are edited directly and deployed as-is.

Deployment is GitHub Pages, served from this repo at `https://paulcifuentes91-lab.github.io/Coaching-app-ppc/` (see `BASE_URL` in `panel-coach-ppc.html`). Pushing to `main` is effectively "deploying".

## The two halves of the app

1. **Coach panel — `panel-coach-ppc.html`** (single ~4500-line file, the main app). Paul (the coach) uses this to manage every athlete: training days/exercises, nutrition/diet generation, check-ins, adherence tracking, mesociclo (training block) renewal, and a home dashboard (prospects, activity, alerts). Key in-file data structures near the top of the `<script>`:
   - `BD_EJ` — the exercise database (name, muscle group, movement pattern, equipment, tier, aliases) used to search/autocomplete exercises and generate circuits.
   - `ATLETAS` — array of all athlete records (training days, nutrition blocks, supplements, history) rendered in the panel.
   - `FB_ID` — maps a short panel id (e.g. `"nicole"`) to the athlete's real Firestore document id / published app slug (e.g. `"nicole-jerez-julio-2026"`).
   - `APP_URL` — maps the same panel id to the athlete's published plan filename (e.g. `"plan-nicole-jerez"`), used to build WhatsApp links etc.
   - `FB_CONFIG` — the Firebase Web SDK config (public API key, safe to be client-side).
   - Auth: coach must sign in via Firebase Auth (email/password, `authEntrar`/`authSalir`) before any `fbGuardar*` (save) functions are enabled — read-only browsing works logged out.

2. **Athlete plans — `plan-{athlete-id}.html`** (one file per athlete, e.g. `plan-nicole-jerez.html`, `plan-paul-cifuentes.html`). Each is a standalone PWA-style dashboard the athlete opens on their phone: training day view, nutrition/meal windows, progress photos/measurements, adherence charts. Each file hardcodes its own `ATHLETE_ID` constant that points at the Firestore doc under `athletes/{ATHLETE_ID}`. All plan files are generated from the same base template and are structurally near-identical — logic changes usually need to be replicated across all of them (see workflow below).
   - `plan-template-vacío.html` — the canonical empty template used for new athletes (training section stripped out, `ATHLETE_ID` set to the placeholder `'CAMBIAR-ESTE-ID'`).
   - `plan-*-VIEJO.html` / `plan-*-ARCHIVADO.html` — retired/superseded versions kept for reference, not linked from anywhere live.

Other standalone pages: `anamnesis.html` / `anamnesis-form.html` (intake questionnaire), `pagina-precios.html` / `precios.html` (pricing pages), `panel-admin-firebase.html` (admin/Firebase inspection panel).

## Firestore data shape

```
athletes/{ATHLETE_ID}
├── basicInfo, currentPlan
├── improvements/            # per-athlete customizations: menstrualCycle, timezone, ageAdjustment, specialization
├── planHistory, pendingProposals, notifications, support
├── sesiones/{sesion-N}      # locked/completed session tracking (see bloqueo-sesiones.js)
└── photos/                  # progress photo uploads
```
Athlete records also carry billing/plan-type fields (`plan`, `price`, `expiryDate`, `amountDue`, `paymentStatus`, `type: 'presencial'|'online'`) — see `init-athletes.js` for the shape.

## Athlete lifecycle scripts

These Python scripts edit `panel-coach-ppc.html` in place by locating a `const NAME=` marker and replacing the balanced `[...]`/`{...}` block that follows (see `encontrar_cierre`/`reemplazar_estructura` in both scripts) — they are the supported way to add/remove athletes, **don't hand-edit `ATLETAS`/`FB_ID`/`APP_URL` unless replicating what these scripts do**:

- `python3 crear_atleta.py ~/Downloads/plan-nombre.json` — onboard a new athlete. Requires a plan already exported from the panel (Entrenamiento tab → "Exportar plan") as the JSON input. Prompts for name/category/height/WhatsApp, generates the panel id and Firestore id, appends to `ATLETAS`/`FB_ID`/`APP_URL`, and copies `plan-template-vacío.html` → `plan-{id}.html` with `ATHLETE_ID` filled in. Prints the git commands at the end; **it never runs git itself**.
- `python3 borrar_atleta.py <panel-id>` (run with no args to list valid ids) — removes an athlete from `ATLETAS`/`FB_ID`/`APP_URL` after a typed `SI` confirmation, and renames `plan-{id}.html` → `plan-{id}-ARCHIVADO.html` (never deletes it, never touches Firestore data). Also prints git commands without running them.

Node/Firebase-Admin one-off scripts (require `firebase-key.json`, a gitignored service-account key — ask the user for it if missing, never fetch or invent one):
- `init-athletes.js` — bulk-creates athlete docs in Firestore from a hardcoded array.
- `limpiar-firebase.js` — deletes malformed athlete docs (missing `nombre`/`plan`).
- `generar-planes-online.js` / `resetear-planes-estructura.js` — one-off codegen that derived the current per-athlete plan files / template from `plan-maria-jose-amezaga.html` via string replacement. Not part of a repeatable pipeline; read before reusing, since paths/names are hardcoded per run.

## Working in this codebase

- **No build/lint/test tooling exists** (`package.json` only lists `firebase-admin` as a dependency, for the Node scripts above). Verify changes by opening the relevant HTML file directly in a browser.
- Files are large single-file apps with inline `<style>` and `<script>` — search with `grep -n "function name"` rather than trying to read entire files (`panel-coach-ppc.html` alone is ~4500 lines / 600KB).
- Because every `plan-*.html` was forked from the same template, a fix to shared logic (rendering, nutrition calc, adherence, etc.) typically needs to be **applied to every plan file**, not just one — check whether an edit is athlete-specific data or shared behavior before deciding scope.
- `.gitignore` excludes `firebase-key.json`, `node_modules/`, `package-lock.json`, `*.VIEJO.html`, `create-*.py`, `generar-*.py`, `init-*.js`, `preview-*.html`, and `panel-admin-v1.html` — several of these (the `create-*`/`generar-*`/`init-*` scripts) exist locally but are intentionally not version-controlled.
- Commit messages and all in-app user-facing text are in Spanish (Chile) — match that convention.
- `FB_CONFIG`'s `apiKey` is a public Firebase Web SDK key (safe to be client-side, access is controlled by Firestore security rules, not secrecy) — don't confuse it with `firebase-key.json`, which is a real service-account credential and must stay untracked.
