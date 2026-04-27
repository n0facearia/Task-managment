Disclaimer: these prompts aren't from the beggining

My prompt:

You are given a full-stack Task Management application (frontend + backend). Your task is to generate a precise, implementation-ready prompt for an autonomous coding agent.

Objective

Extend the existing application with deletion functionality in two areas:

Category Deletion (Sidebar)
Add a delete button to each category item in the sidebar.
When triggered:
Remove the category from the data store.
Remove or reassign all tasks associated with that category (define behavior explicitly).
Update the UI reactively so the sidebar and task list remain consistent.
Task Deletion (Focus Mode)
In focus mode, display a delete button on each task.
When triggered:
Remove the task from the data store.
Immediately update the UI without requiring a refresh.
Requirements
Consistency
Follow existing coding patterns, naming conventions, and architecture.
Do not introduce new abstractions unless necessary.
State Management
Use the current state system (no parallel or duplicate state).
Ensure all UI updates are driven by state changes, not manual DOM patches.
Backend Integration
Use existing API patterns for DELETE operations.
If endpoints do not exist, define and implement them consistently.
UI/UX
Buttons must match existing styling conventions.
Ensure proper placement (non-intrusive but accessible).
Prevent accidental deletion (optional: confirmation step if consistent with current UX).
Edge Cases
Deleting a category with tasks
Deleting the currently active/selected category
Deleting a task while in focus mode
Handling API failures (graceful fallback)
Constraints
Minimal, surgical changes only
No regression to existing functionality
Maintain full UI consistency
Output Format

The generated prompt for the agent must:

Be step-by-step and executable
Reference exact areas of the codebase to modify
Include both frontend and backend changes
Avoid ambiguity or high-level instructions

claude:

You are making two additions to this task management app: category deletion from the sidebar, and task deletion from the focus mode view. Follow every step exactly.

═══════════════════════════════════════
PART 1 — BACKEND: Add DELETE /categories/:id endpoint
═══════════════════════════════════════

Open server/index.js.

Find the POST /categories handler. Immediately after it, add this new endpoint:

app.delete("/categories/:id", (req, res) => {
const { id } = req.params;
const { username } = req.query;
if (!id || !username) {
return res.status(400).json({ error: "ID and username are required" });
}
try {
const category = db.prepare("SELECT \* FROM categories WHERE id = ? AND username = ?").get(id, username);
if (!category) {
return res.status(404).json({ error: "Category not found" });
}
db.prepare("UPDATE tasks SET category = '' WHERE category = ? AND username = ?").run(category.name, username);
db.prepare("DELETE FROM categories WHERE id = ? AND username = ?").run(id, username);
res.json({ success: true });
} catch (error) {
res.status(500).json({ error: "Failed to delete category" });
}
});

This endpoint:

- Clears the category field on all tasks that used this category (sets to empty string)
- Then deletes the category itself
- Scoped to the username so users cannot delete each other's categories

═══════════════════════════════════════
PART 2 — FRONTEND: Add delete button to sidebar categories
═══════════════════════════════════════

Open nextjs-app/public/script.js.

Find the renderCategorySidebar function. Inside it, find the block that creates each category button:

activeCategories.forEach((category) => {
const btn = document.createElement("button");
btn.className = "category-filter-btn";
btn.innerHTML = `       <span class="category-dot" style="background-color: ${CATEGORY_COLORS[category]}"></span>
      <span>${category}</span>
    `;
btn.addEventListener("click", () => {
document.querySelectorAll(".category-filter-btn").forEach((b) => {
b.classList.remove("active");
});
btn.classList.add("active");
state.activeCategoryFilter = category;
renderBoard();
});
btn.addEventListener("dblclick", (e) => {
e.stopPropagation();
openCategoryFocusView(category);
});
dom.categoryList.appendChild(btn);
});

Replace it with:

activeCategories.forEach((category) => {
const wrapper = document.createElement("div");
wrapper.className = "category-filter-wrapper";

    const btn = document.createElement("button");
    btn.className = "category-filter-btn";
    btn.innerHTML = `
      <span class="category-dot" style="background-color: ${CATEGORY_COLORS[category]}"></span>
      <span>${category}</span>
    `;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-filter-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      state.activeCategoryFilter = category;
      renderBoard();
    });
    btn.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      openCategoryFocusView(category);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "category-delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete category");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await handleCategoryDelete(category);
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(deleteBtn);
    dom.categoryList.appendChild(wrapper);

});

Then find the renderCategorySidebar function and find the CATEGORY_COLORS reference at the top. Note that CATEGORY_COLORS is a plain object — we need to look up the category id to delete it.

Add this new function immediately before renderCategorySidebar:

async function handleCategoryDelete(categoryName) {
if (!authStore.currentUser) return;

const categoryEntry = state.categories
? state.categories.find((c) => c.name === categoryName)
: null;

if (!categoryEntry) {
state.tasks.forEach((task) => {
if ((task.category || "").toLowerCase() === categoryName.toLowerCase()) {
updateTaskLocal(task.id, { category: "" });
}
});
if (state.activeCategoryFilter && state.activeCategoryFilter.toLowerCase() === categoryName.toLowerCase()) {
state.activeCategoryFilter = null;
}
delete CATEGORY_COLORS[categoryName];
renderBoard();
return;
}

showLoadingIndicator(true);
try {
const response = await safeFetch(
`${Api.base}/api/categories/${encodeURIComponent(categoryEntry.id)}?username=${encodeURIComponent(authStore.currentUser)}`,
{ method: "DELETE" },
"tasks"
);
if (!response) {
showToast("Could not delete category");
return;
}

    state.tasks.forEach((task) => {
      if ((task.category || "").toLowerCase() === categoryName.toLowerCase()) {
        updateTaskLocal(task.id, { category: "" });
      }
    });

    if (state.activeCategoryFilter && state.activeCategoryFilter.toLowerCase() === categoryName.toLowerCase()) {
      state.activeCategoryFilter = null;
    }

    delete CATEGORY_COLORS[categoryName];

    if (state.categories) {
      state.categories = state.categories.filter((c) => c.id !== categoryEntry.id);
    }

    renderBoard();
    showToast(`"${categoryName}" deleted`);

} catch (error) {
showToast("Could not delete category");
} finally {
showLoadingIndicator(false);
}
}

═══════════════════════════════════════
PART 3 — FRONTEND: Add delete button to focus mode task cards
═══════════════════════════════════════

Open nextjs-app/public/script.js.

Find the openCategoryFocusView function. Inside it, find the block that builds each task card:

      tasks.forEach((task) => {
        const card = document.createElement("div");
        card.className = "focus-task-card";

        const title = document.createElement("div");
        title.className = "focus-task-title";
        title.textContent = task.title || "Untitled";

        card.appendChild(title);

        if (task.description && task.description.trim()) {
          const desc = document.createElement("div");
          desc.className = "focus-task-description";
          desc.textContent = task.description;
          card.appendChild(desc);
        }

        const status = document.createElement("div");
        status.className = "focus-task-status";
        status.textContent = STATUS_DISPLAY[task.status] || task.status;
        card.appendChild(status);

        list.appendChild(card);
      });

Replace it with:

      tasks.forEach((task) => {
        const card = document.createElement("div");
        card.className = "focus-task-card";

        const cardHeader = document.createElement("div");
        cardHeader.className = "focus-task-card-header";

        const title = document.createElement("div");
        title.className = "focus-task-title";
        title.textContent = task.title || "Untitled";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "focus-task-delete-btn";
        deleteBtn.setAttribute("aria-label", "Delete task");
        deleteBtn.textContent = "✕";
        deleteBtn.addEventListener("click",
          withLocalActionGuard(deleteBtn, async () => {
            await handleTaskDelete(task.id);
            card.remove();
            const remainingCount = list.querySelectorAll(".focus-task-card").length;
            document.getElementById("category-focus-task-count").textContent =
              remainingCount === 1 ? "1 task" : `${remainingCount} tasks`;
            if (remainingCount === 0) {
              const empty = document.createElement("div");
              empty.className = "focus-empty-state";
              empty.textContent = "No tasks in this category";
              list.appendChild(empty);
              closeCategoryFocusView();
            }
            renderCategorySidebar();
          })
        );

        cardHeader.appendChild(title);
        cardHeader.appendChild(deleteBtn);
        card.appendChild(cardHeader);

        if (task.description && task.description.trim()) {
          const desc = document.createElement("div");
          desc.className = "focus-task-description";
          desc.textContent = task.description;
          card.appendChild(desc);
        }

        const status = document.createElement("div");
        status.className = "focus-task-status";
        status.textContent = STATUS_DISPLAY[task.status] || task.status;
        card.appendChild(status);

        list.appendChild(card);
      });

═══════════════════════════════════════
PART 4 — CSS: Add styles for new buttons
═══════════════════════════════════════

Open nextjs-app/public/styles.css and add these lines at the very end of the file:

.category-filter-wrapper {
display: flex;
align-items: center;
gap: 4px;
width: 100%;
}

.category-filter-wrapper .category-filter-btn {
flex: 1;
}

.category-delete-btn {
background: transparent;
border: none;
color: #555;
font-size: 12px;
padding: 4px 6px;
border-radius: 4px;
cursor: pointer;
flex-shrink: 0;
transition: color 150ms ease, background 150ms ease;
}

.category-delete-btn:hover {
color: #e57373;
background: rgba(229, 115, 115, 0.1);
}

.focus-task-card-header {
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 8px;
}

.focus-task-card-header .focus-task-title {
flex: 1;
}

.focus-task-delete-btn {
background: transparent;
border: none;
color: #555;
font-size: 12px;
padding: 2px 6px;
border-radius: 4px;
cursor: pointer;
flex-shrink: 0;
transition: color 150ms ease, background 150ms ease;
line-height: 1;
}

.focus-task-delete-btn:hover {
color: #e57373;
background: rgba(229, 115, 115, 0.1);
}

═══════════════════════════════════════
CRITICAL EDITING RULES
═══════════════════════════════════════

- Never delete a file and recreate it. Edit only the specific blocks described above.
- Do not touch any file not listed above.
- Do not reformat, reorder, or restructure anything not mentioned.

When done, say "Done." and nothing else.
