"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as api from "../lib/api";
import { useToast } from "./Toast";

type Panel = "landing" | "login" | "signup" | "suggestions";

interface AuthSplashProps {
  onAuthComplete: () => void;
}

const SUGGESTIONS = [
  "Buy groceries",
  "Work on the project",
  "Reply to emails",
  "Go for a walk",
  "Read for 20 minutes",
];

export default function AuthSplash({ onAuthComplete }: AuthSplashProps) {
  const [panel, setPanel] = useState<Panel>("landing");
  const [loading, setLoading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<number>>(new Set());

  const loginUsernameRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const signupUsernameRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmRef = useRef<HTMLInputElement>(null);

  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    capital: false,
    match: false,
  });

  const toast = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("taskapp_user");
    if (storedUser) {
      setSplashVisible(false);
    }
  }, []);

  const validatePassword = useCallback((password: string, confirm: string) => {
    setPasswordChecks({
      length: password.length >= 6,
      capital: /[A-Z]/.test(password),
      match: password === confirm && password.length > 0,
    });
  }, []);

  const handleLogin = useCallback(async () => {
    if (loading) return;
    const username = loginUsernameRef.current?.value.trim();
    const password = loginPasswordRef.current?.value;

    if (!username || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const users = await api.fetchUsers();
      const user = users.find((u) => u.username === username);
      if (!user) {
        setLoginError("Account not found");
        return;
      }
      if (user.password !== password) {
        setLoginError("Incorrect password");
        return;
      }

      localStorage.setItem("taskapp_user", username);
      setSplashVisible(false);
      onAuthComplete();
    } catch {
      setLoginError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [loading, onAuthComplete]);

  const handleSignup = useCallback(async () => {
    if (loading) return;
    const username = signupUsernameRef.current?.value.trim();
    const password = signupPasswordRef.current?.value;
    const confirm = signupConfirmRef.current?.value;

    if (!username) {
      setSignupError("Username is required");
      return;
    }

    if (!username || !password || !confirm) {
      setSignupError("Please fill in all fields");
      return;
    }

    if (!passwordChecks.length || !passwordChecks.capital || !passwordChecks.match) {
      setSignupError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setSignupError("");

    try {
      const users = await api.fetchUsers();
      if (users.some((u) => u.username === username)) {
        setSignupError("Username taken, please log in");
        return;
      }

      await api.createUser({ username, password });

      await api.createTask({
        title: "Welcome",
        description: "Your first task. Click Next to move it forward.",
        status: "active",
        username,
      });

      localStorage.setItem("taskapp_user", username);
      setAddedSuggestions(new Set());
      setPanel("suggestions");
    } catch {
      setSignupError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [loading, passwordChecks]);

  const handleAddSuggestion = useCallback(
    async (index: number, title: string) => {
      if (addedSuggestions.has(index)) return;
      const username = localStorage.getItem("taskapp_user");
      if (!username) return;

      try {
        await api.createTask({
          title,
          description: "",
          status: "active",
          username,
        });
        setAddedSuggestions((prev) => new Set(prev).add(index));
      } catch {
        toast.showToast("Could not add suggestion");
      }
    },
    [addedSuggestions, toast],
  );

  const handleSuggestionsDone = useCallback(async () => {
    setSplashVisible(false);
    onAuthComplete();
  }, [onAuthComplete]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("taskapp_user");
    setSplashVisible(true);
    setPanel("landing");
    setLoginError("");
    setSignupError("");
    setAddedSuggestions(new Set());
    if (loginUsernameRef.current) loginUsernameRef.current.value = "";
    if (loginPasswordRef.current) loginPasswordRef.current.value = "";
    if (signupUsernameRef.current) signupUsernameRef.current.value = "";
    if (signupPasswordRef.current) signupPasswordRef.current.value = "";
    if (signupConfirmRef.current) signupConfirmRef.current.value = "";
    setPasswordChecks({ length: false, capital: false, match: false });
  }, []);

  useEffect(() => {
    window.addEventListener("auth-logout", handleLogout);
    return () => window.removeEventListener("auth-logout", handleLogout);
  }, [handleLogout]);

  if (!splashVisible) return null;

  return (
    <div id="splash">
      {panel === "landing" && (
        <motion.div className="auth-panel panel-enter" id="landing-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="splash-logo"></div>
          <div className="splash-title">Task App</div>
          <div className="landing-buttons">
            <button id="btn-goto-signup" onClick={() => setPanel("signup")}>
              Sign Up
            </button>
            <button id="btn-goto-login" onClick={() => setPanel("login")}>
              Log In
            </button>
          </div>
        </motion.div>
      )}

      {panel === "signup" && (
        <motion.div className="auth-panel panel-enter" id="signup-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h2 className="auth-heading">Create account</h2>
          <input
            ref={signupUsernameRef}
            id="signup-username"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
          <div className="password-wrapper">
            <input
              ref={signupPasswordRef}
              id="signup-password"
              type="password"
              placeholder="Password"
              onChange={(e) =>
                validatePassword(e.target.value, signupConfirmRef.current?.value || "")
              }
            />
            <button
              type="button"
              className="toggle-password"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.type = input.type === "password" ? "text" : "password";
                  (e.currentTarget as HTMLButtonElement).textContent =
                    input.type === "password" ? "Show" : "Hide";
                }
              }}
            >
              Show
            </button>
          </div>
          <div className="password-wrapper">
            <input
              ref={signupConfirmRef}
              id="signup-confirm"
              type="password"
              placeholder="Confirm password"
              onChange={(e) =>
                validatePassword(signupPasswordRef.current?.value || "", e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSignup();
              }}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.type = input.type === "password" ? "text" : "password";
                  (e.currentTarget as HTMLButtonElement).textContent =
                    input.type === "password" ? "Show" : "Hide";
                }
              }}
            >
              Show
            </button>
          </div>
          <ul className="password-rules">
            <li id="rule-length" className={passwordChecks.length ? "valid" : ""}>
              At least 6 characters
            </li>
            <li id="rule-capital" className={passwordChecks.capital ? "valid" : ""}>
              At least one capital letter
            </li>
            <li id="rule-match" className={passwordChecks.match ? "valid" : ""}>
              Passwords match
            </li>
          </ul>
          <span id="signup-error" className="auth-error">
            {signupError}
          </span>
          <button
            id="signup-submit"
            className="auth-btn-primary"
            onClick={handleSignup}
            disabled={loading}
          >
            Create Account
          </button>
          <button
            id="signup-goto-login"
            className="auth-btn-secondary"
            onClick={() => {
              setSignupError("");
              setPanel("login");
            }}
          >
            Already have an account? Log in
          </button>
        </motion.div>
      )}

      {panel === "login" && (
        <motion.div className="auth-panel panel-enter" id="login-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h2 className="auth-heading">Welcome back</h2>
          <input
            ref={loginUsernameRef}
            id="login-username"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
          <div className="password-wrapper">
            <input
              ref={loginPasswordRef}
              id="login-password"
              type="password"
              placeholder="Password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.type = input.type === "password" ? "text" : "password";
                  (e.currentTarget as HTMLButtonElement).textContent =
                    input.type === "password" ? "Show" : "Hide";
                }
              }}
            >
              Show
            </button>
          </div>
          <span id="login-error" className="auth-error">
            {loginError}
          </span>
          <button
            id="login-submit"
            className="auth-btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            Log In
          </button>
          <button
            id="login-goto-signup"
            className="auth-btn-secondary"
            onClick={() => {
              setLoginError("");
              setPanel("signup");
            }}
          >
            Do not have an account? Sign up
          </button>
        </motion.div>
      )}

      {panel === "suggestions" && (
        <motion.div className="auth-panel panel-enter" id="suggestions-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <h2 className="auth-heading">Quick start</h2>
          <p className="suggestions-subtitle">Add some tasks to get started</p>
          <div className="suggestions-list">
            {SUGGESTIONS.map((title, index) => (
              <div
                key={title}
                className={`suggestion-item ${addedSuggestions.has(index) ? "added" : ""}`}
                data-title={title}
              >
                <span className="suggestion-label">{title}</span>
                <button
                  className="suggestion-add-btn"
                  onClick={() => handleAddSuggestion(index, title)}
                >
                  {addedSuggestions.has(index) ? "✓ Added" : "+ Add"}
                </button>
              </div>
            ))}
          </div>
          <button id="suggestions-done" className="auth-btn-primary" onClick={handleSuggestionsDone}>
            Lets go
          </button>
        </motion.div>
      )}
    </div>
  );
}
