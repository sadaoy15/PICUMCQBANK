import { QuestionVisuals } from "@/types/question";

// The source PDF repeats several question sets and often places figures on a
// page shared by adjacent items. Keep a semantic, per-question map here rather
// than inheriting every image extracted from a nearby page.
export const picuMcqVisualAssets: Record<number, QuestionVisuals> = {
  3413: {
    question: [{ src: "/images/picumcq/picumcq-pg20-img1.jpeg", label: "Volume-pressure loop", caption: "Single-breath volume-pressure loop labeled A-B-C-A." }],
  },
  3664: {
    question: [{ src: "/images/picumcq/picumcq-pg21-img1.jpeg", label: "Venous return and cardiac output curves", caption: "Venous return curves A, B, and C plotted against right atrial pressure, with the cardiac output curve shown." }],
  },
  3421: {
    question: [
      { src: "/images/picumcq/picumcq-pg36-img1.jpeg", label: "Electrocardiogram", caption: "Postoperative rhythm tracing obtained during the patient's hemodynamic deterioration." },
      { src: "/images/picumcq/picumcq-pg36-img2.jpeg", label: "Chest radiograph", caption: "Postoperative chest radiograph obtained during the same episode." },
    ],
  },
  3430: {
    question: [{ src: "/images/picumcq/picumcq-pg41-img1.jpeg", label: "Rhythm strip", caption: "Postoperative rhythm strip following tetralogy of Fallot repair." }],
  },
  3441: {
    question: [{ src: "/images/picumcq/picumcq-pg45-img1.jpeg", label: "Cardiac catheterization data", caption: "Pressure and oxygen-saturation measurements from the cardiac catheterization." }],
  },
  3447: {
    question: [{ src: "/images/picumcq/picumcq-pg48-img1.jpeg", label: "Rhythm strip", caption: "Rhythm recorded during postoperative hypotension and tachycardia." }],
  },
  3426: {
    explanation: [
      { src: "/images/picumcq/picumcq-pg59-img1.jpeg", label: "APRV pressure-time waveform", caption: "Airway pressure release ventilation alternates a prolonged high-pressure phase with brief releases." },
      { src: "/images/picumcq/picumcq-pg60-img1.jpeg", label: "APRV expiratory flow waveform", caption: "The release phase is ended while expiratory flow remains about 50%-75% of peak expiratory flow." },
    ],
  },
  3463: {
    question: [{ src: "/images/picumcq/picumcq-pg91-img1.jpeg", label: "Electrocardiogram", caption: "Rhythm recorded before placement of a transvenous pacer." }],
  },
  3465: {
    question: [{ src: "/images/picumcq/picumcq-pg93-img1.jpeg", label: "Pulmonary artery waveform", caption: "Pressure waveform recorded during positive-pressure ventilation." }],
  },
  3468: {
    question: [{ src: "/images/picumcq/picumcq-pg95-img1.jpeg", label: "Pulmonary artery occlusion tracing", caption: "Transition from pulmonary artery pressure to the displayed pulmonary artery occlusion pressure." }],
  },
  3474: {
    question: [{ src: "/images/picumcq/picumcq-pg100-img1.jpeg", label: "Chest radiograph", caption: "Chest radiograph obtained before intubation in severe acute pancreatitis." }],
  },
  3519: {
    question: [{ src: "/images/picumcq/picumcq-pg116-img1.jpeg", label: "Abdominal CT", caption: "Contrast-enhanced CT showing the splenic injury described in the vignette." }],
  },
  3522: {
    question: [{ src: "/images/picumcq/picumcq-pg162-img1.jpeg", label: "Splenic injury grading", caption: "American Association for the Surgery of Trauma grading criteria for splenic injury." }],
  },
  3524: {
    question: [{ src: "/images/picumcq/picumcq-pg120-img1.jpeg", label: "Lateral neck radiograph", caption: "Soft-tissue neck radiograph after penetrating oropharyngeal trauma." }],
  },
  3540: {
    question: [{ src: "/images/picumcq/picumcq-pg191-img1.jpeg", label: "Electrocardiogram", caption: "ECG obtained after chemotherapy in the setting of acute tumor lysis syndrome." }],
  },
  3546: {
    question: [{ src: "/images/picumcq/picumcq-pg194-img1.jpeg", label: "Chest radiograph", caption: "Chest radiograph after blunt upper-abdominal trauma." }],
  },
  3547: {
    question: [{ src: "/images/picumcq/picumcq-pg195-img1.jpeg", label: "Serum and urine studies", caption: "Serum and urine electrolyte, osmolality, glucose, and specific-gravity results." }],
  },
  3551: {
    question: [
      { src: "/images/picumcq/picumcq-pg197-img1.jpeg", label: "Chest radiograph", caption: "Initial chest radiograph in the child with respiratory distress and wheezing." },
      { src: "/images/picumcq/picumcq-pg197-img2.jpeg", label: "Chest CT", caption: "Chest CT obtained to characterize the mediastinal abnormality." },
    ],
  },
  3553: {
    question: [{ src: "/images/picumcq/picumcq-pg198-img1.jpeg", label: "Electrocardiogram", caption: "Admission ECG demonstrating atrioventricular dissociation consistent with complete (third-degree) heart block." }],
  },
  3562: {
    question: [{ src: "/images/picumcq/picumcq-pg202-img1.jpeg", label: "Electrocardiogram", caption: "ECG obtained in the patient with altered mental status." }],
  },
  3568: {
    question: [{ src: "/images/picumcq/picumcq-pg205-img1.jpeg", label: "Abdominal CT", caption: "CT showing the traumatic liver injury described in the vignette." }],
  },
  3574: {
    explanation: [{ src: "/images/picumcq/picumcq-pg260-img1.jpeg", label: "Half-life calculation", caption: "First-order elimination calculation using the two measured gentamicin concentrations." }],
  },
  3586: {
    question: [{ src: "/images/picumcq/picumcq-pg244-img1.jpeg", label: "Skin findings", caption: "Diffuse erythematous vesicular eruption described in the vignette." }],
  },
  3590: {
    question: [{ src: "/images/picumcq/picumcq-pg246-img1.jpeg", label: "Bone marrow aspirate", caption: "Bone marrow aspirate obtained during evaluation of fever, cytopenias, and hepatosplenomegaly." }],
  },
  3594: {
    question: [{ src: "/images/picumcq/picumcq-pg248-img1.jpeg", label: "Bedside monitor tracing", caption: "Simultaneous arterial-pressure and respiratory waveforms." }],
  },
  3595: {
    question: [{ src: "/images/picumcq/picumcq-pg249-img1.jpeg", label: "Serial chest radiographs", caption: "Morning radiograph (A) and radiograph obtained during acute deterioration (B)." }],
  },
  3598: {
    question: [{ src: "/images/picumcq/picumcq-pg252-img1.jpeg", label: "Chest CT", caption: "Preliminary coronal CT image obtained before the child could tolerate supine positioning." }],
  },
  3604: {
    question: [{ src: "/images/picumcq/picumcq-pg256-img1.jpeg", label: "Skin findings", caption: "Bullous mucocutaneous eruption with a positive Nikolsky sign." }],
  },
  3605: {
    question: [{ src: "/images/picumcq/picumcq-pg304-img1.jpeg", label: "Peripheral nerve diagram", caption: "The arrow marks the peripheral myelin/Schwann-cell region targeted by the disease process." }],
  },
  3610: {
    question: [{ src: "/images/picumcq/picumcq-pg295-img1.jpeg", label: "Fundoscopic examination", caption: "Bilateral retinal findings in the infant evaluated after a first afebrile seizure." }],
  },
  3634: {
    question: [{ src: "/images/picumcq/picumcq-pg310-img1.jpeg", label: "Chest radiograph", caption: "Post-intubation radiograph in sepsis-associated pediatric ARDS." }],
  },
  3641: {
    question: [{ src: "/images/picumcq/picumcq-pg314-img1.jpeg", label: "Brain MRI", caption: "FLAIR MRI obtained after headache, visual symptoms, severe hypertension, and seizure." }],
  },
  3649: {
    question: [{ src: "/images/picumcq/picumcq-pg319-img1.jpeg", label: "Cardiorespiratory tracing", caption: "Lead II, respiratory, and oxygen-saturation traces recorded after adenosine." }],
  },
  3662: {
    explanation: [
      { src: "/images/picumcq/picumcq-pg382-img1.jpeg", label: "Venous return after increased right atrial pressure", caption: "Higher intrathoracic pressure moves the operating point from A to B and decreases venous return." },
      { src: "/images/picumcq/picumcq-pg382-img2.jpeg", label: "Venous return after volume loading", caption: "Volume loading shifts the venous-return curve rightward and moves the operating point from B to C." },
    ],
  },
};
