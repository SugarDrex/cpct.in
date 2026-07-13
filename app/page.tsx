import Carousal from "@/components/Carousal"
import AboutMSection from "./cpct-about/aboutmain";
import WhyChooseUsSection from "./cpct-about/whyus";
import AceReady from "./cpct-about/ace";
import ExamPage from "./cpct/exam";
import SuccessStoriesSection from "./cpct-about/review";
import FloatingContactForm from "@/components/Chat";
import FAQPage from "./faq/page";
import DisclaimerBar from "@/components/DisclaimerBar";
import ExamShiftsPage from "./cpct/cpct-new-exam/page";
import CpctExamsPageNew from "./cpct/page";


export default function Home() {
  return (
    <>
      <Carousal />
      <CpctExamsPageNew/>
      <AboutMSection />
      <WhyChooseUsSection />
      <AceReady />
      <SuccessStoriesSection />
      <FAQPage />
      <FloatingContactForm />
      <DisclaimerBar/>
    </>
  );
} 