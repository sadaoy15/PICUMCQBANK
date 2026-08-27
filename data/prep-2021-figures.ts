import type { QuestionVisuals } from "@/types/question";

// The source DOCX embeds the item-stem figures. The original PREP PDF also
// contains the referenced explanation figures, tables, and algorithms below.
export const prep2021VisualAssets: Record<number, QuestionVisuals> = {
  1291: {
    explanation: [{ src: "/images/prep-2021/q1291-lvad.png", label: "Figure", caption: "Continuous-flow left ventricular assist device (LVAD) used in the discussion." }],
  },
  1302: {
    explanation: [
      { src: "/images/prep-2021/q1302-mucosal-immunity.png", label: "Figure 1", caption: "Mucosal immune-system response and pathways contributing to sepsis." },
      { src: "/images/prep-2021/q1302-gut-origin-sepsis.png", label: "Figure 2", caption: "Gut-origin hypothesis of sepsis." },
    ],
  },
  1306: {
    explanation: [{ src: "/images/prep-2021/q1306-antipsychotic-toxicities.png", label: "Table", caption: "Toxicities associated with antipsychotic agents." }],
  },
  1308: {
    explanation: [{ src: "/images/prep-2021/q1308-neuromuscular-blockers.png", label: "Table", caption: "Properties of neuromuscular blocking drugs." }],
  },
  1316: {
    explanation: [{ src: "/images/prep-2021/q1316-prifle.png", label: "Table", caption: "Pediatric RIFLE (pRIFLE) criteria for acute kidney injury." }],
  },
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
    explanation: [
      { src: "/images/prep2021-image6.png", label: "Referenced figure", caption: "Chest radiograph used in the discussion of the pulmonary complication" },
      { src: "/images/prep-2021/q1319-ct-treatment.png", label: "Figure 2", caption: "Chest CT before and after treatment of invasive pulmonary aspergillosis." },
    ],
  },
  1320: {
    explanation: [{ src: "/images/prep-2021/q1320-cerebral-autoregulation.png", label: "Figure", caption: "Relationship between mean arterial pressure and cerebral blood flow in an adolescent." }],
  },
  1323: {
    question: [{ src: "/images/prep2021-image7.png", label: "Figure 1", caption: "Central venous pressure waveform compared with a normal tracing" }],
    explanation: [
      { src: "/images/prep2021-image7.png", label: "Figure 1", caption: "Central venous waveform supporting the discussion of cardiac tamponade." },
      { src: "/images/prep-2021/q1323-tamponade-pressure-volume.png", label: "Figure 2", caption: "Pericardial tamponade pressure-volume relationship." },
      { src: "/images/prep-2021/q1323-pericardial-effusion-causes.png", label: "Table", caption: "Common causes of pericardial effusion." },
    ],
  },
  1324: {
    explanation: [
      { src: "/images/prep-2021/q1324-misc-definition.png", label: "Table", caption: "CDC case definition for multisystem inflammatory syndrome in children (MIS-C)." },
      { src: "/images/prep-2021/q1324-misc-organ-involvement.png", label: "Figure", caption: "Organ-system involvement and overlap in MIS-C." },
    ],
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
    explanation: [
      { src: "/images/prep2021-image10.png", label: "Figure 1", caption: "Cardiac monitor strip used in the ventricular tachyarrhythmia discussion." },
      { src: "/images/prep-2021/q1329-torsades.png", label: "Figure 2", caption: "Initial ectopic beat degenerating into torsades de pointes." },
    ],
  },
  1330: {
    explanation: [{ src: "/images/prep-2021/q1330-palliative-sedation.png", label: "Figure", caption: "Algorithm for palliative sedation therapy." }],
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
    explanation: [
      { src: "/images/prep2021-image13.png", label: "Figure 1", caption: "Chest radiograph used in the ventilation strategy discussion." },
      { src: "/images/prep-2021/q1344-preterm-lung-heterogeneity.png", label: "Figure 2", caption: "Lung heterogeneity in premature infants compared with classic ARDS." },
    ],
  },
  1341: {
    explanation: [{ src: "/images/prep-2021/q1341-glasgow-coma-scale.png", label: "Table", caption: "Glasgow Coma Scale: motor, verbal, and eye-opening responses." }],
  },
  1343: {
    explanation: [{ src: "/images/prep-2021/q1343-heart-long-axis.png", label: "Figure 1", caption: "Schematic diagram of the long-axis view of the heart." }],
  },
  1347: {
    explanation: [{ src: "/images/prep-2021/q1347-thyroid-storm-triggers.png", label: "Table", caption: "Factors precipitating thyroid storm." }],
  },
  1349: {
    explanation: [
      { src: "/images/prep-2021/q1349-refeeding-risk-factors.png", label: "Table", caption: "Risk factors for refeeding syndrome." },
      { src: "/images/prep-2021/q1349-refeeding-pathophysiology.png", label: "Figure", caption: "Pathophysiology of refeeding syndrome." },
    ],
  },
  1350: {
    explanation: [{ src: "/images/prep-2021/q1350-campbell-diagram.png", label: "Figure", caption: "Campbell diagrams for a healthy patient and a patient with ascites." }],
  },
};
