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
- ✅ **Authentication** - Signup and login with username/password
- ✅ **Session Persistence** - Uses `localStorage` to remember logged-in user
- ✅ **User-Specific Tasks** - Each user sees only their own tasks

### UI Features
- ✅ **Toast Notifications** - Temporary messages for user feedback
- ✅ **Loading States** - Visual feedback during API operations
- ✅ **Onboarding Suggestions** - Quick-start task suggestions after signup
- ✅ **Interactive Halftone Background** - Canvas-based dot grid that reacts to mouse movement (idle = 0 CPU overhead)
- ✅ **Hover Float Effects** - Kanban columns, task cards, and category sidebar buttons lift with subtle scale and drop shadow on hover

---

## Project Structure

```
task-creation-app/
├── nextjs-app/               # Frontend (Next.js)
│   ├── app/
│   │   ├── components/       # React components
│   │   │   ├── AuthSplash.tsx
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
│   │   │   └── HalftoneBackground.tsx
│   │   ├── context/
│   │   │   └── TaskContext.tsx  # State management
│   │   ├── lib/
│   │   │   └── api.ts          # API layer
│   │   ├── globals.css         # Styles
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── package.json
├── server/                   # Backend (Express)
│   ├── index.js              # Express server + SQLite setup
│   └── package.json
├── README.md
├── AGENT_CONTEXT.md         # AI/engineer handover document
└── Prompts used.md          # Development history
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

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create new user |
| GET | `/tasks?username=X` | Fetch tasks for user |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

---

## Stability Note

The application has been tested and stabilized through multiple debugging cycles. The Next.js frontend builds successfully, and the Express backend handles all CRUD operations.

**Important**: The backend runs as a **separate process** from the frontend. Both must be running for full functionality.

**Known Limitations**:
- Passwords are stored in plaintext (no hashing implemented)
- No authentication tokens - relies on `localStorage` username check
- No advanced security hardening for production use

---

## Documentation

For detailed development history and AI agent context, see:
- **`Prompts used.md`** - Step-by-step migration and debugging history
- **`AGENT_CONTEXT.md`** - Handover document for developers/agents

---

## Last Updated
2026-05-06 (Interactive halftone background + hover float effects)
