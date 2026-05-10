# AGENT_CONTEXT.md - AI/Engineer Handover Document

## 1. Project Overview

This is a **task management system** (Kanban-style) that allows users to:
- Create, edit, and delete tasks
- Organize tasks across three columns: Todo, Doing, Done
- Categorize tasks with color-coded labels
- Authenticate via login/signup flow

**Current Technology Stack:**
- **Frontend**: Next.js 14.2.35 (App Router)
- **Backend**: Express.js server
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS + DaisyUI + Custom CSS (`globals.css`)
- **Animations**: Framer Motion
- **Authentication**: JWT (jsonwebtoken@9.0.2) with Bearer token
- **Runtime**: Frontend and backend are **separate runtimes**
  - Frontend: `nextjs-app/` (runs on port 3000)
  - Backend: `server/` (runs on port 3001)

---

## 2. Current Architecture (IMPORTANT)

### Frontend (Next.js)
- **React-based UI** with functional components and hooks
- **State-driven rendering** - NO DOM manipulation (`document.querySelector`, `innerHTML` forbidden)
- **Component-based architecture** under `nextjs-app/app/components/`
- **API communication** via `nextjs-app/app/lib/api.ts` to Express backend
- **Client components** MUST have `"use client"` directive as first line

**Key Frontend Files:**
| File | Purpose |
|------|---------|
| `page.tsx` | Entry point, auth routing, tutorial trigger |
| `context/TaskContext.tsx` | Global task state management |
| `context/TutorialContext.tsx` | Tutorial state management |
| `components/TaskContainer.tsx` | Main kanban board container |
| `components/TaskItem.tsx` | Individual task card |
| `components/AuthSplash.tsx` | Login/signup UI + suggested tasks |
| `components/TutorialOverlay.tsx` | Tutorial overlay with spotlight and tooltip |
| `components/TutorialTooltip.tsx` | Tutorial instruction card |
| `components/TutorialAnimation.tsx` | Animated demos (pulse, drag, click, type) |
| `components/Header.tsx` | App header with help button to restart tutorial |
| `hooks/useTutorialActionDetector.ts` | Detects user actions to advance tutorial steps |
| `data/tutorialSteps.ts` | Tutorial step definitions (10 steps) |
| `lib/api.ts` | API wrapper functions |

### Backend (Express)
- **REST API server** with SQLite persistence
- **No UI responsibilities** - serves only JSON responses
- **Endpoints:**
  - `POST /auth/signup` - Create new user, returns JWT token
  - `POST /auth/login` - Authenticate user, returns JWT token
  - `GET /tasks` - Fetch tasks for authenticated user (requires Bearer token)
  - `POST /tasks` - Create new task (requires Bearer token)
  - `PUT /tasks/:id` - Update task (requires Bearer token, must belong to user)
  - `DELETE /tasks/:id` - Delete task (requires Bearer token, must belong to user)

**Key Backend File:**
- `server/index.js` - Single-file Express server with SQLite setup

---

## 3. Data Flow

```
User Action (click, type, drag)
    ↓
React State Update (useState/useContext)
    ↓
API Request (api.ts → fetch)
    ↓
Express Server (server/index.js)
    ↓
SQLite Database (better-sqlite3)
    ↓
JSON Response
    ↓
React State Update (setTasks, etc.)
    ↓
UI Re-render (React)
```

---

## 4. Key Features (Current State)

### Implemented Features:
- ✅ **Task Creation** - Inline creation with auto-edit mode for title
- ✅ **Task Rendering** - Kanban columns (Todo, Doing, Done)
- ✅ **Task Editing** - Title, description, category via detail panel or inline
- ✅ **Task Deletion** - Cross button on each task
- ✅ **Category System** - 6 categories (Work, Personal, Health, Learning, Finance, Other) with color dots
- ✅ **Authentication Flow** - JWT signup and login with token-based sessions (24h expiry)
- ✅ **Auto-Logout** - Expired/invalid tokens trigger automatic logout and redirect
- ✅ **Drag and Drop** - Move tasks between columns
- ✅ **Sidebar** - Category filter with visibility toggle and collapsible state (slides off-screen leaving 24px toggle tab)
- ✅ **Focus Views** - Double-click column/category for expanded view
- ✅ **Toast Notifications** - Temporary messages for user feedback
- ✅ **Interactive Tutorial** - 10-step guided walkthrough for new users (auto-starts after signup, restartable from Help button)
- ✅ **Onboarding Suggestions** - Suggested tasks shown after signup before entering board
- ✅ **Dynamic Theme** - App theme color changes to match selected category, reverts to default blue on "All"
- ✅ **Interactive Halftone Background** - Canvas-based dot grid reacting to mouse movement (idle = 0 CPU overhead)
- ✅ **Hover Float Effects** - Kanban columns, task cards, and category sidebar buttons lift with scale/shadow on hover

### NOT Implemented (do not assume existence):
- ❌ Task search/filtering by title
- ❌ Task due dates
- ❌ File attachments
- ❌ Collaborative features
- ❌ Advanced user settings

---

## 5. Migration History Summary

### Evolution:
1. **Started as vanilla HTML/CSS/JS application**
   - Single `index.html` with embedded/script.js logic
   - All UI logic in `script.js` using DOM manipulation
   - Direct `document.querySelector` and `innerHTML` usage

2. **Hybrid state with partial Next.js migration**
   - Next.js App Router structure created
   - Some components migrated, others still relying on legacy patterns

3. **Incremental replacement of script.js logic**
   - Authentication migrated to `AuthSplash.tsx`
   - Task operations moved to React state + Context
   - API layer created (`api.ts`) to communicate with Express backend

4. **Debugging phases encountered:**
   - **Create task failure**: Root cause was missing input field for title state
   - **Auth flow issues**: Required proper conditional rendering
   - **Custom cursor removed**: Performance issues led to removal
   - **Missing "use client"**: `TaskDetailPanel.tsx` and `Sidebar.tsx` broke interactivity
    - **SQL syntax concerns**: Investigated missing commas in `.run()` calls (were already correct)

5. **UI Framework Migration** (2026-05):
   - Integrated **Tailwind CSS + DaisyUI** (`tailwind.config.js`, `postcss.config.js`)
   - Added `@tailwind base/components/utilities` directives to `globals.css`
   - Migrated from previous motion library to **Framer Motion** across components
   - Components using `motion.div`/`motion.button`: `AuthSplash`, `TaskItem`, `TaskContainer`
   - Animation properties: `whileHover`, `whileTap`, `initial`, `animate`

6. **Kanban Board Layout Fix** (2026-05):
   - **Problem**: 3 columns cut off mid-Doing column, appearing clipped inside a narrow frame
   - **Root cause 1**: `body { overflow-x: hidden }` clipped horizontal overflow before the board's scrollbar could activate
   - **Root cause 2**: `.kanban-board` had `max-width: 100%` which constrained the board narrower than the total column width (3 × 280px + 2 × 16px gaps = 872px)
   - **Fix 1**: Changed `body` from `overflow-x: hidden` to `overflow-x: auto`
   - **Fix 2**: Changed `.kanban-board` from `max-width: 100%` to `min-width: 872px`
   - **Result**: All 3 columns now display centered and fully visible with horizontal scrolling on narrow viewports

7. **Interactive UI Enhancements** (2026-05):
    - Added `HalftoneBackground.tsx`: Canvas-based interactive dot grid background
    - Optimized canvas rendering with `requestAnimationFrame` + `needsRedraw` flag (idle = 0 CPU)
    - Halftone specs: 12×14 dot spacing, 150px mouse radius, dots grow 1.5→4px, opacity 0.04→0.15
    - Added hover float effects for columns, tasks, and category buttons

8. **JWT Authentication System** (2026-05):
    - Replaced plaintext username auth with JWT Bearer tokens (`jsonwebtoken@9.0.2`)
    - Added `/auth/signup` and `/auth/login` endpoints, removed old user endpoints
    - `authenticateToken` middleware on all `/tasks` routes — user data isolation by `user_id`
    - Frontend `api.ts` handles token storage, 401 auto-logout, and Bearer headers

9. **UI Refinements** (2026-05):
    - Collapsible category sidebar with slide animation and 24px toggle tab
    - Removed `username` from Task interface — identity derived from JWT token
    - `TaskItem` ref error fixed: wrapped with `motion.div` in `TaskContainer` for AnimatePresence

10. **Interactive Tutorial System** (2026-05):
    - 10-step guided walkthrough auto-starting after signup
    - Tutorial state managed via React Context + `localStorage` persistence
    - Action detection (click, type, drag, wait) with visual animations
    - Help button in header to restart tutorial anytime

11. **Final state**: React-driven UI with Express backend, DaisyUI styling, Framer Motion animations, JWT auth, interactive tutorial

---

## 6. Known Technical Constraints / Issues

### Security:
- ⚠️ **Passwords stored in plaintext** in SQLite (no hashing)
- ⚠️ **JWT tokens stored in localStorage** (vulnerable to XSS) — httpOnly cookies planned
- ⚠️ **No refresh token mechanism** (24h token expiry requires re-login)
- ⚠️ **No CORS origin restriction** (currently allows all origins)
- ⚠️ **No advanced security hardening** for production use

### Code Quality:
- ⚠️ **Module-level variable** `toastId` in `Toast.tsx` (line 23) shared across renders
- ⚠️ **Duplicate validation** in `AuthSplash.tsx` (line 99 checks `!username` again after line 100)

### Legacy Patterns:
- ✅ `script.js` has been fully replaced (no longer referenced)
- ⚠️ Some components may still have legacy patterns (audit recommended before major changes)

---

## 7. Development Rules Followed

### Architecture Principles:
1. **Incremental migration** - Not a full rewrite; feature-by-feature replacement
2. **Minimal breaking changes** - App remained functional throughout migration
3. **State-first UI design** - React state replaces DOM manipulation
4. **Isolated testing** - Used minimal reproduction cases (e.g., "TEST ADD" button)

### Code Standards:
- All interactive components MUST have `"use client"` directive
- No `document.querySelector`, `innerHTML`, or direct DOM manipulation
- Use React handlers (`onClick`, `onChange`) not DOM events
- State managed via `TaskContext` for tasks, local state for UI

---

## 8. Critical Notes for Future Agents

### MANDATORY RULES:
- ⛔ **Do NOT reintroduce DOM manipulation** (`document.querySelector`, `innerHTML`, `classList` from vanilla JS)
- ⛔ **Do NOT re-add script.js logic** - it has been fully replaced
- ✅ **Always use React state** for UI updates
- ✅ **Backend and frontend are decoupled** - only communicate via API calls
- ✅ **Always verify `"use client"`** in interactive components

### Create-Task Flow (Current Implementation):
- Clicking "+ New Task" calls `handleQuickCreate` in `TaskContainer.tsx`
- Creates task with empty title via `addTask("")`
- `TaskContext.addTask()` creates optimistic task with temp ID
- New task renders with `isEditingTitle = true` (auto-focus)
- Validation: Empty title shows error styling (`border-color: #e57373`)
- Title saves on Enter or blur, cancels on Escape

### Tutorial System (2026-05):
- **Trigger**: Automatically starts after new user signup + suggestions panel
- **Steps**: 16 interactive steps (0-15) covering all core features
- **Action Detection**: Click, type (Enter key only), drag (via TaskContext diff), and wait (auto-advance)
- **Type Advancement**: All `type` steps advance only on Enter keydown with non-empty value (not on first character)
- **Persistence**: `localStorage` keys: `tutorialCompleted`, `isNewUser`, `tutorialActive`, `tutorialCurrentStep`
- **Restart**: "Help" button in header restarts tutorial anytime
- **Resume**: If page refreshes mid-tutorial, resumes from saved step
- **Touch Support**: Both `click` and `touchend` events detected for mobile
- **No cleanup needed**: Tutorial works with existing tasks; no tutorial-specific tasks created
- **Task Detail Panel Flow**: Title Enter → focuses Description; Description Enter → focuses Done button; Done click → saves and closes

### Debugging Approach:
- When encountering issues, create **minimal reproducible test** (isolated button with direct state update)
- Compare working minimal case with broken implementation
- Check: "use client" directives, event handler bindings, state initialization

### File Structure Quick Reference:
```
task-creation-app/
├── nextjs-app/                     # Frontend (Next.js)
│   ├── app/
│   │   ├── components/             # React components
│   │   │   ├── AuthSplash.tsx       # Login/signup with JWT
│   │   │   ├── TaskContainer.tsx    # Main kanban board
│   │   │   ├── TaskItem.tsx         # Individual task card
│   │   │   ├── KanbanColumn.tsx     # Column container
│   │   │   ├── Sidebar.tsx          # Collapsible category filter
│   │   │   ├── TaskDetailPanel.tsx  # Task editing overlay
│   │   │   ├── DragDropHandler.tsx  # Drag-and-drop logic
│   │   │   ├── CategoryFocusView.tsx
│   │   │   ├── ColumnFocusView.tsx
│   │   │   ├── Header.tsx           # Header with Help button
│   │   │   ├── Toast.tsx
│   │   │   ├── HalftoneBackground.tsx  # Interactive canvas background
│   │   │   ├── ThemeProvider.tsx    # Dynamic theme switching
│   │   │   ├── TutorialOverlay.tsx  # Spotlight + backdrop
│   │   │   ├── TutorialTooltip.tsx  # Instruction tooltip card
│   │   │   ├── TutorialAnimation.tsx # Animated demos
│   │   │   └── HandCursorIcon.tsx   # SVG hand cursor icon
│   │   ├── context/                # State management
│   │   │   ├── TaskContext.tsx      # Task state (JWT-based auth)
│   │   │   └── TutorialContext.tsx  # Tutorial state
│   │   ├── hooks/
│   │   │   └── useTutorialActionDetector.ts
│   │   ├── data/
│   │   │   └── tutorialSteps.ts     # 10 tutorial step definitions
│   │   ├── lib/
│   │   │   └── api.ts              # API layer (JWT Bearer tokens)
│   │   ├── globals.css             # Styles (Tailwind + custom)
│   │   ├── constants.ts            # Category colors
│   │   └── page.tsx                # Entry point (token validation)
│   └── package.json
├── server/                         # Backend (Express)
│   ├── index.js                    # Server + SQLite + JWT auth
│   └── package.json
├── AGENT_CONTEXT.md                # This handover document
├── Prompts used.md                 # Development history
└── README.md
```

---

**Last Updated**: 2026-05-10
**Agent**: AI Assistant (big-pickle model)
**Project State**: Stable, functional, with DaisyUI styling, Framer Motion animations, dynamic theme switching, interactive tutorial system, animated eye icons for password toggle, Enter-chained focus flow in TaskDetailPanel
