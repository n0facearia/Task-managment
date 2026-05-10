# Task Management App (Next.js + Express)

## Description

A Kanban-style task management application that allows users to create, organize, and track tasks across three columns: **Todo**, **Doing**, and **Done**. The app features user authentication, task categorization with color-coded labels, and drag-and-drop functionality.

---

## Tech Stack

- **Frontend**: Next.js 14.2.35 (App Router) with React
- **Backend**: Express.js REST API server
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS + DaisyUI + Custom CSS (`globals.css`)
- **Animations**: Framer Motion
- **Authentication**: JWT (jsonwebtoken@9.0.2) with Bearer token

---

## Architecture

### Frontend/Backend Separation

This project uses a **decoupled architecture**:

- **Frontend** (`nextjs-app/`): Next.js application handling UI rendering, client-side state management, and user interactions
- **Backend** (`server/`): Standalone Express server providing REST API endpoints for data persistence

The two runtimes communicate exclusively via HTTP API calls:

```
Next.js (port 3000) → Fetch API → Express (port 3001) → SQLite
```

### Data Flow

```
User Action → React State → API Request → Express Server → SQLite → Response → React State Update → UI Re-render
```

### State Management

- **React Context** (`TaskContext.tsx`): Centralized task state management
- **Local Component State**: UI-specific state (editing modes, panel visibility)
- **Optimistic Updates**: Tasks show immediately with temporary IDs, then reconcile with server response

### Authentication

- **JWT Tokens**: Stateless Bearer tokens (24h expiry) stored in `localStorage`
- **Token Verification**: `page.tsx` validates token on mount via `fetchTasks()` call
- **Auto-Logout**: 401 responses trigger token cleanup and redirect to login
- **User Isolation**: All task queries scoped by `user_id` from token payload

---

## Development History

### Origin
This project started as a **vanilla HTML/CSS/JavaScript** application with all logic contained in `script.js` using direct DOM manipulation (`document.querySelector`, `innerHTML`).

### Migration Process
The app was migrated **step-by-step** into Next.js:

1. **Initial State**: Hybrid setup with legacy JS coexisting with partial Next.js structure
2. **Component Creation**: Replaced `script.js` logic with React components (`TaskContainer`, `TaskItem`, `AuthSplash`, etc.)
3. **State Migration**: Moved from manual DOM updates to React state-driven rendering
4. **API Layer**: Created `api.ts` to communicate with Express backend
5. **Debugging Phases**:
   - Create task failure (root cause: missing input field for title state)
   - Authentication flow visibility issues
   - Custom cursor performance issues (removed)
   - Missing `"use client"` directives in client components
   - SQL syntax investigation (parameters were already correct)
6. **UI Framework Migration** (2026-05):
   - Integrated **Tailwind CSS + DaisyUI** for utility-first styling
   - Migrated animations to **Framer Motion** (`motion.div`, `motion.button`)
   - Added `@tailwind` directives to `globals.css`
7. **Kanban Board Layout Fix** (2026-05):
   - Fixed columns being cut off: changed `body` from `overflow-x: hidden` to `overflow-x: auto`
   - Fixed board width: changed `.kanban-board` from `max-width: 100%` to `min-width: 872px`
   - Board now displays all 3 columns (Todo, Doing, Done) centered and fully visible

8. **Interactive UI Enhancements** (2026-05):
     - Added `HalftoneBackground.tsx`: Canvas-based interactive dot grid background
     - Optimized canvas rendering with `requestAnimationFrame` + `needsRedraw` flag (idle = 0 CPU)
     - Halftone specs: 12×14 dot spacing, 150px mouse radius, dots grow 1.5→4px, opacity 0.04→0.15
     - Column hover float: `y: -4px`, shadow overlay, `z-index` stacking to overlap header
     - Task hover float: `scale: 1.02`, `y: -2px`, shadow, fast transition
     - Category sidebar buttons: same float effect with `duration: 0.15s` quick response

9. **JWT Authentication System** (2026-05):
     - Replaced plaintext username auth with JWT Bearer tokens (`jsonwebtoken@9.0.2`)
     - Added `/auth/signup` and `/auth/login` endpoints, removed `GET /users` and `POST /users`
     - `authenticateToken` middleware on all `/tasks` routes — user data isolation by `user_id`
     - Auto-migration: `user_id` column added to `tasks` table with backfill from `username`
     - Frontend `api.ts` handles token storage, 401 auto-logout, and Bearer headers on every request
     - `TaskItem` ref error fixed: wrapped with `motion.div` in `TaskContainer` for AnimatePresence compatibility

10. **UI Refinements** (2026-05):
      - Collapsible category sidebar: slides off-screen leaving 24px tab, smooth `0.3s` transition
      - Removed `username` from Task interface — identity now derived entirely from JWT token
      - Build passes cleanly with zero warnings

11. **Logo Component with Hover Tick Animation** (2026-05):
      - Extracted blue box from AuthSplash.tsx into reusable `Logo.tsx` component
      - Placed Logo in AuthSplash.tsx and Header.tsx
      - Hover animation: box scales up and a thick black checkmark draws in via Framer Motion `pathLength` 0→1

12. **"Help" Button Renamed to "Tutorial"** (2026-05):
      - Label text changed from "Help" to "Tutorial" in Header.tsx
      - No logic changes — click handler, styling, and tutorial functionality preserved

13. **Halftone Click Ripple Effect** (2026-05):
      - Added click ripple wave to HalftoneBackground.tsx
      - Ripple travels outward at ~250px/s, dots swell and brighten as the ring passes
      - Multiple simultaneous ripples supported via array storage
      - Ripples expire when radius exceeds canvas diagonal
      - Integrated into existing `requestAnimationFrame` loop

14. **Custom Cursor Attempt** (2026-05):
      - CustomCursor.tsx was briefly created (white circle cursor + click ripple ring) then removed
      - `cursor: none` was added to `globals.css` then reverted
      - Default system cursor restored — no custom cursor remains

### Approach
The migration followed an **incremental strategy**:
- Feature-by-feature replacement (not full rewrite)
- Minimal breaking changes during transition
- Isolated testing with minimal reproduction cases
- State-first UI design (React replaces DOM manipulation)

---

## Key Features

### Task Management
- ✅ **Create Tasks** - Inline creation with auto-edit mode for title
- ✅ **Edit Tasks** - Update title, description, and category (inline or detail panel)
- ✅ **Delete Tasks** - Remove tasks with confirmation
- ✅ **Drag and Drop** - Move tasks between Todo, Doing, and Done columns
- ✅ **Task Limit** - Maximum 20 active tasks enforced

### Organization
- ✅ **Categories** - 6 color-coded categories (Work, Personal, Health, Learning, Finance, Other)
- ✅ **Category Filtering** - Sidebar to filter tasks by category
- ✅ **Focus Views** - Double-click columns or categories for expanded view

### User System
- ✅ **Authentication** - JWT signup and login with token-based sessions (24h expiry)
- ✅ **Session Persistence** - Token stored in `localStorage`, verified on page mount
- ✅ **User-Specific Tasks** - Each user sees only their own tasks (isolated by `user_id`)
- ✅ **Auto-Logout** - Expired/invalid tokens trigger automatic logout and redirect

### UI Features
- ✅ **Interactive Tutorial** - 10-step guided walkthrough for new users (auto-starts after signup, restartable from Tutorial button)
- ✅ **Onboarding** - Welcome task and suggested tasks after signup
- ✅ **Help System** - Restart tutorial anytime from Tutorial button in header
- ✅ **Dynamic Theme** - App theme color changes to match selected category
- ✅ **Toast Notifications** - Temporary messages for user feedback
- ✅ **Loading States** - Visual feedback during API operations
- ✅ **Interactive Halftone Background** - Canvas-based dot grid that reacts to mouse movement (idle = 0 CPU overhead)
- ✅ **Hover Float Effects** - Kanban columns, task cards, and category sidebar buttons lift with subtle scale and drop shadow on hover
- ✅ **Collapsible Sidebar** - Category sidebar slides off-screen leaving a 24px toggle tab (☰/◂)
- ✅ **Logo with Hover Animation** - Reusable Logo component with scale-up and animated thick black checkmark drawn via Framer Motion on hover
- ✅ **Halftone Click Ripple** - Canvas dot grid emits a ripple wave on click — dots swell and brighten as the ring passes through them

---

## Project Structure

```
task-creation-app/
├── nextjs-app/               # Frontend (Next.js)
│   ├── app/
│   │   ├── components/       # React components
│   │   │   ├── AuthSplash.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── TaskContainer.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TaskDetailPanel.tsx
│   │   │   ├── DragDropHandler.tsx
│   │   │   ├── CategoryFocusView.tsx
│   │   │   ├── ColumnFocusView.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Toast.tsx
│   │   │   ├── HalftoneBackground.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── TutorialOverlay.tsx
│   │   │   ├── TutorialTooltip.tsx
│   │   │   ├── TutorialAnimation.tsx
│   │   │   └── HandCursorIcon.tsx
│   │   ├── context/
│   │   │   ├── TaskContext.tsx      # Task state management
│   │   │   └── TutorialContext.tsx  # Tutorial state management
│   │   ├── hooks/
│   │   │   └── useTutorialActionDetector.ts  # Tutorial action detection
│   │   ├── data/
│   │   │   └── tutorialSteps.ts     # Tutorial step definitions
│   │   ├── lib/
│   │   │   └── api.ts               # API layer
│   │   ├── globals.css              # Styles
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── package.json
├── server/                   # Backend (Express)
│   ├── index.js              # Express server + SQLite setup
│   └── package.json
├── README.md
├── AGENT_CONTEXT.md          # AI/engineer handover document
└── Prompts used.md           # Development history
```

---

## Getting Started

### Prerequisites
- Node.js installed
- npm or yarn

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm install
   node index.js
   ```
   Server runs at `http://localhost:3001`

2. **Start the frontend:**
   ```bash
   cd nextjs-app
   npm install
   npm run dev
   ```
   App available at `http://localhost:3000`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/auth/signup` | Create new user, returns JWT token |
| POST | `/auth/login` | Authenticate user, returns JWT token |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/tasks` | Fetch tasks for authenticated user |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task (must belong to user) |
| DELETE | `/tasks/:id` | Delete task (must belong to user) |

---

## Stability Note

The application has been tested and stabilized through multiple debugging cycles. The Next.js frontend builds successfully, and the Express backend handles all CRUD operations.

**Important**: The backend runs as a **separate process** from the frontend. Both must be running for full functionality.

**Known Limitations**:
- Passwords are stored in plaintext (no hashing implemented) — bcrypt planned
- JWT tokens stored in `localStorage` (vulnerable to XSS) — httpOnly cookies planned
- No refresh token mechanism (24h token expiry requires re-login)
- No CORS origin restriction (currently allows all origins)
- No advanced security hardening for production use

---

## Documentation

For detailed development history and AI agent context, see:
- **`Prompts used.md`** - Step-by-step migration and debugging history
- **`AGENT_CONTEXT.md`** - Handover document for developers/agents

---

## Last Updated
2026-05-10 (Logo component, Tutorial rename, halftone click ripple, category-aware quick-create, dynamic color borders, JWT auth, collapsible sidebar, AnimatePresence fix, tutorial system, halftone background, dynamic theme, animated eye icons, Enter-chained focus flow, 16-step tutorial)
