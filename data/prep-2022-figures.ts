import type { QuestionVisuals } from "@/types/question";

// Visuals transcribed from the original PREP ICU 2022 PDF and assigned by
// clinical meaning, figure number, and caption rather than page proximity.
export const prep2022VisualAssets: Record<number, QuestionVisuals> = {
  1072: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1072-p28-im7.jpg", label: "Figure 1", caption: "Patient described in the vignette" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1072-p29-im8.jpg", label: "Figure 2", caption: "Varicella lesions in different stages of development" },
      { src: "/images/prep-2022/prep-2022-q1072-p30-im9.jpg", label: "Figure 3", caption: "Facial varicella lesions in different stages of development" },
    ],
  },
  1073: {
    choices: {
      A: [{ src: "/images/prep-2022/prep-2022-q1073-p32-im10.jpg", label: "Choice A tracing", caption: "Generalized status epilepticus" }],
      B: [{ src: "/images/prep-2022/prep-2022-q1073-p32-im11.jpg", label: "Choice B tracing", caption: "Sleep spindles" }],
      C: [{ src: "/images/prep-2022/prep-2022-q1073-p33-im13.jpg", label: "Choice C tracing", caption: "Awake electroencephalogram" }],
      D: [{ src: "/images/prep-2022/prep-2022-q1073-p33-im14.jpg", label: "Choice D tracing", caption: "Burst-suppression pattern" }],
    },
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1073-p40-im18.jpg", label: "Figure 1", caption: "Generalized status epilepticus with diffuse high-voltage rapid waves" },
      { src: "/images/prep-2022/prep-2022-q1073-p39-im17.jpg", label: "Figure 2", caption: "Sleep spindles on electroencephalography" },
      { src: "/images/prep-2022/prep-2022-q1073-p38-im16.jpg", label: "Figure 3", caption: "Electroencephalogram of an awake child" },
      { src: "/images/prep-2022/prep-2022-q1073-p41-im19.jpg", label: "Figure 4", caption: "Burst-suppression pattern on electroencephalography" },
      { src: "/images/prep-2022/prep-2022-q1073-p37-im15.png", label: "Figure 5", caption: "The 10-20 system for electroencephalography lead placement" },
    ],
  },
  1074: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1074-p46-im20.jpg", label: "Explanation figure", caption: "Pathogenesis of hypertensive emergency" },
    ],
  },
  1078: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1078-p66-im21.jpg", label: "Figure 1", caption: "Computed tomographic scan of the patient's head" },
    ],
  },
  1082: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1082-p82-im22.jpg", label: "Explanation figure", caption: "Vesicles from neonatal herpes simplex virus type 2 infection" },
    ],
  },
  1091: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1091-p118-im28.png", label: "Equation 1", caption: "Instantaneous airway pressure" },
      { src: "/images/prep-2022/prep-2022-q1091-p119-im29.png", label: "Equation 2", caption: "Airway resistance and respiratory-system elastance components" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1091-p119-im30.png", label: "Equation key", caption: "Definitions of the variables used in Equation 2" },
    ],
  },
  1096: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1096-p139-im32.jpg", label: "Explanation figure", caption: "Cerebral blood flow autoregulation in normal and chronic hypertension" },
    ],
  },
  1098: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1098-p150-im33.jpg", label: "Vignette figure", caption: "Thin blood smear shown in the question" },
    ],
  },
  1101: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1101-p165-im34.jpg", label: "Vignette figure", caption: "Chest radiograph of the patient described in the vignette" },
    ],
  },
  1102: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1102-p170-im35.jpg", label: "Explanation figure", caption: "Wright-stained cerebrospinal fluid specimen showing Naegleria fowleri" },
    ],
  },
  1103: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1103-p175-im36.jpg", label: "Figure 1", caption: "Frontal chest radiograph of the patient" },
      { src: "/images/prep-2022/prep-2022-q1103-p176-im37.jpg", label: "Figure 2", caption: "Lateral chest radiograph of the patient" },
    ],
  },
  1104: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1104-p181-im38.jpg", label: "Figure 1", caption: "Surface electrocardiogram from the vignette" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1104-p182-im39.jpg", label: "Figure 2", caption: "Atrial electrogram" },
    ],
  },
  1107: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1107-p195-im40.jpg", label: "Figure 1", caption: "Electrocardiogram from the vignette" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1107-p196-im41.png", label: "Figure 2", caption: "Torsades de pointes" },
    ],
  },
  1108: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1108-p202-im42.png", label: "Vignette figure", caption: "Snake photographed after the envenomation" },
    ],
  },
  1114: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1114-p224-im43.jpg", label: "Figure 1", caption: "Sagittal head and neck computed tomography" },
      { src: "/images/prep-2022/prep-2022-q1114-p225-im44.jpg", label: "Figure 2", caption: "Axial head and neck computed tomography" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1114-p226-im45.jpg", label: "Figure 3", caption: "Internal jugular venous thrombus with gas and surrounding contrast" },
      { src: "/images/prep-2022/prep-2022-q1114-p227-im46.jpg", label: "Figure 4", caption: "Axial view of thrombus with embedded gas" },
    ],
  },
  1122: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1122-p254-im47.jpg", label: "Four months earlier", caption: "Initial coronal brain computed tomography" },
      { src: "/images/prep-2022/prep-2022-q1122-p254-im48.jpg", label: "Present", caption: "Current coronal brain computed tomography" },
    ],
  },
  1128: {
    question: [
      { src: "/images/prep-2022/prep-2022-q1128-p284-im50.jpg", label: "Figure 1", caption: "Rotational thromboelastometry from the vignette" },
    ],
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1128-p285-im51.jpg", label: "Figure 2", caption: "Prolonged rotational thromboelastometry demonstrating hyperfibrinolysis" },
    ],
  },
  1130: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1130-p293-im52.png", label: "Explanation equation", caption: "Compliance, rate, oxygenation, and pressure index (CROP)" },
    ],
  },
  1136: {
    explanation: [
      { src: "/images/prep-2022/prep-2022-q1136-p319-im53.png", label: "Explanation equation", caption: "Revised Schwartz equation for estimated glomerular filtration rate" },
    ],
  },
};
