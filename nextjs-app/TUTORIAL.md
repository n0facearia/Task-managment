# Interactive Tutorial System

## Overview

The tutorial system provides a step-by-step interactive walkthrough for new users after signup. It covers all core features of the task management app and can be restarted at any time.

## How It Works

### Auto-Start Flow
1. User signs up → `isNewUser` flag set in `localStorage`
2. User sees suggested tasks panel → clicks "Lets go"
3. Board loads → `TutorialStarter` component detects `isNewUser` flag
4. After 800ms delay (for DOM to settle), tutorial starts at step 0

### Step Advancement
Each step has an `action` type that determines how it advances:
- **click**: Detects click on target element (uses capturing event listener)
- **type**: Detects Enter key in target input field (advances on Enter with non-empty value)
- **drag**: Detects task status change via `TaskContext` diff comparison
- **wait**: Auto-advances after 2.5 seconds

### Tutorial Steps

| Step | Target | Action | Description |
|------|--------|--------|-------------|
| 0 | `#create-task` | click | Create your first task |
| 1 | `.task-title-edit` | type | Name your task |
| 2 | `.task-description-edit` | type | Add a description |
| 3 | `[data-tutorial="open-detail"]` | click | Open detail panel |
| 4 | `[data-tutorial="category-option"]` | click | Pick a category |
| 5 | `#task-detail-title` | type | Edit title in panel |
| 6 | `#task-detail-description` | type | Edit description in panel |
| 7 | `[data-tutorial="edit-task-done"]` | click | Click Done to save |
| 8 | `[data-tutorial="task-next-status"]` | click | Move task forward |
| 9 | `[data-tutorial="task-back-status"]` | click | Move task back |
| 10 | `#todo-column` | drag | Drag task to Doing |
| 11 | `#doing-column` | drag | Drag task to Done |
| 12 | `.cross-button` | click | Delete a task |
| 13 | `#category-sidebar` | click | Filter by category |
| 14 | `.category-filter-all` | click | View all tasks |
| 15 | `null` | wait | Completion message |

## Architecture

### Components

| Component | Purpose |
|-----------|---------|
| `TutorialContext.tsx` | React Context for tutorial state (active, step, completed) |
| `TutorialOverlay.tsx` | Full-screen overlay with dark backdrop, spotlight highlight, and animated tooltip |
| `TutorialTooltip.tsx` | Instruction card with step counter, title, description, and skip button |
| `TutorialAnimation.tsx` | Framer Motion animations (pulse ring, hand cursor, typing blink) |
| `HandCursorIcon.tsx` | SVG hand icon used in drag/click animations |

### Hook

| Hook | Purpose |
|------|---------|
| `useTutorialActionDetector.ts` | Detects user actions (click, type, drag, wait) and calls `nextStep()` when completed |

### Data

| File | Purpose |
|------|---------|
| `data/tutorialSteps.ts` | Defines all 16 tutorial steps with targets, actions, animations, and positioning |

## localStorage Keys

| Key | Purpose | Lifecycle |
|-----|---------|-----------|
| `tutorialCompleted` | Prevents tutorial from starting for returning users | Set on skip/complete, checked on signup |
| `isNewUser` | Triggers auto-start after signup | Set on signup, removed on tutorial start or logout |
| `tutorialActive` | Resumes tutorial after page refresh | Set when tutorial starts, removed on skip/complete |
| `tutorialCurrentStep` | Remembers which step user was on | Set on each step change, removed on skip/complete |

## How to Modify Tutorial Steps

1. Open `app/data/tutorialSteps.ts`
2. Each step is an object with these fields:
   - `id`: Step number (0-indexed)
   - `target`: CSS selector for the element to highlight (null for no target)
   - `title`: Tooltip heading
   - `description`: Tooltip instruction text
   - `action`: `"click"` | `"drag"` | `"type"` | `"wait"`
   - `actionTarget`: CSS selector for the element that must be interacted with (can differ from `target`)
   - `animationType`: `"pulse"` | `"drag-demo"` | `"click-demo"` | `"type-demo"` | `"none"`
   - `animationLoop`: Whether animation repeats until user acts
   - `tooltipPosition`: `"top"` | `"bottom"` | `"left"` | `"right"`
   - `blockOtherInteractions`: Whether clicking outside the target is blocked

3. For drag steps, update `DRAG_STATUS_MAP` in `useTutorialActionDetector.ts`:
   ```typescript
   const DRAG_STATUS_MAP: Record<number, string> = {
     10: "inProgress",  // Step 10 → task moves to inProgress
     11: "completed",   // Step 11 → task moves to completed
   };
   ```

## How to Add New Animations

1. Add a new type to `TutorialAnimation.tsx` props:
   ```typescript
   type: "pulse" | "drag-demo" | "click-demo" | "type-demo" | "new-animation" | "none"
   ```

2. Add the animation rendering:
   ```typescript
   {type === "new-animation" && (
     <motion.div
       className="tutorial-new-animation"
       animate={{ ... }}
       transition={{ ... }}
     />
   )}
   ```

3. Add CSS styles in `globals.css` under the `/* ── TUTORIAL ANIMATIONS ── */` section.

4. Reference the new type in a tutorial step's `animationType` field.

## How to Customize Tutorial Text

- Edit `app/data/tutorialSteps.ts` directly — `title` and `description` fields are plain strings
- Use escaped quotes for strings containing quotes: `\"text\"`
- Use unicode escapes for special characters: `\u00d7` for ×

## Troubleshooting

### Tutorial doesn't start after signup
- Check `localStorage` for `isNewUser` flag
- Check `localStorage` for `tutorialCompleted` — if `"true"`, tutorial won't start
- Clear both flags to reset: `localStorage.removeItem('isNewUser'); localStorage.removeItem('tutorialCompleted');`

### Spotlight highlights wrong element
- Verify the CSS selector in `tutorialSteps.ts` matches an existing element
- Check that the element exists at the time the step runs (some elements are created dynamically)
- Use browser dev tools to inspect element IDs/classes

### Tooltip appears off-screen
- The tooltip positioning uses `getTooltipPosition()` in `TutorialOverlay.tsx`
- Adjust `GAP` and `OFFSET_X` constants if needed
- For mobile, the `@media (max-width: 640px)` CSS in `globals.css` limits tooltip width

### Tutorial doesn't advance on action
- Check that `actionTarget` selector matches the element the user interacts with
- For drag steps: verify `DRAG_STATUS_MAP` has the correct step-to-status mapping
- For type steps: press Enter in the target input (advances on Enter keydown with non-empty value, not on first character)
- Add `console.log` in `useTutorialActionDetector.ts` to debug

### Tutorial resumes from wrong step after refresh
- Check `localStorage` key `tutorialCurrentStep` — it should match the current step
- Clear it to restart: `localStorage.removeItem('tutorialCurrentStep'); localStorage.removeItem('tutorialActive');`

## Mobile Support

- Touch events (`touchend`) are detected alongside click events
- `document.elementFromPoint()` maps touch coordinates to elements
- Responsive CSS (`@media max-width: 640px`) reduces tooltip size for small screens
- All animations use `pointer-events: none` so they don't interfere with touch interaction

## Restarting Tutorial

Users can restart the tutorial anytime by clicking the **"Help"** button in the app header. This:
1. Clears the `tutorialCompleted` flag
2. Resets to step 0
3. Starts the tutorial immediately
