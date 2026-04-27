const Api = {
  base: "",
  users: "/api/users",
  tasks: "/api/tasks",
};

const TASK_STATUSES = ["active", "inProgress", "completed"];
const STATUS_LABELS = {
  active: "Todo",
  inProgress: "Doing",
  completed: "Done",
};

const CATEGORY_COLORS = {
  Work: "#4A90D9",
  Personal: "#7ED67E",
  Health: "#E8734A",
  Learning: "#9B6DD6",
  Finance: "#E8C84A",
  Other: "#A0A0A0",
};

const state = {
  tasks: [],
  maxActiveTasks: 20,
  activeCategoryFilter: null,
};

const uiState = {
  editingTaskId: null,
  editingField: null,
  editingValue: null,
};

const taskDetailState = {
  taskId: null,
  selectedCategory: "",
};

const authStore = {
  currentUser: null,
  sessionVersion: 0,
  authRequestToken: null,
  loadRequestToken: null,
  taskRequestTokens: {},
  taskInProgress: new Set(),
  abortControllers: {
    auth: null,
    tasks: null,
  },
};

const dom = {
  activeTasksContainer: null,
  inprogressTasksContainer: null,
  completedTasksContainer: null,
  createTaskButton: null,
  toastContainer: null,
  cursor: null,
  loadingIndicator: null,
  splash: null,
  pageContainer: null,
  loginError: null,
  signupError: null,
  loginUsername: null,
  loginPassword: null,
  signupUsername: null,
  signupPassword: null,
  signupConfirm: null,
  suggestionItems: [],
  suggestionsDone: null,
  landingPanel: null,
  categorySidebar: null,
  categoryList: null,
};

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (chr) => map[chr]);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="toast-message">${escapeHtml(message)}</div>
    <div class="toast-bar-track"><div class="toast-bar"></div></div>
  `;
  dom.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    window.setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function findTaskIndex(taskId) {
  return state.tasks.findIndex((task) => task.id === taskId);
}

function findTask(taskId) {
  return state.tasks.find((task) => task.id === taskId) || null;
}

function isTemporaryTaskId(taskId) {
  return String(taskId).startsWith("temp-");
}

function validateStatus(status) {
  return TASK_STATUSES.includes(status);
}

function getTaskContainer(status) {
  if (status === "active") return dom.activeTasksContainer;
  if (status === "inProgress") return dom.inprogressTasksContainer;
  if (status === "completed") return dom.completedTasksContainer;
  return null;
}

function tasksByStatus(status) {
  return state.tasks.filter((task) => task.status === status);
}

function createAbortController(key) {
  const existing = authStore.abortControllers[key];
  if (existing) {
    existing.abort();
  }
  const controller = new AbortController();
  authStore.abortControllers[key] = controller;
  return controller;
}

function clearAbortController(key) {
  authStore.abortControllers[key] = null;
}

function saveSession(username) {
  authStore.currentUser = username;
  authStore.sessionVersion += 1;
  localStorage.setItem("taskapp_user", username);
}

function loadSession() {
  const saved = localStorage.getItem("taskapp_user");
  if (saved) authStore.currentUser = saved;
}

function clearSession() {
  authStore.currentUser = null;
  authStore.sessionVersion += 1;
  localStorage.removeItem("taskapp_user");
}

function setEditingState(taskId, field) {
  uiState.editingTaskId = taskId;
  uiState.editingField = field;
  const task = findTask(taskId);
  uiState.editingValue = task ? task[field] || "" : "";
}

function clearEditingState() {
  uiState.editingTaskId = null;
  uiState.editingField = null;
  uiState.editingValue = null;
}

function updateTaskLocal(taskId, patch) {
  const index = findTaskIndex(taskId);
  if (index === -1) return false;
  state.tasks[index] = { ...state.tasks[index], ...patch };
  return true;
}

function replaceTask(taskId, newTask) {
  const index = findTaskIndex(taskId);
  if (index === -1) return false;
  state.tasks.splice(index, 1, newTask);
  if (uiState.editingTaskId === taskId) {
    uiState.editingTaskId = newTask.id;
  }
  return true;
}

function removeTask(taskId) {
  const index = findTaskIndex(taskId);
  if (index === -1) return false;
  state.tasks.splice(index, 1);
  if (uiState.editingTaskId === taskId) {
    clearEditingState();
  }
  return true;
}

function addLocalTask() {
  if (!authStore.currentUser) return;

  const existingTemp = state.tasks.find((t) => isTemporaryTaskId(t.id));
  if (existingTemp) {
    setEditingState(existingTemp.id, "title");
    renderColumn("active");
    return;
  }

  if (uiState.editingTaskId) {
    return;
  }

  const activeCount = tasksByStatus("active").length;
  if (activeCount >= state.maxActiveTasks) {
    showToast("You've reached the maximum of 20 tasks");
    return;
  }

  const task = {
    id: `temp-${crypto.randomUUID()}`,
    title: "",
    description: "",
    status: "active",
    username: authStore.currentUser,
  };

  state.tasks.unshift(task);
  setEditingState(task.id, "title");
  renderColumn("active");
}

function showPanel(panelId) {
  const panelIds = [
    "landing-panel",
    "login-panel",
    "signup-panel",
    "suggestions-panel",
  ];

  panelIds.forEach((id) => {
    const panel = document.getElementById(id);
    if (!panel) return;
    panel.style.display = id === panelId ? "flex" : "none";
    panel.classList.remove("panel-enter", "panel-exit");
  });

  const incomingEl = document.getElementById(panelId);
  if (!incomingEl) return;
  void incomingEl.offsetWidth;
  incomingEl.classList.add("panel-enter");
  window.setTimeout(() => {
    incomingEl.classList.remove("panel-enter");
  }, 250);
}

function showSplash() {
  dom.splash.style.display = "flex";
  dom.splash.style.opacity = "1";
  dom.pageContainer.style.display = "none";
}

function hideSplash() {
  dom.splash.style.opacity = "0";
  dom.pageContainer.style.display = "flex";
  window.setTimeout(() => {
    dom.splash.style.display = "none";
  }, 300);
}

function showLoadingIndicator(show) {
  dom.loadingIndicator.style.display = show ? "block" : "none";
}

function focusFieldIfNeeded(status) {
  if (!uiState.editingTaskId || !uiState.editingField) return;
  const container = getTaskContainer(status);
  if (!container) return;
  const selector = `[data-task-id="${uiState.editingTaskId}"] [data-role="${uiState.editingField}"]`;
  const element = container.querySelector(selector);
  if (element) {
    element.focus();
    if (element.select) {
      element.select();
    }
  }
}

function renderColumn(status) {
  const container = getTaskContainer(status);
  if (!container) return;
  container.innerHTML = "";

  const allTasks = tasksByStatus(status);
  const tasks = state.activeCategoryFilter
    ? allTasks.filter((task) => {
        const cat = task.category || "";
        return cat.toLowerCase() === state.activeCategoryFilter.toLowerCase();
      })
    : allTasks;
  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "kanban-empty";
    empty.textContent = `No ${STATUS_LABELS[status]} tasks here`;
    container.appendChild(empty);
    return;
  }

  tasks.forEach((task) => container.appendChild(renderTaskElement(task)));
  focusFieldIfNeeded(status);
}

function renderBoard() {
  TASK_STATUSES.forEach(renderColumn);
  renderCategorySidebar();
}

function renderCategorySidebar() {
  if (!dom.categoryList) return;

  // Get categories that have at least one task
  const activeCategories = Object.keys(CATEGORY_COLORS).filter((cat) =>
    state.tasks.some((task) => {
      const taskCategory = task.category || "";
      return taskCategory.toLowerCase() === cat.toLowerCase();
    }),
  );

  dom.categoryList.innerHTML = "";

  if (activeCategories.length === 0) {
    dom.categorySidebar?.classList.remove("visible");
    return;
  }

  dom.categorySidebar?.classList.add("visible");

  const allBtn = document.createElement("button");
  allBtn.className = "category-filter-btn category-filter-all";
  allBtn.innerHTML = `
    <span class="category-all-icon">⊞</span>
    <span>All</span>
  `;
  allBtn.addEventListener("click", () => {
    document.querySelectorAll(".category-filter-btn").forEach((b) => {
      b.classList.remove("active");
    });
    allBtn.classList.add("active");
    state.activeCategoryFilter = null;
    renderBoard();
  });

  if (!state.activeCategoryFilter) {
    allBtn.classList.add("active");
  }

  dom.categoryList.appendChild(allBtn);

  activeCategories.forEach((category) => {
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
    dom.categoryList.appendChild(btn);
  });
}

function openTaskDetailPanel(taskId) {
  const task = findTask(taskId);
  if (!task) return;

  taskDetailState.taskId = taskId;
  taskDetailState.selectedCategory = task.category || "";

  document.getElementById("task-detail-title").value = task.title || "";
  document.getElementById("task-detail-description").value =
    task.description || "";

  document.querySelectorAll(".category-option").forEach((btn) => {
    btn.classList.toggle(
      "selected",
      btn.dataset.category === taskDetailState.selectedCategory,
    );
  });

  document.getElementById("task-detail-overlay").style.display = "flex";
}

function closeTaskDetailPanel() {
  document.getElementById("task-detail-overlay").style.display = "none";
  taskDetailState.taskId = null;
  taskDetailState.selectedCategory = "";
}

function openCategoryFocusView(category) {
  const color = CATEGORY_COLORS[category] || "#888";
  const tasks = state.tasks.filter((task) => {
    const cat = task.category || "";
    return cat.toLowerCase() === category.toLowerCase();
  });

  document.getElementById("category-focus-dot").style.background = color;
  document.getElementById("category-focus-title").textContent = category;

  const count = tasks.length;
  document.getElementById("category-focus-task-count").textContent =
    count === 1 ? "1 task" : `${count} tasks`;

  const list = document.getElementById("category-focus-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "focus-empty-state";
    empty.textContent = "No tasks in this category";
    list.appendChild(empty);
  } else {
    const STATUS_DISPLAY = {
      active: "Todo",
      inProgress: "Doing",
      completed: "Done",
    };

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
  }

  document.getElementById("category-focus-overlay").style.display = "flex";
}

function closeCategoryFocusView() {
  document.getElementById("category-focus-overlay").style.display = "none";
}

function openColumnFocusView(status) {
  const label = STATUS_LABELS[status] || status;

  const tasks = state.activeCategoryFilter
    ? state.tasks.filter(
        (t) =>
          t.status === status &&
          (t.category || "").toLowerCase() ===
            state.activeCategoryFilter.toLowerCase(),
      )
    : state.tasks.filter((t) => t.status === status);

  document.getElementById("column-focus-title").textContent = label;

  const count = tasks.length;
  document.getElementById("column-focus-count").textContent =
    count === 1 ? "1 task" : `${count} tasks`;

  const list = document.getElementById("column-focus-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "column-focus-empty";
    empty.textContent = "No tasks in this column";
    list.appendChild(empty);
  } else {
    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "column-focus-card";

      const title = document.createElement("div");
      title.className = "column-focus-card-title";
      title.textContent = task.title || "Untitled";
      card.appendChild(title);

      if (task.description && task.description.trim()) {
        const desc = document.createElement("div");
        desc.className = "column-focus-card-description";
        desc.textContent = task.description;
        card.appendChild(desc);
      }

      const category = task.category || "";
      if (category && CATEGORY_COLORS[category]) {
        const footer = document.createElement("div");
        footer.className = "column-focus-card-footer";

        const dot = document.createElement("span");
        dot.className = "column-focus-card-category";
        dot.style.background = CATEGORY_COLORS[category];

        const label = document.createElement("span");
        label.className = "column-focus-card-category-label";
        label.textContent = category;

        footer.appendChild(dot);
        footer.appendChild(label);
        card.appendChild(footer);
      }

      list.appendChild(card);
    });
  }

  document.getElementById("column-focus-overlay").style.display = "flex";
}

function closeColumnFocusView() {
  document.getElementById("column-focus-overlay").style.display = "none";
}

function setupColumnFocusView() {
  document
    .getElementById("column-focus-close")
    .addEventListener("click", closeColumnFocusView);

  document
    .getElementById("column-focus-overlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("column-focus-overlay")) {
        closeColumnFocusView();
      }
    });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      document.getElementById("column-focus-overlay").style.display !== "none"
    ) {
      closeColumnFocusView();
    }
  });

  const columnTitleMap = [
    { id: "todo-column", status: "active" },
    { id: "doing-column", status: "inProgress" },
    { id: "done-column", status: "completed" },
  ];

  columnTitleMap.forEach(({ id, status }) => {
    const column = document.getElementById(id);
    if (!column) return;
    const titleEl = column.querySelector(".kanban-column-title");
    if (!titleEl) return;

    titleEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      openColumnFocusView(status);
    });
  });
}

function setupCategoryFocusView() {
  document
    .getElementById("category-focus-close")
    .addEventListener("click", closeCategoryFocusView);

  document
    .getElementById("category-focus-overlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("category-focus-overlay")) {
        closeCategoryFocusView();
      }
    });
}

async function handleTaskDetailDone() {
  const taskId = taskDetailState.taskId;
  if (!taskId) return;

  const task = findTask(taskId);
  if (!task) return;

  const newTitle = document.getElementById("task-detail-title").value.trim();
  const newDescription = document.getElementById(
    "task-detail-description",
  ).value;
  const newCategory = taskDetailState.selectedCategory;

  if (!newTitle) {
    showToast("Title cannot be blank");
    return;
  }

  showLoadingIndicator(true);
  try {
    if (!isTemporaryTaskId(taskId)) {
      const updated = await updateTaskOnServer(taskId, {
        title: newTitle,
        description: newDescription,
        status: task.status,
        category: newCategory,
      });
      if (!updated) {
        showToast("Could not save task");
        return;
      }
    }

    updateTaskLocal(taskId, {
      title: newTitle,
      description: newDescription,
      category: newCategory,
    });

    closeTaskDetailPanel();
    renderColumn(task.status);
    renderCategorySidebar();
  } finally {
    showLoadingIndicator(false);
  }
}

function setupTaskDetailPanel() {
  document
    .getElementById("task-detail-cancel")
    .addEventListener("click", closeTaskDetailPanel);

  document
    .getElementById("task-detail-done")
    .addEventListener("click", handleTaskDetailDone);

  document
    .getElementById("task-detail-overlay")
    .addEventListener("click", (event) => {
      if (event.target === document.getElementById("task-detail-overlay")) {
        closeTaskDetailPanel();
      }
    });

  document.querySelectorAll(".category-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      taskDetailState.selectedCategory =
        taskDetailState.selectedCategory === btn.dataset.category
          ? ""
          : btn.dataset.category;

      document.querySelectorAll(".category-option").forEach((b) => {
        b.classList.toggle(
          "selected",
          b.dataset.category === taskDetailState.selectedCategory,
        );
      });
    });
  });
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task";
  taskElement.draggable = true;
  taskElement.dataset.taskId = task.id;
  return taskElement;
}

function renderTaskElement(task) {
  const taskElement = createTaskElement(task);

  const titleContainer = document.createElement("div");
  const isEditingTitle =
    uiState.editingTaskId === task.id && uiState.editingField === "title";

  if (isEditingTitle) {
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Task title";
    titleInput.value = uiState.editingValue;
    titleInput.dataset.role = "title";
    titleInput.autocomplete = "off";

    titleInput.addEventListener("input", () => {
      uiState.editingValue = titleInput.value;
    });

    let ignoreBlur = false;
    titleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        ignoreBlur = true;
        handleTaskSaveTitle(task.id, uiState.editingValue);
      }
    });

    titleInput.addEventListener("blur", () => {
      if (ignoreBlur) {
        ignoreBlur = false;
        return;
      }
      handleTaskSaveTitle(task.id, uiState.editingValue);
    });

    titleContainer.appendChild(titleInput);
  } else {
    titleContainer.textContent = task.title || "Untitled task";
    titleContainer.addEventListener("dblclick", () => {
      setEditingState(task.id, "title");
      renderColumn(task.status);
    });
  }

  taskElement.appendChild(titleContainer);

  const descriptionContainer = document.createElement("div");
  descriptionContainer.className = "task-description";
  const isEditingDescription =
    uiState.editingTaskId === task.id && uiState.editingField === "description";

  if (isEditingDescription) {
    const descriptionTextarea = document.createElement("textarea");
    descriptionTextarea.value = uiState.editingValue;
    descriptionTextarea.dataset.role = "description";

    descriptionTextarea.addEventListener("input", () => {
      uiState.editingValue = descriptionTextarea.value;
    });

    descriptionTextarea.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        clearEditingState();
        renderColumn(task.status);
      }
    });

    descriptionTextarea.addEventListener("blur", () => {
      handleTaskSaveDescription(task.id, uiState.editingValue);
    });

    descriptionContainer.appendChild(descriptionTextarea);
  } else {
    descriptionContainer.textContent =
      task.description.trim() || "Add a description...";
    descriptionContainer.addEventListener("click", () => {
      setEditingState(task.id, "description");
      renderColumn(task.status);
    });
  }

  taskElement.appendChild(descriptionContainer);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "task-buttons";
  const leftButtons = document.createElement("div");
  leftButtons.className = "task-buttons-left";
  const rightButtons = document.createElement("div");
  rightButtons.className = "task-buttons-right";

  if (task.status === "inProgress" || task.status === "completed") {
    const backBtn = document.createElement("button");
    backBtn.className = "btn-back";
    backBtn.textContent = "← Back";
    backBtn.addEventListener(
      "click",
      withLocalActionGuard(backBtn, async () => {
        const taskRecord = findTask(task.id);
        if (!taskRecord) return;
        const targetStatus =
          taskRecord.status === "inProgress" ? "active" : "inProgress";
        await handleTaskStatusChange(task.id, targetStatus);
      }),
    );
    leftButtons.appendChild(backBtn);
  }

  if (task.status === "active" || task.status === "inProgress") {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn-next";
    nextBtn.textContent = "Next →";
    nextBtn.addEventListener(
      "click",
      withLocalActionGuard(nextBtn, async () => {
        const taskRecord = findTask(task.id);
        if (!taskRecord) return;
        const targetStatus =
          taskRecord.status === "active" ? "inProgress" : "completed";
        await handleTaskStatusChange(task.id, targetStatus);
      }),
    );
    rightButtons.appendChild(nextBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "cross-button";
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.addEventListener(
    "click",
    withLocalActionGuard(deleteBtn, async () => {
      await handleTaskDelete(task.id);
    }),
  );
  rightButtons.appendChild(deleteBtn);

  buttonContainer.appendChild(leftButtons);
  buttonContainer.appendChild(rightButtons);
  const bottomRow = document.createElement("div");
  bottomRow.className = "task-bottom-row";

  const categoryLeft = document.createElement("div");

  const taskCategory = task.category || "";

  if (taskCategory && CATEGORY_COLORS[taskCategory]) {
    const dot = document.createElement("span");
    dot.className = "task-category-dot";
    dot.style.background = CATEGORY_COLORS[taskCategory];
    dot.title = taskCategory;
    dot.style.cursor = "pointer";
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      openTaskDetailPanel(task.id);
    });
    categoryLeft.appendChild(dot);
  } else {
    const setCategoryBtn = document.createElement("button");
    setCategoryBtn.className = "task-set-category-btn";
    setCategoryBtn.textContent = "Set category";
    setCategoryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openTaskDetailPanel(task.id);
    });
    categoryLeft.appendChild(setCategoryBtn);
  }

  bottomRow.appendChild(categoryLeft);
  bottomRow.appendChild(buttonContainer);
  taskElement.appendChild(bottomRow);

  return taskElement;
}

async function handleTaskSaveTitle(taskId, rawTitle) {
  showLoadingIndicator(true);
  try {
    const title = String(rawTitle).trim();
    const task = findTask(taskId);
    if (!task) {
      showLoadingIndicator(false);
      return;
    }

    if (!title) {
      showToast("Task title cannot be blank");
      setEditingState(task.id, "title");
      renderColumn(task.status);
      showLoadingIndicator(false);
      return;
    }

    if (isTemporaryTaskId(taskId)) {
      const serverTask = await createTaskOnServer({
        title,
        description: task.description,
        status: task.status,
        username: authStore.currentUser,
      });

      if (!serverTask) {
        showToast("Could not save task");
        setEditingState(task.id, "title");
        renderColumn(task.status);
        return;
      }

      replaceTask(task.id, serverTask);
      clearEditingState();
      renderColumn(serverTask.status);
      return;
    }

    const updated = await updateTaskOnServer(task.id, {
      title,
      description: task.description,
      status: task.status,
    });

    if (!updated) {
      showToast("Could not save task");
      setEditingState(task.id, "title");
      renderColumn(task.status);
      return;
    }

    updateTaskLocal(task.id, { title });
    clearEditingState();
    renderColumn(task.status);
  } finally {
    showLoadingIndicator(false);
  }
}

async function handleTaskSaveDescription(taskId, rawDescription) {
  showLoadingIndicator(true);
  try {
    const description = String(rawDescription);
    const task = findTask(taskId);
    if (!task) {
      showLoadingIndicator(false);
      return;
    }

    if (isTemporaryTaskId(taskId)) {
      updateTaskLocal(task.id, { description });
      clearEditingState();
      renderColumn(task.status);
      return;
    }

    const updated = await updateTaskOnServer(task.id, {
      title: task.title,
      description,
      status: task.status,
    });

    if (!updated) {
      showToast("Could not save task");
      setEditingState(task.id, "description");
      renderColumn(task.status);
      return;
    }

    updateTaskLocal(task.id, { description });
    clearEditingState();
    renderColumn(task.status);
  } finally {
    showLoadingIndicator(false);
  }
}

async function handleTaskStatusChange(taskId, newStatus) {
  const task = findTask(taskId);
  if (!task || task.status === newStatus || !validateStatus(newStatus)) return;

  if (authStore.taskInProgress.has(taskId)) return;
  authStore.taskInProgress.add(taskId);

  if (newStatus === "active") {
    const activeCount = tasksByStatus("active").length;
    if (activeCount >= state.maxActiveTasks) {
      showToast("You've reached the maximum of 20 tasks");
      authStore.taskInProgress.delete(taskId);
      return;
    }
  }

  const previousStatus = task.status;

  // Preserve current editing value
  if (uiState.editingTaskId === taskId) {
    updateTaskLocal(taskId, {
      [uiState.editingField]: uiState.editingValue,
    });
  }

  showLoadingIndicator(true);
  try {
    if (isTemporaryTaskId(taskId)) {
      updateTaskLocal(task.id, { status: newStatus });
      clearEditingState();
      renderColumn(previousStatus);
      renderColumn(newStatus);
      return;
    }

    const updated = await updateTaskOnServer(task.id, {
      title: task.title,
      description: task.description,
      status: newStatus,
    });

    if (!updated) {
      showToast("Could not update task status");
      return;
    }

    updateTaskLocal(task.id, { status: newStatus });
    clearEditingState();
    renderColumn(previousStatus);
    renderColumn(newStatus);
  } finally {
    authStore.taskInProgress.delete(taskId);
    showLoadingIndicator(false);
  }
}

async function handleTaskDelete(taskId) {
  const task = findTask(taskId);
  if (!task) return;

  if (authStore.taskInProgress.has(taskId)) return;
  authStore.taskInProgress.add(taskId);

  showLoadingIndicator(true);
  try {
    if (!isTemporaryTaskId(taskId)) {
      const deleted = await deleteTaskOnServer(task.id);
      if (!deleted) {
        showToast("Could not delete task");
        return;
      }
    }

    const taskStatus = task.status;
    removeTask(task.id);
    renderColumn(taskStatus);
    renderCategorySidebar();
  } finally {
    authStore.taskInProgress.delete(taskId);
    showLoadingIndicator(false);
  }
}

async function createTaskOnServer(taskData) {
  if (!authStore.currentUser) return null;
  try {
    const response = await safeFetch(
      `${Api.base}${Api.tasks}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      },
      "tasks",
    );
    if (!response) return null;
    const result = await response.json();
    return {
      id: String(result.id),
      title: result.title,
      description: result.description,
      status: result.status,
      username: result.username,
      category: result.category,
    };
  } catch (error) {
    return null;
  }
}

async function updateTaskOnServer(taskId, data) {
  try {
    const response = await safeFetch(
      `${Api.base}${Api.tasks}/${encodeURIComponent(taskId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "tasks",
    );
    return Boolean(response);
  } catch (error) {
    return false;
  }
}

async function deleteTaskOnServer(taskId) {
  try {
    const response = await safeFetch(
      `${Api.base}${Api.tasks}/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
      },
      "tasks",
    );
    return Boolean(response);
  } catch (error) {
    return false;
  }
}

async function fetchUsers() {
  try {
    const response = await safeFetch(`${Api.base}${Api.users}`, {}, "auth");
    if (!response) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

async function fetchTasks() {
  if (!authStore.currentUser) return;
  const requestToken = Symbol();
  const initialSessionVersion = authStore.sessionVersion;
  authStore.loadRequestToken = requestToken;

  createAbortController("tasks");

  try {
    const query = new URLSearchParams({
      username: authStore.currentUser,
    });
    const response = await safeFetch(
      `${Api.base}${Api.tasks}?${query}`,
      {},
      "tasks",
    );
    if (
      !response ||
      authStore.loadRequestToken !== requestToken ||
      authStore.sessionVersion !== initialSessionVersion
    )
      return;

    const tasks = await response.json();
    state.tasks = tasks.map((task) => ({
      id: String(task.id),
      title: task.title,
      description: task.description,
      status: task.status,
      username: task.username,
      category: task.category,
    }));
    renderBoard();
  } catch (error) {
    // Ignore network errors
  } finally {
    clearAbortController("tasks");
    authStore.loadRequestToken = null;
  }
}

async function loadTasksFromAPI() {
  await fetchTasks();
}

function validatePassword(password, confirm) {
  const lengthValid = password.length >= 6;
  const capitalValid = /[A-Z]/.test(password);
  const matchValid = password === confirm;

  const lengthRule = document.getElementById("rule-length");
  const capitalRule = document.getElementById("rule-capital");
  const matchRule = document.getElementById("rule-match");

  if (lengthRule) {
    lengthRule.classList.toggle("valid", lengthValid);
  }
  if (capitalRule) {
    capitalRule.classList.toggle("valid", capitalValid);
  }
  if (matchRule) {
    matchRule.classList.toggle("valid", matchValid);
  }

  return lengthValid && capitalValid && matchValid;
}

async function handleLogin() {
  if (authStore.authRequestToken) return;
  showLoadingIndicator(true);
  const requestToken = Symbol();
  const initialSessionVersion = authStore.sessionVersion;
  authStore.authRequestToken = requestToken;
  dom.loginError.textContent = "";

  const username = dom.loginUsername.value.trim();
  const password = dom.loginPassword.value;

  if (!username) {
    dom.loginError.textContent = "Username is required";
    authStore.authRequestToken = null;
    showLoadingIndicator(false);
    return;
  }

  if (!password) {
    dom.loginError.textContent = "Password is required";
    authStore.authRequestToken = null;
    showLoadingIndicator(false);
    return;
  }

  createAbortController("auth");

  try {
    const users = await fetchUsers();
    if (
      !users ||
      authStore.authRequestToken !== requestToken ||
      authStore.sessionVersion !== initialSessionVersion
    )
      return;

    const user = users.find((entry) => entry.username === username);
    if (!user) {
      dom.loginError.textContent = "User not found, please sign up";
      return;
    }

    if (user.password !== password) {
      dom.loginError.textContent = "Incorrect password";
      return;
    }

    saveSession(username);
    await loadTasksFromAPI();
    renderBoard();
    hideSplash();
  } catch (error) {
    if (error.name !== "AbortError") {
      dom.loginError.textContent = "Something went wrong";
    }
  } finally {
    authStore.authRequestToken = null;
    clearAbortController("auth");
    showLoadingIndicator(false);
  }
}

async function addSuggestionTask(title) {
  if (!authStore.currentUser) return null;
  try {
    const response = await safeFetch(
      `${Api.base}${Api.tasks}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "",
          status: "active",
          username: authStore.currentUser,
        }),
      },
      "tasks",
    );
    if (!response) return null;
    const task = await response.json();
    return String(task.id);
  } catch (error) {
    return null;
  }
}

function resetSuggestionsPanel() {
  dom.suggestionItems.forEach((item) => {
    item.classList.remove("added");
    const button = item.querySelector(".suggestion-add-btn");
    if (button) button.textContent = "+ Add";
  });
}

function setupSuggestionsPanel() {
  const items = document.querySelectorAll(".suggestion-item");
  items.forEach((item) => {
    const button = item.querySelector(".suggestion-add-btn");
    if (!button) return;

    let addedTaskId = null;

    button.addEventListener("click", async () => {
      if (addedTaskId) {
        const deleted = await deleteTaskOnServer(addedTaskId);
        if (deleted) {
          addedTaskId = null;
          item.classList.remove("added");
          button.textContent = "+ Add";
        } else {
          showToast("Could not remove suggestion");
        }
      } else {
        const title = item.dataset.title;
        const taskId = await addSuggestionTask(title);
        if (taskId) {
          addedTaskId = taskId;
          item.classList.add("added");
          button.textContent = "✓ Added";
        } else {
          showToast("Could not add suggestion");
        }
      }
    });
  });

  dom.suggestionsDone = document.getElementById("suggestions-done");
  if (dom.suggestionsDone) {
    dom.suggestionsDone.addEventListener(
      "click",
      withLocalActionGuard(dom.suggestionsDone, async () => {
        await loadTasksFromAPI();
        renderBoard();
        hideSplash();
      }),
    );
  }
}

async function handleSignup() {
  if (authStore.authRequestToken) return;
  showLoadingIndicator(true);
  const requestToken = Symbol();
  const initialSessionVersion = authStore.sessionVersion;
  authStore.authRequestToken = requestToken;
  dom.signupError.textContent = "";

  const username = dom.signupUsername.value.trim();
  const password = dom.signupPassword.value;
  const confirm = dom.signupConfirm.value;

  if (!username) {
    dom.signupError.textContent = "Username is required";
    authStore.authRequestToken = null;
    showLoadingIndicator(false);
    return;
  }

  if (!validatePassword(password, confirm)) {
    dom.signupError.textContent = "Please meet all password requirements";
    authStore.authRequestToken = null;
    showLoadingIndicator(false);
    return;
  }

  createAbortController("auth");

  try {
    const users = await fetchUsers();
    if (
      !users ||
      authStore.authRequestToken !== requestToken ||
      authStore.sessionVersion !== initialSessionVersion
    )
      return;

    if (users.some((entry) => entry.username === username)) {
      dom.signupError.textContent = "Username taken, please log in";
      return;
    }

    const createResponse = await safeFetch(
      `${Api.base}${Api.users}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      },
      "auth",
    );
    if (!createResponse) {
      dom.signupError.textContent = "Something went wrong";
      return;
    }

    const welcomeResponse = await safeFetch(
      `${Api.base}${Api.tasks}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Welcome",
          description: "Your first task. Click Next to move it forward.",
          status: "active",
          username,
        }),
      },
      "tasks",
    );
    if (!welcomeResponse) {
      dom.signupError.textContent = "Something went wrong";
      return;
    }

    saveSession(username);
    resetSuggestionsPanel();
    showPanel("suggestions-panel");
    setupSuggestionsPanel();
  } catch (error) {
    if (error.name !== "AbortError") {
      dom.signupError.textContent = "Something went wrong";
    }
  } finally {
    authStore.authRequestToken = null;
    clearAbortController("auth");
    showLoadingIndicator(false);
  }
}

function setupAuthListeners() {
  document
    .getElementById("btn-goto-login")
    .addEventListener("click", () => showPanel("login-panel"));
  document
    .getElementById("btn-goto-signup")
    .addEventListener("click", () => showPanel("signup-panel"));
  document
    .getElementById("login-goto-signup")
    .addEventListener("click", () => showPanel("signup-panel"));
  document
    .getElementById("signup-goto-login")
    .addEventListener("click", () => showPanel("login-panel"));

  document
    .getElementById("login-submit")
    .addEventListener("click", handleLogin);
  document
    .getElementById("signup-submit")
    .addEventListener("click", handleSignup);

  dom.loginPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleLogin();
  });

  dom.signupConfirm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSignup();
  });

  dom.signupPassword.addEventListener("input", () => {
    validatePassword(dom.signupPassword.value, dom.signupConfirm.value);
  });
  dom.signupConfirm.addEventListener("input", () => {
    validatePassword(dom.signupPassword.value, dom.signupConfirm.value);
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    if (authStore.abortControllers.auth)
      authStore.abortControllers.auth.abort();
    if (authStore.abortControllers.tasks)
      authStore.abortControllers.tasks.abort();
    clearSession();
    state.tasks = [];
    authStore.taskRequestTokens = {};
    authStore.taskInProgress.clear();
    clearEditingState();
    renderBoard();
    resetSuggestionsPanel();
    showSplash();
    showPanel("landing-panel");
  });
}

function setupCreateTaskListener() {
  dom.createTaskButton = document.getElementById("create-task");
  dom.createTaskButton.addEventListener(
    "click",
    withLocalActionGuard(dom.createTaskButton, addLocalTask),
  );
}

function setupCursorTracking() {
  document.addEventListener("mousemove", (event) => {
    dom.cursor.style.left = `${event.clientX}px`;
    dom.cursor.style.top = `${event.clientY}px`;
  });
  document.addEventListener("mousedown", () => {
    dom.cursor.classList.add("clicking");
    dom.cursor.classList.remove("ripple");
    void dom.cursor.offsetWidth;
    dom.cursor.classList.add("ripple");
  });
  document.addEventListener("mouseup", () => {
    dom.cursor.classList.remove("clicking");
    setTimeout(() => dom.cursor.classList.remove("ripple"), 400);
  });
}

function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling;
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.textContent = isHidden ? "Hide" : "Show";
      button.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password",
      );
    });
  });
}

function setupDragHandlers() {
  document.addEventListener("dragstart", (event) => {
    const taskElement = event.target.closest(".task");
    if (!taskElement) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", taskElement.dataset.taskId);
    taskElement.style.opacity = "0.4";
  });

  document.addEventListener("dragend", (event) => {
    const taskElement = event.target.closest(".task");
    if (!taskElement) return;
    taskElement.style.opacity = "1";
  });

  [
    { el: document.getElementById("todo-column"), status: "active" },
    { el: document.getElementById("doing-column"), status: "inProgress" },
    { el: document.getElementById("done-column"), status: "completed" },
  ].forEach(({ el, status }) => {
    el.addEventListener("dragover", (event) => {
      event.preventDefault();
      el.classList.add("drag-over");
    });

    el.addEventListener("dragleave", (event) => {
      if (!el.contains(event.relatedTarget)) {
        el.classList.remove("drag-over");
      }
    });

    el.addEventListener("drop", async (event) => {
      event.preventDefault();
      el.classList.remove("drag-over");
      const taskId = event.dataTransfer.getData("taskId");
      if (!taskId) return;
      await handleTaskStatusChange(taskId, status);
    });
  });
}

function withLocalActionGuard(button, handler) {
  return async (...args) => {
    if (!button || button.disabled) return;
    button.disabled = true;
    try {
      await handler(...args);
    } finally {
      button.disabled = false;
    }
  };
}

async function renderInitialState() {
  dom.activeTasksContainer = document.getElementById("active-tasks");
  dom.inprogressTasksContainer = document.getElementById("inprogress-tasks");
  dom.completedTasksContainer = document.getElementById("completed-tasks");
  dom.createTaskButton = document.getElementById("create-task");
  dom.toastContainer = document.getElementById("toast-container");
  dom.cursor = document.getElementById("custom-cursor");
  dom.loadingIndicator = document.getElementById("loading-indicator");
  dom.splash = document.getElementById("splash");
  dom.pageContainer = document.querySelector(".page-container");
  dom.loginError = document.getElementById("login-error");
  dom.signupError = document.getElementById("signup-error");
  dom.loginUsername = document.getElementById("login-username");
  dom.loginPassword = document.getElementById("login-password");
  dom.signupUsername = document.getElementById("signup-username");
  dom.signupPassword = document.getElementById("signup-password");
  dom.signupConfirm = document.getElementById("signup-confirm");
  dom.landingPanel = document.getElementById("landing-panel");
  dom.categorySidebar = document.getElementById("category-sidebar");
  dom.categoryList = document.getElementById("category-list");
  setupCreateTaskListener();
  setupCursorTracking();
  setupPasswordToggles();
  setupDragHandlers();
  setupAuthListeners();
  setupTaskDetailPanel();
  setupCategoryFocusView();
  setupColumnFocusView();
  loadSession();

  if (authStore.currentUser) {
    await loadTasksFromAPI();
    renderBoard();
    hideSplash();
  } else {
    showPanel("landing-panel");
  }
}

async function safeFetch(url, options = {}, abortKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return null;
    }
    return null;
  }
}

window.addEventListener("load", renderInitialState);
window.setupSuggestionsPanel = setupSuggestionsPanel;
