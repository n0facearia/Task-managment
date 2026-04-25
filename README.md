# Task Management App

## Overview

This project is a client-side Task Management application built with vanilla HTML, CSS, and JavaScript. It is designed as a learning-focused implementation that explores core frontend concepts such as state management, asynchronous API interaction, UI rendering patterns, and basic system design.

The application allows users to authenticate, create and manage tasks, and move tasks through a simple Kanban-style workflow (Todo → Doing → Done). It integrates with a mock backend API for persistence.

---

## Core Objectives

- Practice structured frontend state management without frameworks
- Understand API interaction patterns (CRUD over HTTP)
- Implement UI state separation from domain state
- Explore async workflows, loading states, and error handling
- Build a bounded implementation workflow with clear UI rules

---

## Features

### Authentication

- User signup and login system (MockAPI-based)
- Session persistence using `localStorage`
- Request safety using abort controllers and request tokens

### Task Management

- Create tasks with title and optional description
- Edit task title and description inline
- Delete tasks
- Move tasks across states:
  - Todo
  - Doing
  - Done

- Drag-and-drop support for status changes
- Task limit constraint (max active tasks)

### UI System

- Custom Kanban board layout
- Splash + authentication flow (landing, login, signup, onboarding suggestions)
- Inline editing system with controlled focus handling
- Custom cursor and toast notification system
- Loading state indicator for API operations

### Data Persistence

- Tasks stored via MockAPI backend
- User-specific task filtering
- Temporary task handling before server confirmation

---

## Architecture Overview

### State Layers

- `state.tasks`
  Core domain state (all tasks loaded from server)

- `uiState`
  UI-only state (editing focus, active field)

- `authStore`
  Authentication state + request control (session, abort controllers, request tokens)

---

### Key Design Patterns

- **Separation of concerns (partial)**
  - API calls are isolated into service-like functions
  - UI rendering is separated into `renderBoard` / `renderColumn`

- **Optimistic + reconciled updates**
  - Temporary tasks (`temp-*`) exist before server confirmation
  - Server response replaces local placeholder

- **Request safety system**
  - AbortController per domain (`auth`, `tasks`)
  - Request tokens to prevent stale responses

- **UI-driven state transitions**
  - Kanban transitions handled via UI controls and drag-and-drop

---

## Data Model

### Task

```js
{
  id: string,
  title: string,
  description: string,
  status: "active" | "inProgress" | "completed",
  username: string
}
```

### User

```js
{
  username: string,
  password: string
}
```

---

## Task Flow

1. User logs in or signs up
2. Tasks are fetched from API filtered by username
3. User creates or imports tasks
4. Tasks are managed in a Kanban workflow
5. Changes are synced with backend API
6. UI re-renders based on updated state

---

## API Layer

The app interacts with a MockAPI backend:

- `GET /users`
- `POST /users`
- `GET /tasks?username=...`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

All requests are wrapped with a safety layer using `safeFetch`.

---

## Project Structure (Current Implementation)

This project is implemented as a single-file application:

```
index.html
└── contains:
    ├── HTML structure (auth + app UI)
    ├── CSS (inline styles)
    └── JavaScript (full application logic)
```

---

## Known Design Constraints

- No frontend framework used (vanilla JS only)
- No dedicated backend (MockAPI used as persistence layer)
- State management is manual and centralized
- UI rendering is full or partial re-render based on state changes
- Authentication is simplified (no encryption or token auth)

---

## Learning Focus Areas

This project specifically explores:

- State vs UI state separation
- Async request lifecycle management
- Handling race conditions in frontend apps
- UI re-render strategies
- Event-driven architecture in vanilla JS
- Early-stage system design discipline

---

## Future Improvements (Planned Direction)

- Refactor into modular architecture (services, state, UI layers)
- Introduce explicit domain layer for tasks
- Centralize state updates and rendering pipeline
- Reduce direct API coupling in UI handlers
- Improve separation between business rules and UI logic

---

## Notes

This project is intentionally kept framework-free to focus on understanding core frontend behavior and system design principles at a low level.
