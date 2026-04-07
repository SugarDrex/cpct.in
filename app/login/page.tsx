"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function AdminAuth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const router = useRouter();
 
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
          router.replace("/admin/dashboard");
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [router]);

  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem("token");
      if (token) {
        router.replace("/admin/dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  async function submit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");

      if (mode === "login") {
        localStorage.setItem("token", data.token);
      }

      router.push("/admin/dashboard");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendReset() {
    setResetLoading(true);

    await fetch("/api/auth/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });

    setResetLoading(false);
    setResetDone(true);
  }

  return (
    <div className="py-26 p-5 flex items-center justify-center bg-neutral-100 dark:bg-gray-800 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-[420px] rounded-3xl p-8 shadow-2xl border border-black/5 dark:border-white/10
                   bg-white dark:bg-gray-900 backdrop-blur-xl"
      >
         

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Admin Access
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Secure control panel login
          </p>
        </div>

   

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Email
              </label>
              <input
                placeholder="admin@example.com"
                className="mt-1 w-full p-3 rounded-xl border bg-white dark:bg-black
                           text-neutral-900 dark:text-white
                           border-neutral-300 dark:border-neutral-700
                           focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full p-3 rounded-xl border bg-white dark:bg-black
                           text-neutral-900 dark:text-white
                           border-neutral-300 dark:border-neutral-700
                           focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm px-3 py-2 rounded-xl border
                           bg-red-50 text-red-600 border-red-200
                           dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={submit}
              disabled={loading}
              className="w-full h-12 rounded-xl font-semibold
                         bg-black text-white dark:bg-white dark:text-black
                         shadow-lg disabled:opacity-60
                         flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Login to Dashboard"
                  : "Create Admin Account"}
            </motion.button>

            {mode === "login" && (
              <button
                onClick={() => setShowReset(true)}
                className="text-center text-xs text-indigo-500 hover:underline w-full pt-2 cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* RESET MODAL */}
      <AnimatePresence>
        {showReset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowReset(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl border dark:border-white/10 space-y-4">

                <h2 className="text-xl font-semibold text-center dark:text-white">
                  Reset Password
                </h2>

                {!resetDone ? (
                  <>
                    <input
                      placeholder="Enter your email"
                      className="w-full p-3 rounded-xl border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />

                    <button
                      onClick={sendReset}
                      disabled={resetLoading}
                      className="w-full h-11 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition cursor-pointer"
                    >
                      {resetLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </>
                ) : (
                  <p className="text-green-500 text-center text-sm">
                    If this email exists, a reset link has been sent.
                  </p>
                )}

                <button
                  onClick={() => {
                    setShowReset(false);
                    setResetDone(false);
                  }}
                  className="w-full text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 