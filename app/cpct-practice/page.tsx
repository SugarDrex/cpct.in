'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ParagraphSet {
  [timeLimit: number]: string;
}

interface ParagraphData {
  english: ParagraphSet;
  hindi: ParagraphSet;
}

interface TestStats {
  nwpm: number;
  gwpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  totalTypedWords: number;
  missingWords: number;
  timeTaken: number;
  passed: boolean;
  passThreshold: number;
}
 
const PARAGRAPHS: ParagraphData = {
  english: {
    5: `The history of computers is a fascinating journey that spans thousands of years, beginning with simple mechanical tools and evolving into the sophisticated digital devices we rely on today. This story is not just about the machines themselves but also about the visionaries and inventors who imagined new possibilities and transformed those ideas into reality. Early civilizations created tools like the abacus to assist with mathematical calculations. The abacus consisted of beads sliding on rods within a wooden frame and allowed users to perform arithmetic operations efficiently. As societies advanced, the need for more complex calculation tools became apparent. In the nineteenth century, Charles Babbage designed the Difference Engine and Analytical Engine, which are considered the first mechanical computers. Although these machines were never fully built during his lifetime, they laid the groundwork for modern computing concepts. Ada Lovelace worked with Babbage and is often regarded as the first computer programmer for her work on the Analytical Engine. She envisioned that computers could do more than just calculate numbers. The twentieth century brought revolutionary changes with the invention of electronic computers. During World War Two, computers were developed to decode enemy messages and calculate ballistic trajectories. These early electronic computers used vacuum tubes and occupied entire rooms. The invention of the transistor in the late nineteen forties marked a turning point, enabling smaller and more reliable computers. Integrated circuits further miniaturized computer components, leading to the microprocessor revolution. Today, computers are everywhere, from smartphones to supercomputers, and they continue to shape every aspect of modern life. The internet has connected billions of people worldwide, enabling instant communication and access to vast amounts of information. Digital technology has transformed education, healthcare, business, and entertainment in profound ways.`,
    10: `Artificial Intelligence is transforming technology and industries worldwide in unprecedented ways. AI systems can learn from data and make decisions that were previously thought to require human intelligence. Machine learning allows computers to improve their performance over time without being explicitly programmed for every scenario. Deep learning, a subset of machine learning, uses neural networks with many layers to analyze complex patterns in large datasets. AI is used in smartphones, automobiles, healthcare, and finance to enhance efficiency and accuracy. Virtual assistants like Siri and Alexa use natural language processing to understand and respond to user queries. In healthcare, AI algorithms can analyze medical images to detect diseases earlier than human doctors. Self-driving cars use computer vision and sensor fusion to navigate roads safely. The future will see more AI integration in everyday applications and services. However, the rise of AI also raises important ethical questions about privacy, job displacement, and algorithmic bias. As AI systems become more autonomous, ensuring they make fair and transparent decisions becomes crucial. Researchers are working on explainable AI to make machine learning models more interpretable. Governments and organizations are developing regulations to govern AI development and deployment. Education systems are adapting to prepare students for an AI-driven economy. The collaboration between humans and AI will likely define the next phase of technological progress. Businesses that successfully integrate AI into their operations will gain significant competitive advantages. The technology continues to evolve rapidly, creating new opportunities and challenges every day. Cloud computing platforms provide the infrastructure necessary for training complex AI models at scale. Data privacy and security remain paramount concerns as AI systems handle increasingly sensitive information across global networks. Natural language processing has enabled machines to understand and generate human language with remarkable accuracy. Computer vision technology allows machines to interpret and analyze visual information from the world around them. Robotics and automation are reshaping manufacturing and logistics industries worldwide.`,
    15: `Cloud computing allows users to access data and applications over the internet from anywhere in the world. Instead of storing information locally on personal computers, users can store it on remote servers maintained by cloud service providers. This technology offers scalability, flexibility, and cost effectiveness for businesses of all sizes. Major companies like Amazon, Google, and Microsoft provide comprehensive cloud solutions that power millions of applications. Cloud technology enables businesses to operate efficiently and securely without investing heavily in physical infrastructure. There are three main types of cloud services: Infrastructure as a Service, Platform as a Service, and Software as a Service. Infrastructure as a Service provides virtualized computing resources over the internet. Platform as a Service offers a platform allowing customers to develop, run, and manage applications. Software as a Service delivers software applications over the internet on a subscription basis. Cloud computing has revolutionized how organizations approach information technology. Small startups can now access the same powerful computing resources as large enterprises. The pay-as-you-go model allows businesses to scale their operations up or down based on demand. Disaster recovery becomes more manageable with automated backups and redundant systems. Collaboration tools hosted in the cloud enable teams to work together regardless of physical location. Security remains a top concern for cloud adoption, though providers invest heavily in protection measures. Data encryption, access controls, and compliance certifications help ensure information safety. Hybrid cloud solutions combine private and public cloud infrastructure for optimal flexibility. Edge computing extends cloud capabilities closer to data sources for faster processing. The environmental impact of large data centers is an ongoing consideration for the industry. Renewable energy sources are increasingly powering cloud facilities. As more devices connect to the internet, the demand for cloud services continues to grow exponentially across all sectors. Organizations worldwide are migrating their workloads to cloud platforms to achieve greater operational efficiency and reduce capital expenditure. Serverless computing allows developers to build applications without managing underlying infrastructure. Containerization technologies like Docker and Kubernetes have simplified application deployment and management. Multi-cloud strategies help organizations avoid vendor lock-in and improve resilience. Cloud native development practices are becoming the standard for modern software engineering.`,
    20: `Blockchain technology serves as the foundational infrastructure for decentralized applications and cryptocurrencies. It operates as a distributed ledger system where transactions are recorded in blocks and cryptographically linked in a chain. Each block contains data, a timestamp, and a reference to the previous block, creating an immutable record of all transactions. The consensus mechanisms used in blockchain networks ensure that all participants agree on the validity of transactions without requiring a central authority. This decentralization eliminates single points of failure and reduces the risk of fraud. Blockchain applications extend beyond cryptocurrencies to supply chain management, digital identity verification, smart contracts, and healthcare records management. In supply chain management, blockchain provides transparency and traceability from manufacturer to consumer. Every handoff in the supply chain can be recorded permanently, reducing counterfeiting and improving quality control. Smart contracts are self-executing agreements with terms directly written into code. They automatically enforce and execute contractual obligations when predetermined conditions are met. This reduces the need for intermediaries and lowers transaction costs. Digital identity verification using blockchain gives individuals control over their personal information. Users can selectively share credentials without revealing unnecessary data. Healthcare records management benefits from blockchain by creating secure, interoperable systems for patient data. Medical records can be accessed instantly by authorized providers while maintaining patient privacy. The technology faces challenges including scalability limitations, energy consumption, and regulatory uncertainty. Public blockchains like Bitcoin process transactions slowly compared to traditional payment networks. Private and consortium blockchains offer faster processing for enterprise applications. Researchers are developing new consensus algorithms that reduce energy usage while maintaining security. Layer two solutions process transactions off the main blockchain to improve speed and reduce costs. Governments worldwide are exploring central bank digital currencies built on blockchain technology. The intersection of blockchain with artificial intelligence and Internet of Things creates new possibilities for autonomous systems. As the technology matures, standards and interoperability protocols are emerging to connect different blockchain networks. Education and awareness about blockchain capabilities and limitations remain important for widespread adoption. The future will likely see hybrid systems that combine blockchain with traditional databases for optimal performance.`
  },
  hindi: {
    5: `कंप्यूटर का इतिहास हजारों वर्षों की एक आकर्षक यात्रा है, जो सरल यांत्रिक उपकरणों से शुरू होकर आधुनिक डिजिटल उपकरणों में विकसित हुई है। यह कहानी केवल मशीनों के बारे में नहीं है, बल्कि उन दूरदर्शी और आविष्कारकों के बारे में भी है जिन्होंने नई संभावनाओं की कल्पना की और उन विचारों को वास्तविकता में बदल दिया। प्रारंभिक सभ्यताओं ने गणितीय गणना में सहायता के लिए अबेकस जैसे उपकरण बनाए। अबेकस में लकड़ी के फ्रेम के भीतर रॉड पर खिसकने वाले मोतिये होते थे जो उपयोगकर्ताओं को अंकगणितीय संचालन कुशलता से करने की अनुमति देते थे। जैसे-जैसे समाज उन्नत हुए, अधिक जटिल गणना उपकरणों की आवश्यकता स्पष्ट हो गई। उन्नीसवीं शताब्दी में, चार्ल्स बैबेज ने डिफरेंस इंजन और एनालिटिकल इंजन डिजाइन किए, जिन्हें पहले यांत्रिक कंप्यूटर माना जाता है। हालांकि ये मशीनें उनके जीवनकाल के दौरान कभी पूरी तरह से नहीं बनीं, लेकिन उन्होंने आधुनिक कंप्यूटिंग अवधारणाओं की नींव रखी। एडा लवलेस बैबेज के साथ काम करती थीं और एनालिटिकल इंजन पर उनके काम के लिए उन्हें अक्सर पहली कंप्यूटर प्रोग्रामर माना जाता है। उन्होंने कल्पना की कि कंप्यूटर केवल संख्याओं की गणना से अधिक कर सकते हैं। बीसवीं शताब्दी ने इलेक्ट्रॉनिक कंप्यूटरों के आविष्कार के साथ क्रांतिकारी बदलाव लाए। द्वितीय विश्व युद्ध के दौरान, कंप्यूटरों को दुश्मन के संदेशों को डिकोड करने और बैलिस्टिक प्रक्षेपवक्रों की गणना करने के लिए विकसित किया गया था। आज कंप्यूटर हर जगह मौजूद हैं और आधुनिक जीवन के हर पहलू को आकार दे रहे हैं। इंटरनेट ने दुनिया भर में अरबों लोगों को जोड़ा है। डिजिटल तकनीक ने शिक्षा, स्वास्थ्य सेवा, व्यवसाय और मनोरंजन को गहराई से बदल दिया है।`,
    10: `कृत्रिम बुद्धिमत्ता दुनिया भर में प्रौद्योगिकी और उद्योगों को अभूतपूर्व तरीकों से बदल रही है। एआई सिस्टम डेटा से सीख सकते हैं और निर्णय ले सकते हैं जो पहले मानव बुद्धिमत्ता की आवश्यकता वाले माने जाते थे। मशीन लर्निंग कंप्यूटर को समय के साथ अपने प्रदर्शन में सुधार करने की अनुमति देती है बिना हर परिदृश्य के लिए स्पष्ट रूप से प्रोग्राम किए बिना। डीप लर्निंग, मशीन लर्निंग का एक उपसमुच्चय, बड़े डेटासेट में जटिल पैटर्न का विश्लेषण करने के लिए कई परतों वाले न्यूरल नेटवर्क का उपयोग करता है। एआई स्मार्टफोन, ऑटोमोबाइल, स्वास्थ्य सेवा और वित्त में दक्षता और सटीकता बढ़ाने के लिए उपयोग किया जाता है। वर्चुअल सहायक जैसे सिरी और एलेक्सा उपयोगकर्ता के प्रश्नों को समझने और उत्तर देने के लिए प्राकृतिक भाषा प्रसंस्करण का उपयोग करते हैं। स्वास्थ्य सेवा में, एआई एल्गोरिदम मानव डॉक्टरों से पहले बीमारियों का पता लगाने के लिए चिकित्सा छवियों का विश्लेषण कर सकते हैं। स्वचालित कारें सुरक्षित रूप से सड़कों पर नेविगेट करने के लिए कंप्यूटर विजन और सेंसर फ्यूजन का उपयोग करती हैं। भविष्य में रोजमर्रा के अनुप्रयोगों और सेवाओं में अधिक एआई एकीकरण देखा जाएगा। हालांकि, एआई के उदय से गोपनीयता, नौकरी विस्थापन और एल्गोरिदमिक पूर्वाग्रह के बारे में महत्वपूर्ण नैतिक सवाल भी उठते हैं। जैसे-जैसे एआई सिस्टम अधिक स्वायत्त होते हैं, यह सुनिश्चित करना महत्वपूर्ण हो जाता है कि वे निष्पक्ष और पारदर्शी निर्णय लें। शोधकर्ता व्याख्या योग्य एआई पर काम कर रहे हैं ताकि मशीन लर्निंग मॉडल को अधिक व्याख्यात्मक बनाया जा सके। सरकारें और संगठन एआई विकास और परिनियोजन को नियंत्रित करने के लिए विनियम विकसित कर रहे हैं। शिक्षा प्रणाली एक एआई-संचालित अर्थव्यवस्था के लिए छात्रों को तैयार करने के लिए अनुकूलन कर रही हैं। मानव और एआई के बीच सहयोग भविष्य की प्रौद्योगिकी प्रगति को परिभाषित करेगा। व्यवसाय जो एआई को सफलतापूर्वक एकीकृत करते हैं वे महत्वपूर्ण प्रतिस्पर्धात्मक लाभ प्राप्त करेंगे। प्राकृतिक भाषा प्रसंस्करण ने मशीनों को मानव भाषा को समझने और उत्पन्न करने में सक्षम बनाया है। कंप्यूटर विजन तकनीक मशीनों को दृश्य जानकारी की व्याख्या करने की अनुमति देती है। रोबोटिक्स और स्वचालन विनिर्माण और रसद उद्योगों को पुनर्निर्मित कर रहे हैं।`,
    15: `क्लाउड कंप्यूटिंग उपयोगकर्ताओं को दुनिया में कहीं से भी इंटरनेट पर डेटा और अनुप्रयोगों तक पहुंचने की अनुमति देती है। व्यक्तिगत कंप्यूटर पर स्थानीय रूप से जानकारी संग्रहीत करने के बजाय, उपयोगकर्ता इसे क्लाउड सेवा प्रदाताओं द्वारा बनाए रखे दूरस्थ सर्वर पर संग्रहीत कर सकते हैं। यह तकनीक सभी आकारों के व्यवसायों के लिए स्केलेबिलिटी, लचीलापन और लागत प्रभावशीलता प्रदान करती है। अमेज़ॅन, गूगल और माइक्रोसॉफ्ट जैसी प्रमुख कंपनियां क्लाउड समाधान प्रदान करती हैं जो लाखों अनुप्रयोगों को शक्ति प्रदान करते हैं। क्लाउड प्रौद्योगिकी व्यवसायों को भारी भौतिक बुनियादी ढांचे में निवेश किए बिना कुशलता और सुरक्षा से संचालित करने में सक्षम बनाती है। क्लाउड सेवाओं के तीन मुख्य प्रकार हैं: इंफ्रास्ट्रक्चर एज ए सर्विस, प्लेटफॉर्म एज ए सर्विस, और सॉफ्टवेयर एज ए सर्विस। इंफ्रास्ट्रक्चर एज ए सर्विस इंटरनेट पर वर्चुअलाइज्ड कंप्यूटिंग संसाधन प्रदान करता है। प्लेटफॉर्म एज ए सर्विस ग्राहकों को अनुप्रयोग विकसित, चलाने और प्रबंधित करने की अनुमति देने वाला एक मंच प्रदान करता है। सॉफ्टवेयर एज ए सर्विस सदस्यता आधार पर इंटरनेट पर सॉफ्टवेयर अनुप्रयोग वितरित करता है। क्लाउड कंप्यूटिंग ने संगठनों के सूचना प्रौद्योगिकी के दृष्टिकोण को क्रांतिकारी बना दिया है। छोटे स्टार्टअप अब बड़े उद्यमों के समान शक्तिशाली कंप्यूटिंग संसाधनों तक पहुंच सकते हैं। पे-एज-यू-गो मॉडल व्यवसायों को मांग के आधार पर अपने संचालन को ऊपर या नीचे स्केल करने की अनुमति देता है। स्वचालित बैकअप और अतिरिक्त प्रणालियों के साथ आपदा पुनर्प्राप्ति अधिक प्रबंधनीय हो जाती है। क्लाउड में होस्ट किए गए सहयोग उपकरण टीमों को भौतिक स्थान की परवाह किए बिना एक साथ काम करने में सक्षम बनाते हैं। सुरक्षा क्लाउड अपनाने के लिए एक शीर्ष चिंता बनी हुई है, हालांकि प्रदाता सुरक्षा उपायों में भारी निवेश करते हैं। डेटा एन्क्रिप्शन, पहुंच नियंत्रण और अनुपालन प्रमाणपत्र जानकारी की सुरक्षा सुनिश्चित करने में मदद करते हैं। हाइब्रिड क्लाउड समाधान इष्टतम लचीलापन के लिए निजी और सार्वजनिक क्लाउड बुनियादी ढांचे को जोड़ते हैं। क्लाउड सेवाओं की मांग सभी क्षेत्रों में लगातार बढ़ रही है। संगठन अपने कार्यभार को क्लाउड प्लेटफॉर्म पर स्थानांतरित कर रहे हैं। सर्वरलेस कंप्यूटिंग डेवलपर्स को बुनियादी ढांचे का प्रबंधन किए बिना अनुप्रयोग बनाने की अनुमति देता है। कंटेनरीकरण तकनीकों ने अनुप्रयोग परिनियोजन को सरल बनाया है। मल्टी-क्लाउड रणनीतियां विक्रेता लॉक-इन से बचने में मदद करती हैं।`,
    20: `ब्लॉकचेन तकनीक विकेंद्रीकृत अनुप्रयोगों और क्रिप्टोकरेंसी के लिए मूल बुनियादी ढांचा के रूप में कार्य करती है। यह एक वितरित खाता प्रणाली के रूप में काम करता है जहां लेनदेन ब्लॉक में दर्ज किए जाते हैं और एक श्रृंखला में क्रिप्टोग्राफिकली जुड़े होते हैं। प्रत्येक ब्लॉक में डेटा, एक टाइमस्टैम्प और पिछले ब्लॉक का संदर्भ होता है, जो सभी लेनदेन का एक अपरिवर्तनीय रिकॉर्ड बनाता है। ब्लॉकचेन नेटवर्क में उपयोग की जाने वाली सहमति तंत्र सभी प्रतिभागियों को केंद्रीय प्राधिकरण की आवश्यकता के बिना लेनदेन की वैधता पर सहमत होने के लिए सुनिश्चित करती है। यह विकेंद्रीकरण एकल विफलता बिंदुओं को समाप्त करता है और धोखाधड़ी के जोखिम को कम करता है। ब्लॉकचेन अनुप्रयोग क्रिप्टोकरेंसी से परे आपूर्ति श्रृंखला प्रबंधन, डिजिटल पहचान सत्यापन, स्मार्ट अनुबंध और स्वास्थ्य सेवा रिकॉर्ड प्रबंधन तक फैलते हैं। आपूर्ति श्रृंखला प्रबंधन में, ब्लॉकचेन निर्माता से उपभोक्ता तक पारदर्शिता और ट्रेसेबिलिटी प्रदान करता है। आपूर्ति श्रृंखला में हर हैंडऑफ स्थायी रूप से दर्ज किया जा सकता है, जो नकली उत्पादों को कम करता है और गुणवत्ता नियंत्रण में सुधार करता है। स्मार्ट अनुबंध कोड में सीधे लिखी शर्तों वाले स्वयं निष्पादित समझौते हैं। वे पूर्व निर्धारित शर्तों को पूरा होने पर अनुबंध दायित्वों को स्वचालित रूप से लागू और निष्पादित करते हैं। यह मध्यस्थों की आवश्यकता को कम करता है और लेनदेन लागत को कम करता है। ब्लॉकचेन का उपयोग करके डिजिटल पहचान सत्यापन व्यक्तियों को उनकी व्यक्तिगत जानकारी पर नियंत्रण देता है। उपयोगकर्ता बिना अनावश्यक डेटा प्रकट किए क्रेडेंशियल को चयनात्मक रूप से साझा कर सकते हैं। स्वास्थ्य सेवा रिकॉर्ड प्रबंधन ब्लॉकचेन से लाभान्वित होता है रोगी डेटा के लिए सुरक्षित, इंटरऑपरेबल सिस्टम बनाकर। अधिकृत प्रदाता रोगी गोपनीयता बनाए रखते हुए चिकित्सा रिकॉर्ड तक तुरंत पहुंच सकते हैं। तकनीक को स्केलेबिलिटी सीमाओं, ऊर्जा खपत और नियामक अनिश्चितता सहित चुनौतियों का सामना करना पड़ता है। पब्लिक ब्लॉकचेन जैसे बिटकॉइन पारंपरिक भुगतान नेटवर्क की तुलना में धीरे-धीरे लेनदेन संसाधित करते हैं। निजी और कंसोर्टियम ब्लॉकचेन एंटरप्राइज अनुप्रयोगों के लिए तेज़ प्रसंस्करण प्रदान करते हैं। शोधकर्ते ऊर्जा उपयोग को कम करते हुए सुरक्षा बनाए रखने वाले नए सहमति एल्गोरिदम विकसित कर रहे हैं। लेयर टू समाधान गति में सुधार और लागत कम करने के लिए मुख्य ब्लॉकचेन से बाहर लेनदेन संसाधित करते हैं। दुनिया भर की सरकारें ब्लॉकचेन तकनीक पर बने केंद्रीय बैंक डिजिटल मुद्राओं का पता लगा रही हैं।`
  }
};

const WORD_COUNTS: Record<number, number> = {
  5: 280,
  10: 380,
  15: 480,
  20: 530
};

// ─── PARAGRAPH NUMBER MAPPING ───
// 5 min -> Paragraph-5, 10 min -> Paragraph-2, 15 min -> Paragraph-3, 20 min -> Paragraph-4
const PARAGRAPH_NUMBER_MAP: Record<number, number> = {
  5: 1,
  10: 2,
  15: 3,
  20: 4
};

// ─────────────────────────────────────────────────────────────
// HELPER: Toggle Switch Component
// ─────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, count }) => (
  <div className="flex items-center gap-2">
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">{label}</span>
    {count !== undefined && (
      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 min-w-[1.5rem] text-center">
        {count}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// WELCOME MODAL COMPONENT
// ─────────────────────────────────────────────────────────────

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    timeLimit: number;
    language: 'english' | 'hindi';
    backspaceEnabled: boolean;
    autoScroll: boolean;
    showColor: boolean;
    highlighter: boolean;
  }) => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [modalTimeLimit, setModalTimeLimit] = useState<number>(5);
  const [modalLanguage, setModalLanguage] = useState<'english' | 'hindi'>('english');
  const [modalBackspace, setModalBackspace] = useState<boolean>(true);
  const [modalAutoScroll, setModalAutoScroll] = useState<boolean>(true);
  const [modalShowColor, setModalShowColor] = useState<boolean>(true);
  const [modalHighlighter, setModalHighlighter] = useState<boolean>(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to CPCT Typing Test</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Customize your exam settings before you begin</p>
        </div>

        {/* Exam Configuration */}
        <div className="space-y-5 mb-6">
          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⏱️ Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((time) => (
                <button
                  key={time}
                  onClick={() => setModalTimeLimit(time)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalTimeLimit === time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                >
                  {time} Min
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Words: {WORD_COUNTS[modalTimeLimit]}</p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">🌐 Language</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModalLanguage('english')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalLanguage === 'english'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
              >
                🇮🇳 English
              </button>
              <button
                onClick={() => setModalLanguage('hindi')}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition border-2 ${modalLanguage === 'hindi'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
              >
                🇮🇳 Hindi (हिंदी)
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pass Threshold: {modalLanguage === 'english' ? '30 NWPM' : '20 NWPM'}
            </p>
          </div>

          {/* Toggle Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⚙️ Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <ToggleSwitch
                label="Backspace"
                checked={modalBackspace}
                onChange={() => setModalBackspace(!modalBackspace)}
              />
              <ToggleSwitch
                label="AutoScroll"
                checked={modalAutoScroll}
                onChange={() => setModalAutoScroll(!modalAutoScroll)}
              />
              <ToggleSwitch
                label="Color Coding"
                checked={modalShowColor}
                onChange={() => setModalShowColor(!modalShowColor)}
              />
              <ToggleSwitch
                label="Highlighter"
                checked={modalHighlighter}
                onChange={() => setModalHighlighter(!modalHighlighter)}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onConfirm({
                timeLimit: modalTimeLimit,
                language: modalLanguage,
                backspaceEnabled: modalBackspace,
                autoScroll: modalAutoScroll,
                showColor: modalShowColor,
                highlighter: modalHighlighter,
              });
              onClose();
            }}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
          >
            🚀 Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function TypingTest() {
  // ─── Welcome Modal State ───
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);

  // ─── Configuration State ───
  const [timeLimit, setTimeLimit] = useState<number>(5);
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  // ─── Test State ───
  const [testState, setTestState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [backspaceCount, setBackspaceCount] = useState<number>(0);

  // ─── Toggles ───
  const [backspaceEnabled, setBackspaceEnabled] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showColor, setShowColor] = useState<boolean>(true);
  const [highlighter, setHighlighter] = useState<boolean>(true);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // ─── Display ───
  const [fontSize, setFontSize] = useState<number>(18);

  // ─── Stats ───
  const [stats, setStats] = useState<TestStats | null>(null);

  // ─── Refs ───
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // ─── Derived Data ───
  const currentParagraph = useMemo(() => PARAGRAPHS[language][timeLimit], [language, timeLimit]);
  const displayWords = useMemo(() => currentParagraph.split(/\s+/).filter(w => w.length > 0), [currentParagraph]);
  const userWords = useMemo(() => userInput.trim().split(/\s+/).filter(w => w.length > 0), [userInput]);

  // ─── Dynamic Paragraph Number ───
  const paragraphDisplayNumber = useMemo(() => PARAGRAPH_NUMBER_MAP[timeLimit] || 1, [timeLimit]);

  // ─── Handle Modal Confirm ───
  const handleModalConfirm = useCallback((config: {
    timeLimit: number;
    language: 'english' | 'hindi';
    backspaceEnabled: boolean;
    autoScroll: boolean;
    showColor: boolean;
    highlighter: boolean;
  }) => {
    setTimeLimit(config.timeLimit);
    setTimeLeft(config.timeLimit * 60);
    setLanguage(config.language);
    setBackspaceEnabled(config.backspaceEnabled);
    setAutoScroll(config.autoScroll);
    setShowColor(config.showColor);
    setHighlighter(config.highlighter);
  }, []);

  // ─── Timer Logic ───
  useEffect(() => {
    if (testState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTestComplete(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState]);

  // ─── Auto Scroll ───
  useEffect(() => {
    if (autoScroll && textDisplayRef.current && testState === 'running') {
      const currentWordIndex = Math.max(0, userWords.length - 1);
      const wordElements = textDisplayRef.current.querySelectorAll('[data-word-index]');
      if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [userWords.length, autoScroll, testState]);

  // ─── Handlers ───
  const handleStart = useCallback(() => {
    setTestState('running');
    setTimeLeft(timeLimit * 60);
    setTimeTaken(0);
    setUserInput('');
    setBackspaceCount(0);
    setStats(null);
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [timeLimit]);

  const handlePause = useCallback(() => {
    setTestState('paused');
  }, []);

  const handleResume = useCallback(() => {
    setTestState('running');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleReset = useCallback(() => {
    setTestState('idle');
    setTimeLeft(timeLimit * 60);
    setTimeTaken(0);
    setUserInput('');
    setBackspaceCount(0);
    setStats(null);
  }, [timeLimit]);

  const handleTestComplete = useCallback((auto: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestState('finished');

    const actualTimeMinutes = auto ? timeLimit : timeTaken / 60 || timeLimit / 60;
    const totalTypedWords = userWords.length;

    let correctWords = 0;
    let wrongWords = 0;

    userWords.forEach((word, idx) => {
      if (displayWords[idx] === word) {
        correctWords++;
      } else {
        wrongWords++;
      }
    });

    const missingWords = Math.max(0, displayWords.length - userWords.length);
    wrongWords += missingWords;

    const nwpm = Math.round((correctWords / actualTimeMinutes) * 10) / 10;
    const gwpm = Math.round((totalTypedWords / actualTimeMinutes) * 10) / 10;
    const accuracy = gwpm > 0 ? Math.round((nwpm * 100 / gwpm) * 10) / 10 : 0;

    const passThreshold = language === 'english' ? 30 : 20;
    const passed = nwpm >= passThreshold;

    setStats({
      nwpm,
      gwpm,
      accuracy,
      correctWords,
      wrongWords,
      totalTypedWords,
      missingWords,
      timeTaken: Math.round(actualTimeMinutes * 100) / 100,
      passed,
      passThreshold
    });
  }, [displayWords, language, timeLimit, timeTaken, userWords]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (testState !== 'running') return;

    const newValue = e.target.value;
    const diff = newValue.length - userInput.length;

    if (diff < 0) {
      setBackspaceCount((b) => b + Math.abs(diff));
    }

    setUserInput(newValue);
  }, [testState, userInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!backspaceEnabled && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      return;
    }
  }, [backspaceEnabled]);

  // ─── Fullscreen Toggle ───
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setFullscreen(false);
    }
  }, []);

  // ─── Format Time ───
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // ─── Live Stats ───
  const liveCorrect = useMemo(() => userWords.filter((w, i) => displayWords[i] === w).length, [userWords, displayWords]);
  const liveWrong = useMemo(() => Math.max(0, userWords.length - liveCorrect), [userWords.length, liveCorrect]);
  const liveTotal = userWords.length;
  const liveTime = (timeTaken / 60) || 0.1;
  const liveNwpm = useMemo(() => Math.round((liveCorrect / liveTime) * 10) / 10, [liveCorrect, liveTime]);

  // ─── Render Paragraph with Colors ───
  const renderParagraph = useCallback(() => {
    if (!showColor) {
      return <span className="text-gray-800 dark:text-gray-200">{currentParagraph}</span>;
    }

    // Are we actively mid-word (haven't finished it with a trailing space)?
    const isMidWord = userInput.length > 0 && !userInput.endsWith(' ');
    // Index of the word currently being typed / about to be typed
    const currentWordIdx = isMidWord ? userWords.length - 1 : userWords.length;

    return displayWords.map((word, idx) => {
      let className = 'text-gray-400 dark:text-gray-500';
      let bgClass = '';

      const isCompleted = idx < userWords.length && (idx < currentWordIdx || !isMidWord);

      if (isCompleted) {
        if (userWords[idx] === word) {
          className = 'text-green-600 dark:text-green-400 font-medium';
        } else {
          className = 'text-red-600 dark:text-red-400 font-medium';
        }
      }

      if (highlighter && testState === 'running' && idx === currentWordIdx) {
        bgClass = 'bg-yellow-200 dark:bg-yellow-600/30';
        if (isMidWord) {
          const typedSoFar = userWords[currentWordIdx] ?? '';
          className = word.startsWith(typedSoFar)
            ? 'text-gray-800 dark:text-gray-200 font-medium'
            : 'text-red-600 dark:text-red-400 font-medium';
        } else {
          className = 'text-gray-800 dark:text-gray-200 font-medium';
        }
      }

      return (
        <span key={idx} data-word-index={idx} className={`${className} ${bgClass} px-0.5 rounded`}>
          {word}
          {idx < displayWords.length - 1 ? ' ' : ''}
        </span>
      );
    });
  }, [showColor, currentParagraph, displayWords, userWords, highlighter, userInput, testState]);

  // ═════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═════════════════════════════════════════════════════════════
  if (testState === 'finished' && stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f4f8ff] via-[#c8ddff] to-[#a8c8f5] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-2 md:p-4 transition-colors duration-300">
        <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111.11%', marginLeft: '-5.555%' }}>
          <div className="flex items-center justify-center p-4 mt-19">
            <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-blue-300 dark:shadow-blue-900/20 shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-8">
                {/* Result Status */}
                <div className={`flex gap-3 p-5 text-center rounded-xl border-2 mb-8 ${stats.passed ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="text-3xl mb-3">{stats.passed ? '✅' : '😊'}</div>
                  <h2 className={`text-2xl font-bold ${stats.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {stats.passed ? 'PASSED' : 'better luck next time '}
                  </h2>
                  {!stats.passed && (
                    <p className="text-red-600 dark:text-red-400 mt-2">Required: {stats.passThreshold} NWPM • Scored: {stats.nwpm}</p>
                  )}
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4 mb-0">
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">NET WPM</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">{stats.nwpm}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">GROSS WPM</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">{stats.gwpm}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">ACCURACY</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">{stats.accuracy}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 p-6 rounded-xl text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">TIME TAKEN</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">{stats.timeTaken} min</p>

                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-5 text-center">WORD SUMMARY</h3>
                    <div className="flex justify-between text-center">
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.correctWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CORRECT</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.wrongWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">WRONG</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats.totalTypedWords}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">TOTAL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formula */}
                <div className="text-sm bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl -mt-30 px-1 border border-slate-100 dark:border-slate-600 mb-2">
                  <p><strong>NWPM:</strong> {stats.correctWords} / {stats.timeTaken} = <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.nwpm}</span></p>
                  <p><strong>GWPM:</strong> {stats.totalTypedWords} / {stats.timeTaken} = <span className="text-indigo-600 dark:text-indigo-400 font-medium">{stats.gwpm}</span></p>
                  <p><strong>Accuracy:</strong> ({stats.nwpm} × 100) / {stats.gwpm} = <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.accuracy}%</span></p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 transition"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={() => {
                      handleReset();
                      setShowWelcomeModal(true);
                    }}
                    className="flex-1 py-4 bg-[#0F172A] dark:bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-950 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8ff] via-[#c8ddff] to-[#a8c8f5] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-2 md:p-4 transition-colors duration-300">
      {/* 90% Zoom Wrapper */}
      <div style={{ transform: 'scale(0.9)', transformOrigin: 'top center', width: '111.11%', marginLeft: '-5.555%' }}>
        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onConfirm={handleModalConfirm}
        />

        <div className="max-w-7xl mx-auto">
          {/* Main Card */}
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden mt-22 border border-gray-200 dark:border-slate-700">

            {/* Top Info Bar */}
            <div className="bg-gray-200 dark:bg-slate-700 px-4 py-2 flex justify-between items-center border-b border-gray-300 dark:border-slate-600">
              <div className="w-20"></div>
              <div className="flex gap-6 md:gap-12 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <span>Paragraph-{paragraphDisplayNumber}</span>
                <span>{timeLimit} Min.</span>
                <span className="hidden md:inline">{language === 'english' ? 'English' : 'Hindi'}</span>
              </div>
              <div className="w-20 text-right">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Toggles Bar */}
            <div className="bg-gray-100 dark:bg-slate-800 px-4 py-3 flex flex-wrap gap-4 md:gap-6 border-b border-gray-300 dark:border-slate-600">
              <ToggleSwitch
                label="Backspace"
                checked={backspaceEnabled}
                onChange={() => setBackspaceEnabled(!backspaceEnabled)}
                count={backspaceCount}
              />
              <ToggleSwitch
                label="AutoScroll"
                checked={autoScroll}
                onChange={() => setAutoScroll(!autoScroll)}
              />
              <ToggleSwitch
                label="Color"
                checked={showColor}
                onChange={() => setShowColor(!showColor)}
              />
              <ToggleSwitch
                label="Highlighter"
                checked={highlighter}
                onChange={() => setHighlighter(!highlighter)}
              />
              <ToggleSwitch
                label="Fullscreen"
                checked={fullscreen}
                onChange={toggleFullscreen}
              />
              <ToggleSwitch
                label="Menu"
                checked={menuOpen}
                onChange={() => setMenuOpen(!menuOpen)}
              />
            </div>

            {/* Menu Panel */}
            {menuOpen && (
              <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-300 dark:border-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Time Limit</label>
                    <select
                      value={timeLimit}
                      onChange={(e) => {
                        const t = Number(e.target.value);
                        setTimeLimit(t);
                        setTimeLeft(t * 60);
                      }}
                      className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={testState !== 'idle'}
                    >
                      <option value={5}>5 Minutes ({WORD_COUNTS[5]} words)</option>
                      <option value={10}>10 Minutes ({WORD_COUNTS[10]} words)</option>
                      <option value={15}>15 Minutes ({WORD_COUNTS[15]} words)</option>
                      <option value={20}>20 Minutes ({WORD_COUNTS[20]} words)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setLanguage('english'); }}
                        className={`flex-1 py-1.5 rounded text-sm font-semibold transition ${language === 'english' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                        disabled={testState !== 'idle'}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { setLanguage('hindi'); }}
                        className={`flex-1 py-1.5 rounded text-sm font-semibold transition ${language === 'hindi' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                        disabled={testState !== 'idle'}
                      >
                        Hindi
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Font Size</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-3 py-1 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500 text-sm dark:text-gray-200">A-</button>
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded text-sm dark:text-gray-200">{fontSize}px</span>
                      <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-3 py-1 bg-gray-200 dark:bg-slate-600 rounded hover:bg-gray-300 dark:hover:bg-slate-500 text-sm dark:text-gray-200">A+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paragraph Display */}
            <div className="px-4 py-4">
              <div
                ref={textDisplayRef}
                className="bg-white dark:bg-slate-900 border border-gray-400 dark:border-slate-600 rounded p-4 h-40 overflow-y-auto"
                style={{ fontSize: `${fontSize}px` }}
              >
                <p className={`leading-relaxed ${language === 'hindi' ? 'font-sans' : ''}`}>
                  {renderParagraph()}
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-2 pb-2">
              <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded py-2 px-4 flex justify-center gap-8 md:gap-16">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">K: {liveCorrect}</span>
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">K: {liveWrong}</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">W: {liveTotal}</span>
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">W: {liveNwpm}</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-2">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={testState !== 'running'}
                placeholder={
                  testState === 'idle'
                    ? 'Click Start to begin typing...'
                    : testState === 'paused'
                      ? 'Test Paused - Click Resume to continue'
                      : 'Start typing here...'
                }
                className={`w-full h-32 md:h-40 p-4 border-2 border-gray-400 dark:border-slate-600 rounded resize-none focus:outline-none focus:border-blue-500 text-base ${language === 'hindi' ? 'font-sans' : ''} ${testState !== 'running' ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100'}`}
                style={{ fontSize: `${fontSize}px` }}
                spellCheck={false}
              />
            </div>

            {/* Bottom Controls */}
            <div className="px-4 py-4 bg-gray-100 dark:bg-slate-800 border-t border-gray-300 dark:border-slate-600 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {testState === 'idle' && (
                  <button
                    onClick={handleStart}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Start
                  </button>
                )}
                {testState === 'running' && (
                  <button
                    onClick={handlePause}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    Pause
                  </button>
                )}
                {testState === 'paused' && (
                  <button
                    onClick={handleResume}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Resume
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded border border-gray-300 dark:border-slate-600"
                  title="Zoom In"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded border border-gray-300 dark:border-slate-600"
                  title="Zoom Out"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                  Reset
                </button>
              </div>

              <button
                onClick={() => handleTestComplete(false)}
                disabled={testState === 'idle'}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 text-white rounded font-semibold transition flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                Submit
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-4 text-center text-gray-400 dark:text-gray-500 text-sm">
            <p>CPCT Typing Test | {language === 'english' ? 'Min 30 NWPM to Pass' : 'Min 20 NWPM to Pass'} | Backspace Allowed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
