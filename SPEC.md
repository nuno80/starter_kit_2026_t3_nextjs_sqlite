# SPEC: T3 Starter Kit Landing Page & Demo Architecture

## 1. Overview & Objectives

Transform the starter kit's default index page into an editorial, high-impact Landing Page inspired by the "Plaster & Terracotta" design system (originally from `landingPage.html`). The page showcases the speed, type-safety, and simplicity of the T3 Stack (Next.js 15 App Router, Drizzle ORM, SQLite local database, tRPC, Better-Auth, and Tailwind CSS v4).

## 2. Route Architecture

- **`/` (`src/app/page.tsx`)**: The marketing and architectural presentation landing page.
- **`/posts` (`src/app/posts/page.tsx`)**: The interactive Demo App page dedicated to testing real-time CRUD operations against the local `db.sqlite` database using tRPC and Drizzle ORM.

## 3. Design System & Styling ("Plaster & Terracotta Theme")

- **CSS Engine**: Native Tailwind CSS v4. No external configuration files (`tailwind.config.js`). All design tokens are registered inside the `@theme` block in `src/styles/globals.css`.
- **Color Palette (Light Mode Only)**:
  - `--plaster`: Cream/plaster background (`oklch(96.5% 0.014 82)`)
  - `--plaster-deep` / `--plaster-warm`: Tonality layering
  - `--ink`: Deep text/contrast (`oklch(24% 0.021 48)`)
  - `--terracotta` / `--terracotta-d` / `--terracotta-l`: Primary action and accent
  - `--olive` / `--brass`: Secondary accents and badges
  - `--line` / `--line-strong`: Thin editorial borders (1px solid)
- **Typography**:
  - Titles (Serif): **Fraunces** loaded via `next/font/google` in `src/app/layout.tsx`.
  - Body & UI (Sans): **Instrument Sans** loaded via `next/font/google`.
- **Animations (Ponytail Strategy - Zero Dependencies)**:
  - **No external animation libraries** (e.g., Framer Motion is strictly banned).
  - **Scroll Reveal**: Implemented via CSS animations and a lightweight native `IntersectionObserver` React hook toggling an `.in` utility class.
  - **Hero Slider**: Background drift/scale and slide crossfade managed via pure CSS keyframes and minimal React `useState`/`useEffect` timer state.

## 4. Global Navigation & Navbar Auth Widget

- **Navbar Layout**: Sticky/fixed top bar with logo ("T3 Starter"), navigation links (01-04), language globe button, and authentication widget.
- **Navbar Auth Widget**:
  - Replaces traditional separate login pages or static CTA buttons.
  - **Logged Out State**: Displays a "Accedi" button. Clicking triggers a clean Popover/Modal overlay rendering `auth-form.tsx` (Better-Auth email/password & social login).
  - **Logged In State**: Displays user avatar/initials badge. Clicking opens a dropdown/popover rendering `user-profile.tsx` with session details and logout functionality.
- **Client-Side i18n Dictionary**:
  - A lightweight React state/context system with JSON dictionaries (IT / EN).
  - Allows instant UI text switching via the globe selector without Next.js routing complexity (`/[locale]/`) or external i18n libraries.

## 5. Landing Page Structure (4 Numbered Sections)

### Hero Section

- **Visuals**: Fullscreen crossfading background images with continuous subtle zoom ("drift").
- **Copy**: High-impact editorial headline (e.g., *"Lo stack type-safe per chi non vuole perdere tempo"* / *"Zero config. Zero container. 100% Type-safe."*).
- **Footer Bar**: Quick facts bullet points with Lucide icons (e.g., "SQLite Locale Zero-Setup", "Better-Auth Integrato", "tRPC + Drizzle ORM", "Next.js 15 App Router").

### Section 01 / Architettura & Tech Stack

- **Focus**: Why local SQLite (`db.sqlite`) and end-to-end TypeScript change developer velocity.
- **Layout**: Asymmetrical editorial layout. Text lede on the left, visual grid / code structure preview on the right.
- **Core Capabilities List**: Grid of items detailing Zod validation, Better-Auth client/server integration, Turbopack Fast Refresh, and Tailwind v4 styling.

### Section 02 / Developer Experience

- **Focus**: Performance metrics and zero-friction workflow.
- **Layout**: Replaces the B&B location/map section with a "Project Explorer / Data Flow" breakdown and terminal command highlights (`pnpm dev`, `pnpm db:push`, `pnpm db:studio`).
- **Metrics**: Highlighting immediate execution (e.g., *"0s Docker Setup"*, *"12ms Local tRPC latency"*, *"1-command schema migrations"*).

### Section 03 / Filosofia & Vantaggi

- **Focus**: Editorial developer feedback and stack philosophy.
- **Layout**: Large quote block highlighting the simplicity of local-first database development over over-engineered cloud/container setups.
- **Score/Proof**: Compact metrics bar (e.g., stars, type-safety coverage, minimal footprint).

### Section 04 / Quick-Start & Checklist (Interactive Sandbox Bridge)

- **Layout**: 2-column interactive layout inspired by the original booking form.
- **Left Column (CLI Commands)**: Interactive terminal block displaying essential onboarding commands (`git clone`, `pnpm install`, `pnpm db:push`, `pnpm dev`) with copy-to-clipboard functionality.
- **Right Column (Sticky Checklist & Bridge)**: A sticky summary box acting as a setup checklist for the local SQLite environment, culminating in a prominent CTA button: *"Apri la Demo App (/posts)"* to launch the CRUD testing workspace.

## 6. Implementation Constraints (Ponytail Mode)

1. **YAGNI & Deletion**: Reuse existing auth and post components; do not rewrite business logic or add speculative abstractions.
2. **Minimal Footprint**: Keep CSS in `globals.css` using Tailwind v4 `@theme`. No custom CSS modules unless strictly necessary.
3. **No Code Without Approval**: This specification serves as the blueprint for future implementation steps.
