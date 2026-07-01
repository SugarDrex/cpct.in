"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import {
  FiUpload,
  FiBell,
  FiFileText,
  FiBook,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiShieldOff,
  FiTrendingUp,
  FiSunrise,
  FiCodesandbox,
} from "react-icons/fi";
import { BsFiletypeDoc } from "react-icons/bs";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const adminActions = [
    {
      title: "Upload Study Notes",
      description: "Add and manage study materials for students",
      icon: <FiUpload className="w-8 h-8" />,
      href: "/admin/notesupload",
      color: "from-blue-600 to-blue-700",
      buttonColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Latest Updates",
      description: "Post announcements and notifications",
      icon: <FiBell className="w-8 h-8" />,
      href: "/admin/latestupdate",
      color: "from-emerald-600 to-emerald-700",
      buttonColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      title: "Exam Updates",
      description: "Add and manage exam schedules and details",
      icon: <FiFileText className="w-8 h-8" />,
      href: "/admin/newexams",
      color: "from-purple-600 to-purple-700",
      buttonColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Topic-Wise Papers",
      description: "Upload and organize previous year papers",
      icon: <FiBook className="w-8 h-8" />,
      href: "/admin/topic-mcq",
      color: "from-orange-600 to-orange-700",
      buttonColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Super Admin Panel",
      description: "Access advanced examination settings",
      icon: <FiCodesandbox className="w-8 h-8" />,
      href: "/admin/superadmin/exam",
      color: "from-red-600 to-red-700",
      buttonColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Analytics",
      description: "View comprehensive system analytics",
      icon: <FiTrendingUp className="w-8 h-8" />,
      href: "/admin/analytics",
      color: "from-indigo-600 to-indigo-700",
      buttonColor: "text-indigo-600",
      borderColor: "border-indigo-200",
    },
    {
      title: "Exam Papers Upload",
      description: "Upload exam papers to Supabase database",
      icon: <BsFiletypeDoc className="w-8 h-8" />,
      href: "/admin/superadmin/upload",
      color: "from-cyan-600 to-cyan-700",
      buttonColor: "text-cyan-600",
      borderColor: "border-cyan-200",
      
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300"> 
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-15">
          <div className="rounded-xl mb-5 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome back,</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800">
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <FiUser className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Username</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 truncate">{user.username}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <FiMail className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <FiCheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Account Status</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Active</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <FiSettings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Administrative Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group"
              >
                <div className={`h-full bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500`}>
                  {/* Top accent bar */}
                  <div
                    className={`h-1 bg-gradient-to-r ${action.color}`}
                  />

                  <div className="p-6">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {action.icon}
                    </div>

                    {/* Content */}
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {action.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className={`flex items-center gap-2 ${action.buttonColor} font-semibold text-sm group-hover:gap-3 transition-all duration-300`}>
                      <span>Access</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              TOTAL USERS
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              1,234
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              MATERIALS
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              456
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              EXAMS
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              89
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              PAPERS
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              2,145
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}