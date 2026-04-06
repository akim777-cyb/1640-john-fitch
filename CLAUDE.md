# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive real estate case study visualization for a Columbia GSAPP course (Leveraging Data and AI for Real Estate Development, Spring 2026). The deliverable is a single-page React component showing an aerial image of a commercial property with 5 clickable hotspot markers that reveal value-add strategy details in a slide-out side panel.

**Subject Property:** 1640 John Fitch Boulevard, South Windsor, CT — 257,000 SF Class B warehouse on 12 acres, acquired by Snowball Developments in January 2025 for $17.3M.

**Framing:** Investor-relations style, as if Snowball commissioned this for LPs to demonstrate asset management plan execution.

**Disclaimer requirement:** All financial figures below the acquisition price are illustrative and based on publicly available market data. This must be disclosed in the footer.

## Build & Dev Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (default: http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

## Tech Stack

- React + Vite
- Tailwind CSS (utility classes only, no separate CSS files unless necessary)
- Framer Motion (side panel slide transitions)

## Architecture

Single-page app, minimal file structure. No routing, no auth, no backend.

- Aerial image (`aerial.jpg` in project root or public folder) displayed full-width as hero
- 5 circular hotspot markers positioned with **percentage-based coordinates** over the image (responsive)
- Hotspots: hover shows glow + tooltip with name; click opens ~400px side panel from right
- Side panel: title, summary, metrics; close button; smooth slide transitions; clicking outside dismisses; clicking another hotspot updates contents in-place

## Design Specs

- **Palette:** Neutral/professional — charcoal, cream, one accent color that reads "serious real estate"
- **Typography:** Clean sans-serif (Inter or similar)
- **Header:** Property name, address, one-line tagline
- **Footer:** Illustrative figures disclaimer
- **Aesthetic goal:** Institutional investor deck quality

## Working Conventions

- Build incrementally: page structure first, then hotspots, then side panel, then transitions. Show result after each step.
- Keep code in as few files as possible — this is a one-page component.
- Hotspot content and coordinates provided by the user are authoritative — do not paraphrase or rewrite financial figures.
- Changes should be minimal and scoped — do not refactor unrelated code when making a change.
