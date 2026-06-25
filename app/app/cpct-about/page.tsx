"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="w-full">
 
      <div className="mt-20 p-5 text-center
        bg-[#0b1b6f] text-white
        dark:bg-gray-900 dark:text-gray-100">

        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold"
        >
          About Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-lg text-blue-100 dark:text-gray-400"
        >
          Learn more about CPCT exam preparation and our mission to help students succeed.
        </motion.p>
      </div>
 
      <div className="py-16 px-6 bg-blue-50 dark:bg-gray-950 space-y-20">
        {sections.map((section, idx) => {
          const reverse = idx % 2 === 1;

          return (
            <div
              key={idx}
              className={`max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center ${
                reverse ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
 
              {loading ? (
                <SkeletonImage />
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: reverse ? -80 : 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="rounded-2xl shadow-xl p-6 bg-white dark:bg-gray-900 dark:shadow-gray-800/40">
                    <Image
                      src={section.image}
                      alt={section.title}
                      width={600}
                      height={500}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </motion.div>
              )}

              {/* Text */}
              {loading ? (
                <SkeletonText />
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ staggerChildren: 0.12 }}
                  variants={{ hidden: {}, visible: {} }}
                >
                  <motion.h2
                    variants={fadeUp}
                    className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100"
                  >
                    {section.title}
                  </motion.h2>

                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.text.map((p, i) => (
                      <motion.p key={i} variants={fadeUp}>
                        {p}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
}

  

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

 

function SkeletonImage() {
  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-gray-900 shadow-xl">
      <div className="w-full h-[320px] rounded-xl animate-pulse
        bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

function SkeletonText() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 rounded animate-pulse
        bg-gray-300 dark:bg-gray-700" />

      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-4 w-full rounded animate-pulse
          bg-gray-200 dark:bg-gray-800"
        />
      ))}
    </div>
  );
}
 

const sections = [
  {
    title: "About Us",
    image: "/svg/aboutus.svg",
    text: [
      "Hello, Dear Candidates, Welcome to CPCT.in — we are happy you want to know more about our site.",
      "People are more dependent on online services, so we take a step forward to help you.",
      "Our goal is to provide better solutions and updated information.",
      "Contact us at cpctofficial@gmail.com if you need help."
    ]
  },
  {
    title: "What is Our Goal?",
    image: "/svg/goals.svg",
    text: [
      "Many websites are created daily and fake content spreads easily.",
      "Our goal is to provide original and safe content.",
      "We continuously improve our services for better user experience.",
      "We focus on Education and useful learning resources."
    ]
  },
  {
    title: "What is Our Service?",
    image: "/svg/services.svg",
    text: [
      "We provide Education-focused content and CPCT preparation support.",
      "Interactive practice modules and study materials are included.",
      "Performance tracking helps you improve step by step.",
      "Visit daily for the latest updates and learning material."
    ]
  },{
    title: "About cpct.in",
    image: "/svg/cpct.svg",
    text: [
      "As mentioned above, our goal and service are focused on the Education category to help people.",
      "This website is created by cpct.in because many users spend hours searching for exact information.",
      "Our main motive is to provide accurate resources faster and give users a better web experience.",
      "This About page explains the purpose and mission behind cpct.in.",
      "If you want to contact us, you can email us at cpctofficial@gmail.com."
    ]
  }
 
];
