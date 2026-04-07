import Carousal from "@/components/Carousal"
import AboutMSection from "./cpct-about/aboutmain";
import WhyChooseUsSection from "./cpct-about/whyus";
import AceReady from "./cpct-about/ace";
import ExamPage from "./cpct/exam";
import SuccessStoriesSection from "./cpct-about/review";
import FloatingContactForm from "@/components/Chat";
import FAQPage from "./faq/page";


export default function Home() {
  return (
    <>
      <Carousal />
      <ExamPage />
      <AboutMSection />
      <WhyChooseUsSection />
      <AceReady />
      <SuccessStoriesSection />
      <FAQPage />
      <FloatingContactForm />
    </>
  );
} 