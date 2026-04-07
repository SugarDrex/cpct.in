"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function FloatingContactForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => {
    setOpen((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-4 right-6 z-[9999]"
        initial={false}
      >
        <button
          onClick={toggleChat}
          onDoubleClick={toggleChat}
          className="w-14 h-14 rounded-full bg-[#25D366] dark:bg-white 
          text-white dark:text-black shadow-2xl 
          flex items-center justify-center cursor-pointer 
          hover:scale-105 transition-all"
        >
          {open ? <FiX size={26} /> : <FiMessageCircle size={26} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-16 right-7 z-[9999] 
              w-[320px] bg-white dark:bg-[#111] 
              text-black dark:text-white 
              rounded-2xl p-6 shadow-2xl border 
              border-gray-200 dark:border-white/10 py-2"
            >
              <h3 className="text-lg font-semibold mb-4">
                Contact Us
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  required
                  placeholder="Your Name"
                  className="border border-gray-300 dark:border-white/20 
                  rounded-lg px-3 py-2 bg-transparent 
                  focus:outline-none focus:ring-2 
                  focus:ring-black dark:focus:ring-white"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 dark:border-white/20 
                  rounded-lg px-3 py-2 bg-transparent 
                  focus:outline-none focus:ring-2 
                  focus:ring-black dark:focus:ring-white"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Message"
                  className="border border-gray-300 dark:border-white/20 
                  rounded-lg px-3 py-2 bg-transparent resize-none 
                  focus:outline-none focus:ring-2 
                  focus:ring-black dark:focus:ring-white"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black dark:bg-white 
                  text-white dark:text-black 
                  rounded-lg py-2 flex items-center 
                  justify-center gap-2 cursor-pointer 
                  hover:opacity-90 transition"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send <FiSend size={16} />
                    </>
                  )}
                </button>
              </form>

              
           <div className="flex justify-center gap-4 mt-5">

  {/* Instagram */}
  <a
    href="https://www.instagram.com/cpct.in?igsh=OGF1Zm0ycTBmcm9r"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center 
    rounded-full bg-gradient-to-tr 
    from-pink-500 via-red-500 to-yellow-500 
    text-white cursor-pointer 
    hover:scale-110 transition"
  >
    <FaInstagram size={14} />
  </a>

  {/* WhatsApp */}
  <a
    href="https://wa.me/919165056489"
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center 
    rounded-full bg-[#25D366] 
    text-white cursor-pointer 
    hover:scale-110 transition"
  >
    <FaWhatsapp size={14} />
  </a>

</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}