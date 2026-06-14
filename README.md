# 🚀 CareerScope: Interactive CS Career Matcher & Talent Hub

CareerScope is a premium Next.js web application designed to help Computer Science students explore specialized career paths, simulate day-to-day work scenarios using an AI career simulator, and connect with top employers via a radar-style talent matching pool.

---

## 🌟 Core Features

### 1. Interactive Career Field Map (Multi-Level SVG Visualization)

An advanced SVG-based visualization engine displaying tech fields, roles, and skills:

- **Level 0 (Global Fields)**: Explore main CS fields (e.g., Software Engineering, Data & AI). High-fit fields ($\ge 90\%$ match) display a dashed green pulsing ring.
- **Level 1 (Specialized Roles & Skills)**: Drill down into a specific field:
  - **Semantic Label Zooming**: Sub-roles and bridge skills fade in dynamically at $\ge 1.6\times$ zoom.
  - **Force-Directed Collision Resolution**: Runs a relaxation loop to push overlapping nodes apart, ensuring clean layouts.
  - **Interactive Focus Highlight**: Hovering/clicking a node dims unrelated elements (opacity `0.18`) and highlights connector paths.
  - **Owned Skills**: Automatically highlights skills the user has acquired (from profile or courses) with a solid high-contrast green diamond/rectangle and vibrant border.
  - **Floating Tooltips**: Hovering fields, position dots, or skills reveals percentage matches, owned badges, and role requirements in glassmorphic cards.

### 2. Resume Upload & Personality Quiz

- **Resume Upload & Extraction**: Upload PDF/image resumes before the quiz to automatically extract profile details (skills, projects, experience) using OCR and parser.
- **30-Question Assessment**: Evaluates the user's preferences, yielding detailed DISC-RIASEC behavioral scores.
- **AI Archetype Summaries**: Generates high-fidelity summaries describing why the user is a strong fit for their top matching CS roles.
- **Comprehensive Data Export**: Commits the user's completed results (DISC scores, raw answers, AI paragraphs, university, and course data) directly into a standardized `profile.json` export and Firestore.

### 3. Student Profile & Skill Management

- **Responsive Profile Views**: Manage education, manual/imported GitHub projects, and skills.
- **Dual-State Skill Section**:
  - _Saved State_: Renders a vertical stack of the user's top 5 skills, complete with proficiency level progress bars.
  - _Edit State_: Displays skills as a single horizontal row of removable chips. Overflow is hidden, and an inline "See More" toggle button expands the list to wrap naturally.
- **Smart Modification Tracking**: The "Save Changes" footer bar appears dynamically only when unsaved profile changes are detected, displaying a "Saved!" alert upon completion.

### 4. Chat-Integrated AI Career Simulator

- **Unified Conversation Thread**: Access chat logs and simulations directly in the sidebar.
- **Experience the Job 🚀**: Select this chip to start a multi-step interactive simulation. The user encounters real-world role scenarios (e.g., system outages, model training trade-offs), chooses options, and receives immediate AI feedback.

### 5. Talent Pool Map (Employer Portal)

- **Blueprint Grid Pattern**: Designed with a technical blueprint aesthetic.
- **Concentric Radar Rings**: Places candidate nodes radially based on their match percentages, with concentric helper rings (`90%`, `80%`, `70%`, `60%`).
- **Central JD Node**: Styled as layered concentric green diamonds.
- **Focus Highlighting**: Hovering/selecting a candidate path dynamically highlights connection lines and dims other candidates.
- **Candidate Profile Popups**: Floating modal showing Linkedin/Github profiles and DISC-RIASEC personality badges.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Authentication**: Firebase Authentication
- **Database/Storage**: Cloud Firestore & File-system serialization (`api/save-profile`)
- **Styling**: Tailwind CSS & custom styled-components / inline CSS styles
- **Icons**: Lucide React

---

## 📂 Codebase Directory Structure

```markdown
├── app/
│ ├── api/save-profile/ # Route to commit profile data to JSON
│ ├── onboarding/ # University, Major, and Course onboarding flow (with Resume Upload)
│ ├── quiz/ # 30-question DISC-RIASEC quiz screen
│ ├── results/ # Quiz result analysis and career matches
│ ├── profile/ # Student dashboard with editable profile data
│ ├── map/ # Multi-level SVG career field map & chat simulator
│ ├── talent/ # Employer dashboard with Radar-style Talent Pool Map
│ ├── globals.css # Core color tokens and dark-mode CSS styles
│ └── layout.tsx # Root layout and theme shell wrapper
│
├── components/
│ ├── employer/
│ │ ├── TalentPoolMap.tsx # Radar mapping of matched candidates
│ │ └── ShortlistPanel.tsx # Side-by-side matching candidate sidebar
│ ├── map/
│ │ ├── FieldVectorMap.tsx # Compact vector map component
│ │ └── AnimatedBackground.tsx
│ ├── home/
│ │ └── DotField.tsx # Landing page interactive backdrop grid
│ └── ui/
│ └── Nav.tsx # Global site header navbar
│
└── lib/
├── scoring.ts # DISC-RIASEC math, matching rules, and AI descriptions
├── jobScenarios.ts # AI Career Simulator scenarios
├── jobData.ts # Career profiles, taxonomy, and match formulas
├── context.tsx # Global state context (Profile and Quiz states)
└── mockCandidates.ts # Matched candidates generator for Employer page
```

---

## 🚀 Getting Started

### 1. Installation

Install dependencies:

```bash
npm install
```

### 2. Run Locally

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Production Build

Build the project for production:

```bash
npm run build
```

---

## 📝 Developer Guidelines

1.  **Data Updates**: Add or modify careers, skills, or taxonomy in `lib/jobData.ts` and `lib/careerTaxonomy.ts`.
2.  **Layout Scaling**: When modifying the SVG map, check `app/map/page.tsx` zoom compensations to ensure labels and strokes scale appropriately.
3.  **UI Consistency**: Ensure all cards use standard CSS custom variables for surface borders (`var(--border)`) and backgrounds (`var(--surface)`).
