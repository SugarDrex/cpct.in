"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <main className="mt-20 bg-gray-100 dark:bg-black transition-colors duration-500">
      {/* Header Banner */}
      <section className="bg-blue-900 dark:bg-black border-b border-blue-800 dark:border-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-14 text-center"
        >
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Privacy Policy
          </h1>
        </motion.div>
      </section>

      {/* Gradient Background Section */}
      <section className="bg-gradient-to-b from-blue-50 to-gray-100 dark:from-black dark:to-black py-2">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            whileHover={{ scale: 1.01 }}
            className="
              max-w-6xl mx-auto rounded-xl
              bg-white dark:bg-black
              border border-gray-200 dark:border-gray-800
              shadow-lg dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
              backdrop-blur
              p-8 md:p-10
              transition-all duration-300
            "
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold text-blue-900 dark:text-blue-400 mb-4"
            >
              Privacy Policy for cpct.in
            </motion.h2>

            <div className="space-y-5 text-justify leading-relaxed text-gray-700 dark:text-gray-300">
              <p>
                At cpct.in, accessible from{" "}
                <a
                  href="https://cpct.in/"
                  target="_blank"
                  className="text-blue-700 dark:text-blue-400 underline"
                >
                  https://cpct.in/
                </a>
                , one of our main priorities is the privacy of our visitors.
                This Privacy Policy document contains types of information
                that is collected and recorded by cpct.in and how we use it.
              </p>

              <p>
                If you have additional questions or require more information
                about our Privacy Policy, do not hesitate to Contact through
                email at{" "}
                <a
                  href="mailto:cpctofficial@gmail.com"
                  className="text-blue-700 dark:text-blue-400 underline"
                >
                  cpctofficial@gmail.com
                </a>
              </p>

              <SectionTitle>Log Files</SectionTitle>
              <p>
                cpct.in follows a standard procedure of using log files. These
                files log visitors when they visit websites. All hosting
                companies do this and a part of hosting services&apos;
                analytics. The information collected by log files include IP
                addresses, browser type, ISP, date/time stamp, referring/exit
                pages, and number of clicks. These are not linked to any
                personally identifiable information.
              </p>

              <SectionTitle>Cookies and Web Beacons</SectionTitle>
              <p>
                Like any other website, cpct.in uses cookies to store visitor
                preferences and visited pages. This information is used to
                optimize the user experience by customizing content based on
                browser type and other information.
              </p>

              <SectionTitle>Google DoubleClick DART Cookie</SectionTitle>
              <p>
                Google is a third-party vendor on our site and uses DART
                cookies to serve ads based on visits to various sites.
                Visitors may decline DART cookies by visiting Google ad privacy
                policy.
              </p>

              <SectionTitle>Advertising Partner Privacy Policies</SectionTitle>
              <p>
                Third-party ad servers or networks use cookies, JavaScript, or
                Web Beacons in their ads and links. They automatically receive
                your IP address. cpct.in has no control over these cookies.
              </p>

              <SectionTitle>Third Party Privacy Policies</SectionTitle>
              <p>
                cpct.in’s Privacy Policy does not apply to other advertisers
                or websites. Consult respective third-party policies for
                detailed information and opt-out instructions.
              </p>

              <SectionTitle>Children’s Information</SectionTitle>
              <p>
                We prioritize protection for children online. cpct.in does not
                knowingly collect Personal Identifiable Information from
                children under 13. Contact us if such data is found and we
                will remove it promptly.
              </p>

              <SectionTitle>Online Privacy Policy Only</SectionTitle>
              <p>
                This Privacy Policy applies only to online activities and is
                valid for visitors to our website. It does not apply offline
                or through other channels.
              </p>

              <SectionTitle>Consent</SectionTitle>
              <p>
                By using our website, you hereby consent to our Privacy Policy
                and agree to its Terms and Conditions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* Animated Section Title */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h3
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="text-lg font-semibold text-gray-900 dark:text-white pt-4"
    >
      {children}
    </motion.h3>
  );
}
