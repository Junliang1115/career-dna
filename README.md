# CareerScope

CareerScope is a Next.js app for exploring CS career paths with an interactive map, quiz, and job matching flow.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Code Map

### App routes

- [app/page.tsx](app/page.tsx) - Landing page entry.
- [app/layout.tsx](app/layout.tsx) - Root layout, fonts, providers, and navigation shell.
- [app/globals.css](app/globals.css) - Global CSS variables and base theme styles.
- [app/onboarding/page.tsx](app/onboarding/page.tsx) - University, major, and course selection flow.
- [app/quiz/page.tsx](app/quiz/page.tsx) - MBTI-style career quiz screen.
- [app/results/page.tsx](app/results/page.tsx) - Result summary and career type reveal.
- [app/profile/page.tsx](app/profile/page.tsx) - Saved user profile and selections.
- [app/map/page.tsx](app/map/page.tsx) - Main career map with drill-down levels, skill nodes, and related-job links.

### Components

- [components/ui/Nav.tsx](components/ui/Nav.tsx) - Top navigation used across the app.
- [components/map/FieldVectorMap.tsx](components/map/FieldVectorMap.tsx) - Compact field graph used for career exploration and job cards.
- [components/map/AnimatedBackground.tsx](components/map/AnimatedBackground.tsx) - Decorative animated background layer.

### Data and logic

- [lib/context.tsx](lib/context.tsx) - Global app state provider for profile and quiz data.
- [lib/types.ts](lib/types.ts) - Shared TypeScript types for the app.
- [lib/questions.ts](lib/questions.ts) - Quiz question bank and answer options.
- [lib/scoring.ts](lib/scoring.ts) - Quiz scoring and career type calculation.
- [lib/jobData.ts](lib/jobData.ts) - Curated job dataset, job metadata, and type matching helpers.
- [lib/fieldGraph.ts](lib/fieldGraph.ts) - Career field nodes, edges, and type-to-field mapping.
- [lib/universities.ts](lib/universities.ts) - University and course catalog data.

### Config

- [next.config.ts](next.config.ts) - Next.js configuration.
- [postcss.config.mjs](postcss.config.mjs) - PostCSS setup for Tailwind.
- [eslint.config.mjs](eslint.config.mjs) - ESLint rules.
- [tsconfig.json](tsconfig.json) - TypeScript configuration.

## Suggested edit order

1. Update data in `lib/` first.
2. Adjust page flow in `app/`.
3. Refine shared UI in `components/`.
4. Run `npm run build` before demoing.

## Notes

- The project is designed to stay explainable and demo-friendly.
- If you add a new route or major feature, add a one-line entry here so the file map stays current.
