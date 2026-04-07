"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
type UserToken = {
  username: string;
  email: string;
  exp?: number;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserToken | null>(null);
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<UserToken>(token);

      // Optional: Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUser(decoded);
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return null; // prevent flashing content before redirect
  }

  return (
    <div className="min-h-screen py-20 flex bg-gray-100 dark:bg-neutral-950 transition-colors duration-300">

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}



      <div className="flex-1 flex flex-col">


        <main className="p-6 md:p-10 space-y-8">


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                Username
              </h3>
              <p className="text-xl font-semibold text-gray-800 dark:text-white mt-2">
                {user.username}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                Email
              </h3>
              <p className="text-xl font-semibold text-gray-800 dark:text-white mt-2 break-all">
                {user.email}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm">
                Status
              </h3>
              <p className="text-xl font-semibold text-green-500 mt-2">
                Active
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-10 border border-gray-100 dark:border-neutral-800 space-y-8">

            {/* Notes Upload Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Upload Study Notes
                </h2>
                <p className="text-indigo-100 mt-2">
                  Add new notes, manage uploads, and organize content professionally.
                </p>
              </div>

              <Link
                href="/admin/notesupload"
                className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Upload Notes →
              </Link>

            </div>

            {/* Latest Updates Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Latest Updates
                </h2>
                <p className="text-emerald-100 mt-2">
                  Check recent announcements, updates, and important notifications.
                </p>
              </div>

              <Link
                href="/admin/latestupdate"
                className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Add Updates →
              </Link>

            </div>

            {/* Latest Exam Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Latest Exams Updates
                </h2>
                <p className="text-emerald-100 mt-2">
                  add latest exams and update and edit delete
                </p>
              </div>

              <Link
                href="/admin/newexams"
                className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Add/Update/Remove →
              </Link>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}