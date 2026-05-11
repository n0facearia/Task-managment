# Task Management App - Frontend (Next.js)

This is the frontend of a **Kanban-style task management application** built with Next.js, Tailwind CSS + DaisyUI, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 14.2.35 (App Router)
- **UI**: React + Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **State Management**: React Context (`TaskContext.tsx`)
- **Backend Communication**: REST API via `app/lib/api.ts` (Express server on port 3001)
- **Authentication**: JWT (Bearer tokens via `jsonwebtoken`)
- **Background**: Interactive halftone canvas (`HalftoneBackground.tsx`)
- **Tutorial**: 16-step interactive walkthrough

## Getting Started

1. **Start the backend server first** (required):
   ```bash
   cd ../server
   npm install
   node index.js
   ```

2. **Install dependencies and start the frontend**:
   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── components/       # React components
│   ├── AuthSplash.tsx          # JWT login/signup UI
│   ├── TaskContainer.tsx       # Main kanban board
│   ├── TaskItem.tsx            # Individual task card
│   ├── KanbanColumn.tsx        # Column container
│   ├── Sidebar.tsx             # Collapsible category filter sidebar
│   ├── TaskDetailPanel.tsx     # Task editing overlay
│   ├── DragDropHandler.tsx     # Drag-and-drop logic
│   ├── CategoryFocusView.tsx   # Category expanded view
│   ├── ColumnFocusView.tsx     # Column expanded view
│   ├── Header.tsx              # App header with Tutorial button
│   ├── Toast.tsx               # Toast notifications
│   ├── HalftoneBackground.tsx  # Interactive canvas dot grid
│   ├── ThemeProvider.tsx       # Dynamic category-based theming
│   ├── TutorialOverlay.tsx     # Tutorial spotlight + backdrop
│   ├── TutorialTooltip.tsx     # Tutorial instruction card
│   ├── TutorialAnimation.tsx   # Animated tutorial demos
│   └── HandCursorIcon.tsx      # SVG hand cursor icon
├── context/
│   ├── TaskContext.tsx         # Global task state
│   └── TutorialContext.tsx     # Tutorial state management
├── hooks/
│   └── useTutorialActionDetector.ts  # Action detection for tutorial
├── data/
│   └── tutorialSteps.ts        # 16 tutorial step definitions
├── lib/
│   └── api.ts                  # API wrapper (JWT Bearer auth)
├── globals.css                 # Custom styles + Tailwind
├── layout.tsx                  # Root layout
├── page.tsx                    # Entry point (token validation)
└── constants.ts                # Category colors
```

## Key Features

- Kanban board with Todo / Doing / Done columns
- Inline task creation, editing, and deletion
- Drag-and-drop between columns
- Color-coded categories with collapsible sidebar filtering
- Focus views (double-click columns or categories)
- JWT authentication with auto-logout on expired tokens
- 16-step interactive tutorial (auto-starts after signup)
- Interactive halftone dot grid background
- Hover float effects on columns, tasks, and sidebar
- Dynamic theme switching based on selected category
- Performance: idle animation halt, memoized context, lazy loading, useMemo filters, SQL index

## Note

This project uses **Tailwind CSS + DaisyUI** for styling and **Framer Motion** for animations. The `@tailwind` directives in `globals.css` are required for Tailwind utilities to work.
