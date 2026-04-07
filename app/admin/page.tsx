"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type UserToken = {
  username: string;
  email: string;
  exp?: number;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserToken | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<UserToken>(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  return (
    <div
      className={`min-h-screen px-6 md:px-16 py-12 transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* ================= Admin Header ================= */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Admin Panel
        </h1>
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Welcome back, {user.username}
        </p>
      </div>

      {/* ================= User Info Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div
          className={`p-6 rounded-xl shadow ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="text-sm opacity-70">Username</p>
          <h3 className="text-lg font-semibold mt-2">
            {user.username}
          </h3>
        </div>

        <div
          className={`p-6 rounded-xl shadow ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="text-sm opacity-70">Email</p>
          <h3 className="text-lg font-semibold mt-2">
            {user.email}
          </h3>
        </div>

        <div
          className={`p-6 rounded-xl shadow ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <p className="text-sm opacity-70">Status</p>
          <h3 className="text-lg font-semibold mt-2 text-green-500">
            Active
          </h3>
        </div>
      </div>

      {/* ================= 2 Column Action Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manage Exams */}
        <div
          className={`p-8 rounded-2xl shadow-lg transition hover:scale-105 duration-300 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-3">
            Manage Exams
          </h2>
          <p className={darkMode ? "text-gray-400 mb-6" : "text-gray-600 mb-6"}>
            Add, edit or remove exam questions.
          </p>
          <button
            onClick={() => router.push("/admin/newexams")}
            className={`px-6 py-2 rounded-lg font-semibold cursor-pointer transition ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800 cursor-pointer"
            }`}
          >
            Browse →
          </button>
        </div>

        {/* Upload Notes */}
        <div
          className={`p-8 rounded-2xl shadow-lg transition hover:scale-105 duration-300 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-3">
            Upload Notes
          </h2>
          <p className={darkMode ? "text-gray-400 mb-6" : "text-gray-600 mb-6"}>
            Add study materials for students.
          </p>
          <button
            onClick={() => router.push("/admin/notesupload")}
            className={`px-6 py-2 rounded-lg font-semibold cursor-pointer transition ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Browse →
          </button>
        </div>

        {/* Updates */}
        <div
          className={`p-8 rounded-2xl shadow-lg transition hover:scale-105 duration-300 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-3">
            Latest Updates
          </h2>
          <p className={darkMode ? "text-gray-400 mb-6" : "text-gray-600 mb-6"}>
            Post announcements & notifications.
          </p>
          <button
            onClick={() => router.push("/admin/latestupdate")}
            className={`px-6 py-2 rounded-lg font-semibold cursor-pointer transition ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800 cursor-pointer"
            }`}
          >
            Browse →
          </button>
        </div>
        <div
          className={`p-8 rounded-2xl shadow-lg transition hover:scale-105 duration-300 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-3">
       Docx to json Converter
          </h2>
          <p className={darkMode ? "text-gray-400 mb-6" : "text-gray-600 mb-6"}>
          First convert your DOCX file into a JSON format Using the DOCX Converter Then Download and Save The Generated JSON File, Then Upload It Here To Add The Exam.
          </p>
          <button
            onClick={() => router.push("/admin/docx")}
            className={`px-6 py-2 rounded-lg font-semibold cursor-pointer transition ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800 cursor-pointer"
            }`}
          >
            Browse →
          </button>
        </div>
      </div>
    </div>
  );
}