"use client";

import { Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiCheck } from "react-icons/fi";
import { FaInstagram, FaFacebookF, FaMobile } from "react-icons/fa";
import { useState, useEffect } from "react";
import { IoMailOutline } from "react-icons/io5";
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error" | null;
        message: string;
    } | null>(null);

    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.get("firstName"),
                    lastName: formData.get("lastName"),
                    email: formData.get("email"),
                    phone: formData.get("phone"),
                    message: formData.get("message"),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({
                    type: "success",
                    message: "Message sent successfully!",
                });
                e.target.reset();
            } else {
                setNotification({
                    type: "error",
                    message: data.error || "Failed to send message.",
                });
            }
        } catch (err) {
            setNotification({
                type: "error",
                message: "Network error — try again.",
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 3200);
        return () => clearTimeout(timer);
    }, [notification]);


    if (pageLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 p-10 space-y-8 animate-pulse">

                <div className="h-10 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto" />
                <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                    <div className="space-y-6">
                        <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                        <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl" />
                        <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl" />
                    </div>

                    <div className="space-y-6">
                        <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-lg" />
                        <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }
    return (<>
        <div className="mt-20 p-5 text-center bg-[#0b1b6f] text-white dark:bg-gray-900 dark:text-gray-100">
            <motion.h1
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-5xl font-bold"
            >
                Contact Us
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto text-md leading-relaxed text-indigo-100 dark:text-indigo-200"
            >
                Welcome to{" "}
                <a href="/" className="text-cyan-400 font-semibold">CPCT.IN</a>, your
                premier destination for comprehensive information and resources to
                excel in the Certified Professional in Computer Technology (CPCT)
                examination.
            </motion.p>
        </div>

        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.28 }}
                    className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
                >
                    <div className={`relative px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap ${notification.type === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                        }`}>

                        <div className={`absolute right-full top-1/2 -translate-y-1/2 border-8 ${notification.type === "success"
                            ? "border-green-600 border-t-transparent border-b-transparent border-r-transparent"
                            : "border-red-600 border-t-transparent border-b-transparent border-r-transparent"
                            }`} />

                        {notification.type === "success" ? "Success: " : "Error: "}
                        {notification.message}

                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 3.2, ease: "linear" }}
                            className="h-[3px] mt-1 rounded bg-white/70"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="w-full   dark:bg-gray-900  p-5    grid grid-cols-1 lg:grid-cols-2 gap-10 items-center transition-colors duration-300"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex justify-center"
            >
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="w-full max-w-2xl
               bg-white dark:bg-[#111827]
               rounded-3xl
               p-10
               border border-gray-200 dark:border-gray-700
               shadow-xl dark:shadow-black/40"
                >
                    <div className="space-y-8">

                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 flex items-center justify-center
                        rounded-2xl
                        bg-gray-100 dark:bg-gray-800
                        shadow-sm">
                                <MapPin className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Location
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Meenakshi Chowk, Near IDFC Bank <br />
                                    Narmadapuram, Madhya Pradesh
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 flex items-center justify-center
                        rounded-2xl
                        bg-gray-100 dark:bg-gray-800
                        shadow-sm">
                                <Mail className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Email
                                </h3>
                                <a
                                    href="mailto:cpctofficial@gmail.com"
                                    className="mt-2 inline-block
                       text-gray-600 dark:text-gray-300
                       hover:text-black dark:hover:text-white
                       transition"
                                >
                 
cpcttypingtest@gmail.com
                                </a>
                            </div>
                        </div>

                    </div>
                </motion.section>
            </motion.div>
            <div className="flex-1">
                <h2 className="text-4xl font-semibold mb-8 text-green-900  dark:text-green-200 transition-colors">
                    Get in touch
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First name" name="firstName" placeholder="John" />
                        <Input label="Last name" name="lastName" placeholder="Doe" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            <Input
                                label="Email *"
                                name="email"
                                type="email"
                                required
                                placeholder="john@email.com"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <TextArea
                            label="Message"
                            name="message"
                            placeholder="Write your message here..."
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.02 }}
                        type="submit"
                        disabled={loading}
                        className={`relative overflow-hidden bg-[#e7d600] cursor-pointer hover:bg-[#d4c400] transition rounded-xl py-3 font-semibold text-lg w-full shadow-md ${loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <span className="h-5 w-5 border-2 border-white 
                     dark:border-black 
                     border-t-transparent 
                     rounded-full animate-spin" />
                                <span className="animate-pulse tracking-wide">
                                    Sending Message...
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 group">
                                <FiSend
                                    size={18}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                                <span>Submit</span>
                            </div>
                        )}

                        {!loading && (
                            <span className="absolute inset-0 
                   bg-gradient-to-r 
                   from-transparent via-white/40 to-transparent 
                   -skew-x-12 translate-x-[-150%] 
                   hover:translate-x-[150%] 
                   transition-transform duration-1000 
                   pointer-events-none" />
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.section>

        <motion.div
            className="w-full bg-gradient-to-b from-slate-100 to-slate-200 
             dark:from-black dark:to-gray-900 
             p-4 md:p-6 transition-all duration-500"
        >  <h2 className="text-4xl text-center font-semibold mb-8 text-green-900  dark:text-green-200 transition-colors">
                Find us here _
            </h2>
            <div
                style={{ height: "60vh" }}
                className="relative max-w-9xl mx-auto rounded-2xl overflow-hidden 
               border border-gray-300/40 dark:border-gray-700
               shadow-xl shadow-gray-400/20 dark:shadow-black/40
               hover:shadow-2xl transition-all duration-500"
            >
 
                <iframe
                    src="https://maps.google.com/maps?q=Narmadapuram%20IDFC%20Bank&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-screen border-0 scale-[1.01] hover:scale-[1.02] transition-transform duration-700"
                    loading="eager"
                />
            </div>
        </motion.div>
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100  mb-10
                dark:from-[#0b1220] dark:via-[#0f172a] dark:to-[#0b1220] 
                py-3">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="group rounded-2xl 
                      bg-white dark:bg-[#111827] 
                      border border-slate-200 dark:border-slate-700
                      shadow-md hover:shadow-2xl 
                      hover:-translate-y-2
                      transition-all duration-500 p-10">
                        <FaMobile size={32} />
                        <h3 className="mt-6 text-2xl font-semibold 
                       text-slate-800 dark:text-white">
                            Call Us
                        </h3>
                        <div className="mt-5 space-y-3">
                            <a href="tel:+919977788020"
                                className="block text-lg font-medium 
                        text-slate-600 dark:text-slate-300
                        hover:text-yellow-600 dark:hover:text-yellow-400 
                        transition">
                                +91 99777 88020
                            </a>
                            <a href="tel:+919165056489"
                                className="block text-lg font-medium 
                        text-slate-600 dark:text-slate-300
                        hover:text-yellow-600 dark:hover:text-yellow-400 
                        transition">
                                +91 91650 56489
                            </a>
                        </div>
                    </div>
                    <div className="group rounded-2xl 
                      bg-white dark:bg-[#111827] 
                      border border-slate-200 dark:border-slate-700
                      shadow-md hover:shadow-2xl 
                      hover:-translate-y-2
                      transition-all duration-500 p-10">

                        <a href="https://www.instagram.com/cpct.in?igsh=OGF1Zm0ycTBmcm9r"
                            className="w-12 h-12 flex items-center justify-center rounded-lg 
                        bg-slate-100 dark:bg-slate-800
                        text-slate-600 dark:text-slate-300
                        hover:bg-pink-600 hover:text-white
                        transition duration-300">
                            <FaInstagram size={20} />

                        </a>

                        <h3 className="mt-6 text-2xl font-semibold 
                       text-slate-800 dark:text-white">
                            Social Media
                        </h3>

                        <p className="mt-3 text-slate-600 dark:text-slate-400">
                            Stay connected with official updates
                        </p>
                    </div>
                    <div className="group rounded-2xl 
                      bg-white dark:bg-[#111827] 
                      border border-slate-200 dark:border-slate-700
                      shadow-md hover:shadow-2xl 
                      hover:-translate-y-2
                      transition-all duration-500 p-10">
                        <IoMailOutline size={28} />
                        <h3 className="mt-6 text-2xl font-semibold 
                       text-slate-800 dark:text-white">
                            Email Us
                        </h3>

                        <a href="mailto:cpcttypingtest@gmail.com"
                            className="block mt-5 text-lg font-medium 
                      text-slate-600 dark:text-slate-300
                      hover:text-yellow-600 dark:hover:text-yellow-400
                      break-all transition">
                            cpcttypingtest@gmail.com
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </>
    );
}

function Input({ label, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-green-900 dark:text-green-300 text-sm font-medium">
                {label}
            </label>
            <input
                {...props}
                className="bg-[#e5ece8] dark:bg-[#1a2420] border border-transparent focus:border-yellow-400 text-black dark:text-white rounded-xl px-4 py-3 outline-none transition"
            />
        </div>
    );
}

function TextArea({ label, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-green-900 dark:text-green-300 text-sm font-medium">
                {label}
            </label>
            <textarea
                rows={4}
                {...props}
                className="bg-[#e5ece8] dark:bg-[#1a2420] border border-transparent focus:border-yellow-400 text-black dark:text-white rounded-xl px-4 py-3 outline-none resize-none transition"
            />
        </div>
    );
}