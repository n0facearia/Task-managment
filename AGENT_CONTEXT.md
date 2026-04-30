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
| `page.tsx` | Entry point, auth routing |
| `context/TaskContext.tsx` | Global task state management |
| `components/TaskContainer.tsx` | Main kanban board container |
| `components/TaskItem.tsx` | Individual task card |
| `components/AuthSplash.tsx` | Login/signup UI |
| `lib/api.ts` | API wrapper functions |

### Backend (Express)
- **REST API server** with SQLite persistence
- **No UI responsibilities** - serves only JSON responses
- **Endpoints:**
  - `GET /users` - List all users
  - `POST /users` - Create new user
  - `GET /tasks?username=X` - Fetch tasks for user
  - `POST /tasks` - Create new task
  - `PUT /tasks/:id` - Update task
  - `DELETE /tasks/:id` - Delete task

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
- ✅ **Authentication Flow** - Signup and login with localStorage persistence
- ✅ **Drag and Drop** - Move tasks between columns
- ✅ **Sidebar** - Category filter with visibility toggle
- ✅ **Focus Views** - Double-click column/category for expanded view
- ✅ **Toast Notifications** - Temporary messages for user feedback

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

5. **Final state**: React-driven UI with Express backend, minimal legacy patterns

---

## 6. Known Technical Constraints / Issues

### Security:
- ⚠️ **Passwords stored in plaintext** in SQLite (no hashing)
- ⚠️ **Password returned in API response** on user creation (`server/index.js:77`)
- ⚠️ **No authentication tokens** - relies on `localStorage` username check

### Code Quality:
- ⚠️ **Direct DOM manipulation remains** in `AuthSplash.tsx` (lines 232-237, 260-265) for password toggle
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

### Debugging Approach:
- When encountering issues, create **minimal reproducible test** (isolated button with direct state update)
- Compare working minimal case with broken implementation
- Check: "use client" directives, event handler bindings, state initialization

### File Structure Quick Reference:
```
task-creation-app/
├── nextjs-app/           # Frontend (Next.js)
│   ├── app/
│   │   ├── components/   # React components
│   │   ├── context/      # State management
│   │   ├── lib/          # API layer
│   │   └── globals.css   # Styles
│   └── package.json
├── server/               # Backend (Express)
│   ├── index.js          # Server + SQLite setup
│   └── database.sqlite  # SQLite database (auto-created)
└── Prompts used.md       # Development history
```

---

**Last Updated**: 2026-04-30  
**Agent**: AI Assistant (big-pickle model)  
**Project State**: Stable, functional, ready for feature development
