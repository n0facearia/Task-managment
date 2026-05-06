# Task Management App - Frontend (Next.js)

This is the frontend of a **Kanban-style task management application** built with Next.js, Tailwind CSS + DaisyUI, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 14.2.35 (App Router)
- **UI**: React + Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **State Management**: React Context (`TaskContext.tsx`)
- **Backend Communication**: REST API via `app/lib/api.ts` (Express server on port 3001)

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
│   ├── AuthSplash.tsx          # Login/signup UI
│   ├── TaskContainer.tsx       # Main kanban board
│   ├── TaskItem.tsx            # Individual task card
│   ├── KanbanColumn.tsx        # Column container
│   ├── Sidebar.tsx             # Category filter sidebar
│   ├── TaskDetailPanel.tsx     # Task editing overlay
│   ├── DragDropHandler.tsx     # Drag-and-drop logic
│   ├── CategoryFocusView.tsx   # Category expanded view
│   ├── ColumnFocusView.tsx     # Column expanded view
│   ├── Header.tsx              # App header with logout
│   └── Toast.tsx               # Toast notifications
├── context/
│   └── TaskContext.tsx         # Global task state
├── lib/
│   └── api.ts                  # API wrapper functions
├── globals.css                 # Custom styles + Tailwind
├── layout.tsx                  # Root layout
├── page.tsx                    # Entry point
└── constants.ts                # Category colors
```

## Key Features

- Kanban board with Todo / Doing / Done columns
- Inline task creation, editing, and deletion
- Drag-and-drop between columns
- Color-coded categories with sidebar filtering
- Focus views (double-click columns or categories)
- User authentication with session persistence

## Note

This project uses **Tailwind CSS + DaisyUI** for styling and **Framer Motion** for animations. The `@tailwind` directives in `globals.css` are required for Tailwind utilities to work.
