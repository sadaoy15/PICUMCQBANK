import type { QuestionVisuals } from "@/types/question";

// Figures embedded in the PREP PICU 2021 source DOCX. Each source image
// occurs in the item stem and is repeated in the explanation for reference.
export const prep2021VisualAssets: Record<number, QuestionVisuals> = {
  1285: {
    question: [{ src: "/images/prep2021-image1.png", label: "Figure 1", caption: "Contrast-enhanced chest CT from the vignette" }],
    explanation: [{ src: "/images/prep2021-image1.png", label: "Referenced figure", caption: "Contrast-enhanced chest CT used in the pulmonary embolism discussion" }],
  },
  1295: {
    question: [{ src: "/images/prep2021-image2.png", label: "Figure 1", caption: "Cardiac monitor rhythm strip from the resuscitation vignette" }],
    explanation: [{ src: "/images/prep2021-image2.png", label: "Referenced figure", caption: "Cardiac monitor rhythm strip used in the resuscitation discussion" }],
  },
  1307: {
    question: [{ src: "/images/prep2021-image3.png", label: "Figure 1", caption: "Embedded tick on the patient's scalp" }],
    explanation: [{ src: "/images/prep2021-image3.png", label: "Referenced figure", caption: "Embedded tick supporting the diagnosis of tick paralysis" }],
  },
  1309: {
    question: [{ src: "/images/prep2021-image4.png", label: "Figure 1", caption: "Brain MRI from the hypertensive seizure vignette" }],
    explanation: [{ src: "/images/prep2021-image4.png", label: "Referenced figure", caption: "Brain MRI demonstrating the imaging pattern discussed for posterior reversible encephalopathy syndrome" }],
  },
  1312: {
    question: [{ src: "/images/prep2021-image5.png", label: "Figure 1", caption: "T2-weighted brain MRI from the post-transplant encephalitis vignette" }],
    explanation: [{ src: "/images/prep2021-image5.png", label: "Referenced figure", caption: "T2-weighted brain MRI used in the post-transplant encephalitis discussion" }],
  },
  1319: {
    question: [{ src: "/images/prep2021-image6.png", label: "Figure 1", caption: "Chest radiograph from the post-transplant respiratory deterioration vignette" }],
    explanation: [{ src: "/images/prep2021-image6.png", label: "Referenced figure", caption: "Chest radiograph used in the discussion of the pulmonary complication" }],
  },
  1323: {
    question: [{ src: "/images/prep2021-image7.png", label: "Figure 1", caption: "Central venous pressure waveform compared with a normal tracing" }],
    explanation: [{ src: "/images/prep2021-image7.png", label: "Referenced figure", caption: "Central venous waveform supporting the discussion of cardiac tamponade" }],
  },
  1325: {
    question: [{ src: "/images/prep2021-image8.png", label: "Figure 1", caption: "Chest radiograph from the vaping-associated lung injury vignette" }],
    explanation: [{ src: "/images/prep2021-image8.png", label: "Referenced figure", caption: "Chest radiograph used in the vaping-associated lung injury discussion" }],
  },
  1328: {
    question: [{ src: "/images/prep2021-image9.png", label: "Figure 1", caption: "Cerebrospinal fluid Gram stain from the meningitis vignette" }],
    explanation: [{ src: "/images/prep2021-image9.png", label: "Referenced figure", caption: "Cerebrospinal fluid Gram stain used in the meningitis discussion" }],
  },
  1329: {
    question: [{ src: "/images/prep2021-image10.png", label: "Figure 1", caption: "Initial cardiac monitor strip from the cardiac arrest vignette" }],
    explanation: [{ src: "/images/prep2021-image10.png", label: "Referenced figure", caption: "Cardiac monitor strip used in the ventricular tachyarrhythmia discussion" }],
  },
  1333: {
    question: [{ src: "/images/prep2021-image11.png", label: "Figure 1", caption: "Chest radiograph from the infant with inspiratory stridor" }],
    explanation: [{ src: "/images/prep2021-image11.png", label: "Referenced figure", caption: "Chest radiograph used in the laryngomalacia discussion" }],
  },
  1338: {
    question: [{ src: "/images/prep2021-image12.png", label: "Figure 1", caption: "Electrocardiogram demonstrating ventricular pre-excitation" }],
    explanation: [{ src: "/images/prep2021-image12.png", label: "Referenced figure", caption: "Electrocardiogram used in the Wolff-Parkinson-White discussion" }],
  },
  1344: {
    question: [{ src: "/images/prep2021-image13.png", label: "Figure 1", caption: "Chest radiograph from the premature infant with bronchiolitis" }],
    explanation: [{ src: "/images/prep2021-image13.png", label: "Referenced figure", caption: "Chest radiograph used in the ventilation strategy discussion" }],
  },
};
