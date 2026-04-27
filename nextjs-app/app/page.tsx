export default function HomePage() {
  return (
    <div suppressHydrationWarning>
      <div id="custom-cursor"></div>
      <div id="toast-container"></div>
      <div id="splash">
        <div className="auth-panel" id="landing-panel">
          <div className="splash-logo"></div>
          <div className="splash-title">Task App</div>
          <div className="landing-buttons">
            <button id="btn-goto-signup">Sign Up</button>
            <button id="btn-goto-login">Log In</button>
          </div>
        </div>
        <div className="auth-panel" id="signup-panel">
          <h2 className="auth-heading">Create account</h2>
          <input
            id="signup-username"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
          <div className="password-wrapper">
            <input
              id="signup-password"
              type="password"
              placeholder="Password"
            />
            <button type="button" className="toggle-password">
              Show
            </button>
          </div>
          <div className="password-wrapper">
            <input
              id="signup-confirm"
              type="password"
              placeholder="Confirm password"
            />
            <button type="button" className="toggle-password">
              Show
            </button>
          </div>
          <ul className="password-rules">
            <li id="rule-length">At least 6 characters</li>
            <li id="rule-capital">At least one capital letter</li>
            <li id="rule-match">Passwords match</li>
          </ul>
          <span id="signup-error" className="auth-error"></span>
          <button id="signup-submit" className="auth-btn-primary">
            Create Account
          </button>
          <button id="signup-goto-login" className="auth-btn-secondary">
            Already have an account? Log in
          </button>
        </div>
        <div className="auth-panel" id="login-panel">
          <h2 className="auth-heading">Welcome back</h2>
          <input
            id="login-username"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
          <div className="password-wrapper">
            <input id="login-password" type="password" placeholder="Password" />
            <button type="button" className="toggle-password">
              Show
            </button>
          </div>
          <span id="login-error" className="auth-error"></span>
          <button id="login-submit" className="auth-btn-primary">
            Log In
          </button>
          <button id="login-goto-signup" className="auth-btn-secondary">
            Do not have an account? Sign up
          </button>
        </div>
        <div className="auth-panel" id="suggestions-panel">
          <h2 className="auth-heading">Quick start</h2>
          <p className="suggestions-subtitle">Add some tasks to get started</p>
          <div className="suggestions-list">
            <div className="suggestion-item" data-title="Buy groceries">
              <span className="suggestion-label">Buy groceries</span>
              <button className="suggestion-add-btn">+ Add</button>
            </div>
            <div className="suggestion-item" data-title="Work on the project">
              <span className="suggestion-label">Work on the project</span>
              <button className="suggestion-add-btn">+ Add</button>
            </div>
            <div className="suggestion-item" data-title="Reply to emails">
              <span className="suggestion-label">Reply to emails</span>
              <button className="suggestion-add-btn">+ Add</button>
            </div>
            <div className="suggestion-item" data-title="Go for a walk">
              <span className="suggestion-label">Go for a walk</span>
              <button className="suggestion-add-btn">+ Add</button>
            </div>
            <div className="suggestion-item" data-title="Read for 20 minutes">
              <span className="suggestion-label">Read for 20 minutes</span>
              <button className="suggestion-add-btn">+ Add</button>
            </div>
          </div>
          <button id="suggestions-done" className="auth-btn-primary">
            Lets go
          </button>
        </div>
      </div>
      <div className="page-container">
        <div className="app-header">
          <h1>Task Management App</h1>
          <button id="logout-btn">Log out</button>
        </div>
        <div className="kanban-board">
          <div className="kanban-column" id="todo-column">
            <div className="kanban-column-header">
              <span className="kanban-column-title">Todo</span>
              <button id="create-task">+ New Task</button>
            </div>
            <div className="kanban-tasks" id="active-tasks"></div>
          </div>
          <div className="kanban-column" id="doing-column">
            <div className="kanban-column-header">
              <span className="kanban-column-title">Doing</span>
            </div>
            <div className="kanban-tasks" id="inprogress-tasks"></div>
          </div>
          <div className="kanban-column" id="done-column">
            <div className="kanban-column-header">
              <span className="kanban-column-title">Done</span>
            </div>
            <div className="kanban-tasks" id="completed-tasks"></div>
          </div>
        </div>
      </div>
      <div id="loading-indicator">
        <p id="loading-text">Loading tasks...</p>
      </div>
      <div id="category-sidebar">
        <h3 id="sidebar-title">Categories</h3>
        <div id="category-list"></div>
      </div>
      <div id="task-detail-overlay">
        <div id="task-detail-panel">
          <h2 id="task-detail-heading">Task details</h2>
          <div className="task-detail-field">
            <label>Title</label>
            <input
              id="task-detail-title"
              type="text"
              placeholder="Task title"
            />
          </div>
          <div className="task-detail-field">
            <label>Description</label>
            <textarea
              id="task-detail-description"
              placeholder="Add a description..."
            ></textarea>
          </div>
          <div className="task-detail-field">
            <label>Category</label>
            <div id="task-detail-categories">
              <button className="category-option" data-category="Work">
                <span
                  className="category-dot"
                  style={{ background: "#4A90D9" }}
                ></span>
                Work
              </button>
              <button className="category-option" data-category="Personal">
                <span
                  className="category-dot"
                  style={{ background: "#7ED67E" }}
                ></span>
                Personal
              </button>
              <button className="category-option" data-category="Health">
                <span
                  className="category-dot"
                  style={{ background: "#E8734A" }}
                ></span>
                Health
              </button>
              <button className="category-option" data-category="Learning">
                <span
                  className="category-dot"
                  style={{ background: "#9B6DD6" }}
                ></span>
                Learning
              </button>
              <button className="category-option" data-category="Finance">
                <span
                  className="category-dot"
                  style={{ background: "#E8C84A" }}
                ></span>
                Finance
              </button>
              <button className="category-option" data-category="Other">
                <span
                  className="category-dot"
                  style={{ background: "#A0A0A0" }}
                ></span>
                Other
              </button>
            </div>
          </div>
          <div id="task-detail-actions">
            <button id="task-detail-cancel">Cancel</button>
            <button id="task-detail-done">Done</button>
          </div>
        </div>
      </div>
      <div id="category-focus-overlay">
        <div id="category-focus-panel">
          <div id="category-focus-header">
            <div id="category-focus-title-row">
              <span id="category-focus-dot"></span>
              <h2 id="category-focus-title"></h2>
            </div>
            <button id="category-focus-close">✕</button>
          </div>
          <div id="category-focus-task-count"></div>
          <div id="category-focus-list"></div>
        </div>
      </div>
      <div id="column-focus-overlay">
        <div id="column-focus-panel">
          <div id="column-focus-header">
            <h2 id="column-focus-title"></h2>
            <div id="column-focus-header-right">
              <span id="column-focus-count"></span>
              <button id="column-focus-close">✕</button>
            </div>
          </div>
          <div id="column-focus-list"></div>
        </div>
      </div>
    </div>
  );
}
