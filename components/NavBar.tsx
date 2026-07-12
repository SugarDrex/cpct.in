"use client";

import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import { BiGridAlt } from "react-icons/bi";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { IoPerson } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";

type UserToken = {
  username: string;
  email: string;
  role: string;
};

const desktopLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/cpct-about" },
  { name: "Notes", href: "/cpct-notes" },
  { name: "Typing-Test", href: "/cpct-practice" },
  { name: "Contact", href: "/cpct-in-contact" },
];

// Runs before the browser paints on the client, which removes the
// "flash of logged-out state" you get with a plain useEffect.
// Falls back to useEffect on the server so Next.js doesn't warn.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Dispatch this event right after you set/remove the token wherever
// login/logout happens, e.g. in your login page:
//   localStorage.setItem("token", token);
//   window.dispatchEvent(new Event(AUTH_EVENT));
export const AUTH_EVENT = "cpct-auth-change";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserToken | null>(null);

  const readUserFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setUser(jwtDecode<UserToken>(token));
    } catch {
      setUser(null);
    }
  }, []);

  // Read once, synchronously, before paint - removes the Login/Admin
  // button flicker on first load.
  useIsomorphicLayoutEffect(() => {
    readUserFromToken();
  }, [readUserFromToken]);

  // Keep the navbar in sync the instant login/logout happens anywhere:
  // - "storage" fires when the token changes in another tab
  // - AUTH_EVENT fires in the SAME tab (you dispatch it manually, see above)
  useEffect(() => {
    window.addEventListener("storage", readUserFromToken);
    window.addEventListener(AUTH_EVENT, readUserFromToken);
    return () => {
      window.removeEventListener("storage", readUserFromToken);
      window.removeEventListener(AUTH_EVENT, readUserFromToken);
    };
  }, [readUserFromToken]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event(AUTH_EVENT));
    setUser(null);
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="
        fixed top-0 w-full z-50
        bg-white/90 dark:bg-gray-900
        backdrop-blur-md
        shadow-md dark:shadow-xl
      "
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 group md:ml-15 sm:-ml-20">
          <Image src="/cpct-logo.jpg" alt="CPCT Logo" className="rounded-md" width={40} height={40} />
          <div>
            <p className="font-semibold text-slate-700 tracking-[0.20em] text-lg dark:text-white m-1">
              CPCT.IN
            </p>
            <p className="text-xs tracking-[0.04em] text-indigo-500">
              LET'S PRACTICE
            </p>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-10 tracking-[0.05em]">
          {desktopLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="
                relative dark:text-gray-200
                hover:text-indigo-600
                transition
                after:absolute after:left-0 after:-bottom-2
                after:h-[2px] after:w-0
                after:bg-indigo-500
                hover:after:w-full
                after:transition-all font-semibold
              "
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-red-600 text-white hover:bg-red-500 transition tracking-[0.15em]"
            >
              <IoPerson className="text-xs" />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-indigo-800 text-white hover:bg-blue-500 hover:scale-105 transition tracking-[0.15em]"
            >
              <IoPerson className="text-xs" />
              Login
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-green-700 text-white hover:bg-green-600 transition tracking-[0.15em]"
            >
              Admin
            </Link>
          )}

          {/* THEME TOGGLE - both icons always render; the "dark:" CSS
              variant decides which one shows, so there's no waiting
              on JS/mount at all */}
          <button
            onClick={toggleTheme}
            className="
              p-2 rounded-md border
              hover:bg-gray-100 dark:hover:bg-zinc-800
              transition cursor-pointer
            "
            aria-label="Toggle theme"
          >
            <Sun size={18} className="hidden dark:block" />
            <Moon size={18} className="block dark:hidden" />
          </button>
        </ul>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-3xl dark:text-white"
        >
          <BiGridAlt />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35 }}
              className="
                fixed right-0 top-0 h-screen w-full
                bg-white dark:bg-black
                z-50 shadow-xl
              "
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-3xl dark:text-white"
              >
                <RxCross2 />
              </button>

              <ul className="
                flex flex-col items-center justify-center
                h-full gap-8 text-xl tracking-[0.15em]
              ">
                {desktopLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="hover:text-indigo-600 transition"
                  >
                    {item.name}
                  </Link>
                ))}

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition"
                  >
                    Login
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="px-1 py-2 rounded-full bg-green-700 text-white hover:bg-green-600 transition"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={toggleTheme}
                  className="
                    flex items-center gap-2
                    px-5 py-2 border rounded-md
                    dark:border-zinc-700
                    hover:bg-gray-100 dark:hover:bg-zinc-800
                    transition cursor-pointer border-red-200
                  "
                  aria-label="Toggle theme"
                >
                  <Sun size={38} className="hidden dark:block" />
                  <Moon size={38} className="block dark:hidden" />
                </button>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}