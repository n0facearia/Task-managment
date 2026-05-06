"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const panelVariants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
};

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
    const token = localStorage.getItem("authToken");
    if (token) {
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
      await api.login(username, password);
      setSplashVisible(false);
      onAuthComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  }, [loading, onAuthComplete]);

  const handleSignup = useCallback(async () => {
    if (loading) return;
    const username = signupUsernameRef.current?.value.trim();
    const password = signupPasswordRef.current?.value;
    const confirm = signupConfirmRef.current?.value;

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
      await api.signup(username, password);

      await api.createTask({
        title: "Welcome",
        description: "Your first task. Click Next to move it forward.",
        status: "active",
        category: "",
      });

      setAddedSuggestions(new Set());
      setPanel("suggestions");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setSignupError(message);
    } finally {
      setLoading(false);
    }
  }, [loading, passwordChecks]);

  const handleAddSuggestion = useCallback(
    async (index: number, title: string) => {
      if (addedSuggestions.has(index)) return;

      try {
        await api.createTask({
          title,
          description: "",
          status: "active",
          category: "",
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
    api.logout();
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
      <AnimatePresence mode="wait">
        {panel === "landing" && (
          <motion.div key="landing" className="auth-panel" id="landing-panel" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <div className="splash-logo"></div>
            <div className="splash-title">Task App</div>
            <div className="flex flex-col items-center gap-2.5 w-full mt-2">
              <button
                id="btn-goto-signup"
                className="w-full py-2.5 border-none rounded-lg bg-accent text-[#1c1c1c] text-sm font-semibold font-inherit transition-colors duration-150 hover:bg-accent-hover"
                onClick={() => setPanel("signup")}
              >
                Sign Up
              </button>
              <button
                id="btn-goto-login"
                className="w-full py-2.5 border border-[#333] rounded-lg bg-transparent text-[#aaa] text-sm font-medium font-inherit transition-all duration-150 hover:border-[#555] hover:text-[#e6e6e6]"
                onClick={() => setPanel("login")}
              >
                Log In
              </button>
            </div>
          </motion.div>
        )}

        {panel === "signup" && (
          <motion.div key="signup" className="auth-panel" id="signup-panel" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <h2 className="auth-heading">Create account</h2>
            <input
              ref={signupUsernameRef}
              id="signup-username"
              type="text"
              placeholder="Username"
              autoComplete="off"
              className="w-full bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2.5 text-[#e6e6e6] text-sm font-inherit outline-none box-border transition-colors duration-150 focus:border-accent"
            />
            <div className="password-wrapper">
              <input
                ref={signupPasswordRef}
                id="signup-password"
                type="password"
                placeholder="Password"
                className="w-full pr-16 bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2.5 text-[#e6e6e6] text-sm font-inherit outline-none box-border transition-colors duration-150 focus:border-accent"
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
                className="w-full pr-16 bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2.5 text-[#e6e6e6] text-sm font-inherit outline-none box-border transition-colors duration-150 focus:border-accent"
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
            <ul className="list-none p-0 m-0 w-full flex flex-col gap-1">
              <li id="rule-length" className={`text-xs relative transition-colors duration-150 flex items-center gap-2 ${passwordChecks.length ? "text-[#66bb6a]" : "text-[#555]"}`}>
                <span className="w-4 text-center">{passwordChecks.length ? "✓" : "✕"}</span>
                At least 6 characters
              </li>
              <li id="rule-capital" className={`text-xs relative transition-colors duration-150 flex items-center gap-2 ${passwordChecks.capital ? "text-[#66bb6a]" : "text-[#555]"}`}>
                <span className="w-4 text-center">{passwordChecks.capital ? "✓" : "✕"}</span>
                At least one capital letter
              </li>
              <li id="rule-match" className={`text-xs relative transition-colors duration-150 flex items-center gap-2 ${passwordChecks.match ? "text-[#66bb6a]" : "text-[#555]"}`}>
                <span className="w-4 text-center">{passwordChecks.match ? "✓" : "✕"}</span>
                Passwords match
              </li>
            </ul>
            <span id="signup-error" className="text-xs text-[#e57373] m-0 min-h-[16px] text-center block w-full">
              {signupError}
            </span>
            <button
              id="signup-submit"
              className="w-full bg-accent border-none rounded-lg text-[#1c1c1c] text-sm font-semibold font-inherit py-2.5 transition-colors duration-150 hover:bg-accent-hover"
              onClick={handleSignup}
              disabled={loading}
            >
              Create Account
            </button>
            <button
              id="signup-goto-login"
              className="bg-none border-none text-[#555] text-xs font-inherit py-1 transition-colors duration-150 hover:text-[#999]"
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
          <motion.div key="login" className="auth-panel" id="login-panel" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <h2 className="auth-heading">Welcome back</h2>
            <input
              ref={loginUsernameRef}
              id="login-username"
              type="text"
              placeholder="Username"
              autoComplete="off"
              className="w-full bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2.5 text-[#e6e6e6] text-sm font-inherit outline-none box-border transition-colors duration-150 focus:border-accent"
            />
            <div className="password-wrapper">
              <input
                ref={loginPasswordRef}
                id="login-password"
                type="password"
                placeholder="Password"
                className="w-full pr-16 bg-[#1f1f1f] border border-[#333] rounded-lg px-3 py-2.5 text-[#e6e6e6] text-sm font-inherit outline-none box-border transition-colors duration-150 focus:border-accent"
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
            <span id="login-error" className="text-xs text-[#e57373] m-0 min-h-[16px] text-center block w-full">
              {loginError}
            </span>
            <button
              id="login-submit"
              className="w-full bg-accent border-none rounded-lg text-[#1c1c1c] text-sm font-semibold font-inherit py-2.5 transition-colors duration-150 hover:bg-accent-hover"
              onClick={handleLogin}
              disabled={loading}
            >
              Log In
            </button>
            <button
              id="login-goto-signup"
              className="bg-none border-none text-[#555] text-xs font-inherit py-1 transition-colors duration-150 hover:text-[#999]"
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
          <motion.div key="suggestions" className="auth-panel" id="suggestions-panel" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <h2 className="auth-heading">Quick start</h2>
            <p className="text-sm text-[#666] m-0 text-center">Add some tasks to get started</p>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTIONS.map((title, index) => (
                <div
                  key={title}
                  className={`flex items-center justify-between bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg px-3 py-2.5 transition-colors duration-150 ${addedSuggestions.has(index) ? "border-accent opacity-50" : ""}`}
                  data-title={title}
                >
                  <span className="text-sm text-[#e6e6e6]">{title}</span>
                  <button
                    className={`bg-transparent border border-[#333] rounded-lg text-[#888] text-xs font-inherit px-2.5 py-1 transition-all duration-150 whitespace-nowrap hover:border-accent hover:text-accent ${addedSuggestions.has(index) ? "border-accent text-accent pointer-events-none" : ""}`}
                    onClick={() => handleAddSuggestion(index, title)}
                  >
                    {addedSuggestions.has(index) ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              ))}
            </div>
            <button
              id="suggestions-done"
              className="w-full bg-accent border-none rounded-lg text-[#1c1c1c] text-sm font-semibold font-inherit py-2.5 transition-colors duration-150 hover:bg-accent-hover"
              onClick={handleSuggestionsDone}
            >
              Lets go
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
