"use client";

import { motion } from "framer-motion";

export default function TermsServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-100 via-slate-100 to-purple-100 dark:from-black dark:via-black dark:to-black transition-colors duration-500">
      
   
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-900 dark:bg-gray-950 py-10  mt-20 mb-5 text-center shadow-lg "
      >
        <h1 className="text-3xl font-semibold text-white tracking-wide">
          Terms & Service
        </h1>
      </motion.div>

      {/* Content Card */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-black shadow-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)] p-8 md:p-10 text-gray-800 dark:text-gray-300 leading-relaxed"
        >
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-400 mb-4">
            Terms & Service
          </h2>

          <p>
            Welcome to cpct.in!<br />
            These terms and conditions outline the rules and regulations for the use of
            cpct.in's Website,located at https://cpct.in/.<br />
            By accessing this website we assume you accept these terms and conditions. Do
            not continue to use cpct.in if you do not agree to take all of the terms and
            conditions stated on this page. The following terminology applies to these Terms
            and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: You
            and Your refers to you, the person log on this website and compliant to the
            Company’s terms and conditions. Us refers to our Company. "Party refers to both
            the Client and ourselves. All terms refer to the offer, acceptance, and
            consideration of payment necessary to undertake the process of our assistance to
            the Client in the most appropriate manner for the express purpose of meeting the
            Client’s needs in respect of the provision of the Company’s stated services, in
            accordance with and subject to, prevailing law of Netherlands. Any use of the
            above terminology or other words in the singular, plural, capitalization, and/or
            he/she or they, are taken as interchangeable and therefore as referring to same.
          </p>

          <h3 className="font-bold mt-6">Cookies</h3>
          <p>
            We employ the use of cookies. By accessing cpct.in, you agreed to use cookies in
            agreement with cpct.in's Privacy Policy.<br />
            Most interactive websites use cookies to let us retrieve the user’s details for
            each visit. Cookies are used by our website to enable the functionality of certain
            areas to make it easier for people visiting our website. Some of our
            affiliate/advertising partners may also use cookies.
          </p>

          <h3 className="font-bold mt-6">License</h3>
          <p>
            Unless otherwise stated, cpct.in and/or its licensors own the intellectual property
            rights for all material on cpct.in. All intellectual property rights are reserved.
            You may access this from cpct.in for your own personal use subject to restrictions
            set in these terms and conditions.<br />
            You must not:<br />
            <strong>
              Republish material from cpct.in<br />
              Sell, rent or sub-license material from cpct.in<br />
              Reproduce, duplicate or copy material from cpct.in<br />
              Redistribute content from cpct.in<br />
            </strong>
          </p>

          <p>
            This Agreement shall begin on the date hereof.<br />
            Parts of this website offer an opportunity for users to post and exchange opinions
            and information in certain areas of the website. cpct.in does not filter, edit,
            publish or review Comments prior to their presence on the website. Comments do not
            reflect the views and opinions of cpct.in, its agents, and/or affiliates. Comments
            reflect the views and opinions of the person who posts their views and opinions. To
            the extent permitted by applicable laws, cpct.in shall not be liable for the
            Comments or for any liability, damages, or expenses caused and/or suffered as a
            result of any use of and/or posting of and/or appearance of the Comments on this
            website.
          </p>

          <p>
            cpct.in reserves the right to monitor all Comments and to remove any Comments which
            can be considered inappropriate, offensive or causes breach of these Terms and
            Conditions.<br />
            You warrant and represent that:<br />
            You are entitled to post the Comments on our website and have all necessary
            licenses and consents to do so;<br />
            The Comments do not invade any intellectual property right, including without
            limitation copyright, patent or trademark of any third party;<br />
            The Comments do not contain any defamatory, libelous, offensive, indecent or
            otherwise unlawful material which is an invasion of privacy<br />
            The Comments will not be used to solicit or promote business or custom or present
            commercial activities or unlawful activity.<br />
            You hereby grant cpct.in a non-exclusive license to use, reproduce, edit and
            authorize others to use, reproduce and edit any of your Comments in any and all
            forms, formats, or media.
          </p>

          <h3 className="font-bold mt-6">Hyperlinking to our Content</h3>
          <p>
            The following organizations may link to our Website without prior written approval:<br />
            Government agencies;<br />
            Search engines;<br />
            News organizations;<br />
            Online directory distributors may link to our Website in the same manner as they
            hyperlink to the Websites of other listed businesses; and System wide Accredited
            Businesses except soliciting non-profit organizations, charity shopping malls, and
            charity fundraising groups which may not hyperlink to our Web site.
          </p>

          <h3 className="font-bold mt-6">Content Liability</h3>
          <p>
            We shall not be held responsible for any content that appears on your Website. You
            agree to protect and defend us against all claims that are rising on your Website.
            No link(s) should appear on any Website that may be interpreted as libelous,
            obscene, or criminal, or which infringes, otherwise violates or advocates the
            infringement or other violation of, any third party rights.
          </p>

          <p>
            Please read{" "}
            <a
              href="/privacy"
              className="text-blue-700 dark:text-blue-400 underline"
            >
              Privacy Policy
            </a>
          </p>

          <h3 className="font-bold mt-6">Reservation of Rights</h3>
          <p>
            We reserve the right to request that you remove all links or any particular link to
            our Website. You approve to immediately remove all links to our Website upon
            request. We also reserve the right to amen these terms and conditions and its
            linking policy at any time. By continuously linking to our Website, you agree to be
            bound to and follow these linking terms and conditions.
          </p>

          <h3 className="font-bold mt-6">Removal of links from our website</h3>
          <p>
            If you find any link on our Website that is offensive for any reason, you are free
            to contact and inform us at any moment. We will consider requests to remove links
            but we are not obligated to or so or to respond to you directly.
          </p>

          <p>
            We do not ensure that the information on this website is correct, we do not warrant
            its completeness or accuracy; nor do we promise to ensure that the website remains
            available or that the material on the website is kept up to date.
          </p>

          <p className="font-semibold mt-6">
            Thanks for visiting our Terms &amp; Conditions Page
          </p>
        </motion.div>
      </div>
    </main>
  );
}
