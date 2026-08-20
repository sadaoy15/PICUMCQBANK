import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OCR_FILE = path.join(ROOT, "tmp/pdfs/mcckap-2023/tesseract.json");
const PAGE_DIRECTORY = path.join(ROOT, "tmp/pdfs/mcckap-2023/pages");
const ASSET_DIRECTORY = path.join(ROOT, "public/images/mcckap-2023");
const OUTPUT_FILE = path.join(ROOT, "data/mcckap-2023-questions.ts");
const SOURCE = "Pediatric Multidisciplinary Critical Care Knowledge Assessment Program 2023";
const CATEGORY = "MCCKAP 2023";

const pageNumberOverrides = new Map([
  [17, 16],
  [29, 28],
  [49, 43],
  [128, 109],
  [129, 110],
  [209, 183],
]);

const answerOverrides = new Map([
  // The source page uses a yellow annotation instead of the normal green answer state.
  [43, "D"],
  [39, "A"],
  [110, "A"],
]);

const choiceOverrides = new Map([
  [3, {
    A: "Inspiratory and expiratory wheeze",
    B: "Inspiratory and expiratory stridor",
    C: "Pain and swelling of peritonsillar tissues",
    D: "Sitting in a tripod position for maximal comfort",
  }],
  [5, { A: "1", B: "2", C: "3", D: "4", E: "5" }],
  [7, {
    A: "A 1-month-old infant with nonaccidental trauma",
    B: "A 3-year-old victim of a house fire",
    C: "A 6-year-old with sickle cell anemia admitted for pain crisis",
    D: "A 15-year-old female with sepsis, hypotension, and acute respiratory distress syndrome",
    E: "An alert 18-year-old male found naked outside following a fraternity prank",
  }],
  [9, {
    A: "Linear process with a constant fraction of drug eliminated per unit of time",
    B: "Linear process with a constant amount of drug eliminated per unit of time",
    C: "Nonlinear process with a constant fraction of drug eliminated per unit of time",
    D: "Nonlinear process with a constant amount of drug eliminated per unit of time",
  }],
  [12, {
    A: "Particles move across a semipermeable membrane secondary to a pressure gradient.",
    B: "Particles move across a semipermeable membrane from an area of high concentration to low concentration.",
    C: "Fluid moves across a semipermeable membrane secondary to a pressure gradient.",
    D: "Molecules bind to albumin and are carried across a semipermeable membrane.",
  }],
  [16, {
    A: "Perform escharotomy along bilateral anterior axillary lines.",
    B: "Initiate chest tube placement bilaterally.",
    C: "Increase PEEP to 14 cm H2O.",
    D: "Transition to high-frequency oscillatory ventilation with mean airway pressure 3-5 cm H2O higher than currently measured.",
    E: "Initiate venovenous extracorporeal membrane oxygenation.",
  }],
  [19, {
    A: "Avoid phosphate administration.",
    B: "Maintain blood glucose between 90 and 120 mg/dL.",
    C: "Provide 1.5 times the maintenance fluid rate.",
    D: "Maintain serum sodium at 150 to 160 mmol/L.",
  }],
  [22, {
    A: "Diastolic blood pressure is the most accurate measurement of the arterial pressure monitoring system.",
    B: "An underdamped system will record falsely high diastolic blood pressures.",
    C: "Systolic blood pressure will measure higher in the axillary artery than in the dorsalis pedis artery.",
    D: "The dicrotic notch will appear later on the dicrotic limb in the dorsalis pedis artery than in the axillary artery.",
    E: "The dicrotic notch represents left ventricle filling.",
  }],
  [23, {
    A: "Antibody production",
    B: "Phagocytosis",
    C: "Innate immunity",
    D: "Cellular immunity",
    E: "Complement components",
  }],
  [24, {
    A: "Poor ventricular compliance",
    B: "Mitral valve regurgitation",
    C: "Elevated pulmonary vascular resistance",
    D: "Thrombosis at the site of the anastomosis",
  }],
  [30, {
    A: "Venovenous cannulation using a femoral vein and right internal jugular vein",
    B: "Venovenous cannulation using both femoral veins",
    C: "Venoarterial cannulation using the right internal jugular vein and right carotid artery",
    D: "Venoarterial cannulation using the right internal jugular vein and right femoral artery",
  }],
  [31, {
    A: "Inhaled nitric oxide at 20 ppm via high-flow nasal cannula",
    B: "Continuous alteplase infusion",
    C: "Bolus dose of heparin followed by continuous infusion",
    D: "Surgical embolectomy",
  }],
  [32, {
    A: "A 3-month-old infant born at 39 weeks' gestation",
    B: "A 7-month-old infant who was unconscious and not breathing for 2 minutes after a near-drowning incident",
    C: "A 3-year-old child with a blood pressure of 110/55 mm Hg",
    D: "A 3-year-old child who experienced generalized tonic-clonic seizure activity for 60 minutes",
  }],
  [35, {
    A: "It spreads through contaminated water.",
    B: "It forms cysts in the brain.",
    C: "It causes multiorgan failure.",
    D: "It remains dormant in the spleen.",
    E: "It is preventable through vaccination.",
  }],
  [36, {
    A: "It should be avoided during cardiopulmonary bypass.",
    B: "It may detect both cortical and subcortical oxygenation.",
    C: "It is more appropriate for adults than for children.",
    D: "It should be avoided in patients with cyanotic heart disease.",
    E: "It is correlated with central venous saturation.",
  }],
  [40, {
    A: "Bronchopneumonia",
    B: "Werdnig-Hoffmann disease, type 1",
    C: "Flail chest",
    D: "Narcotic overdose",
    E: "Neuromuscular scoliosis",
  }],
  [44, { A: "7", B: "8", C: "9", D: "10", E: "11" }],
  [39, {
    A: "Sodium: low; potassium: low; glucose: low; phosphorus: low",
    B: "Sodium: normal; potassium: high; glucose: low; phosphorus: normal",
    C: "Sodium: low; potassium: high; glucose: low; phosphorus: low",
    D: "Sodium: normal; potassium: high; glucose: high; phosphorus: normal",
    E: "Sodium: normal; potassium: low; glucose: low; phosphorus: low",
  }],
  [43, {
    A: "126 mEq/L",
    B: "132 mEq/L",
    C: "134 mEq/L",
    D: "140 mEq/L",
    E: "144 mEq/L",
  }],
  [46, {
    A: "Transesophageal echocardiography",
    B: "Cardiac MRI",
    C: "Cardiac catheterization",
    D: "CT",
    E: "Serum troponin level",
  }],
  [61, {
    A: "Add carnitine, 20 mg/kg",
    B: "Decrease dextrose to 17.5%",
    C: "Increase lipid emulsion to 2.5 g/kg",
    D: "Initiate trophic feeds at 5 mL/hr",
    E: "Increase amino acids to 3 g/kg",
  }],
  [63, {
    A: "Procalcitonin",
    B: "B-type natriuretic peptide",
    C: "Thyroid-stimulating hormone",
    D: "Botulinum toxin",
    E: "Urine toxicology screen",
  }],
  [65, {
    A: "Esmolol",
    B: "Amiodarone",
    C: "Verapamil",
    D: "Digoxin",
    E: "Procainamide",
  }],
  [68, {
    A: "Acute respiratory acidosis with type I renal tubular acidosis",
    B: "Acute respiratory acidosis with type IV renal tubular acidosis",
    C: "Acute respiratory alkalosis with type II renal tubular acidosis",
    D: "Chronic respiratory acidosis with type II renal tubular acidosis",
    E: "Chronic respiratory alkalosis with type I renal tubular acidosis",
  }],
  [69, {
    A: "0.05",
    B: "0.8",
    C: "0.2",
    D: "17",
  }],
  [72, {
    A: "CT scan of the head",
    B: "MRI of the head",
    C: "Burst suppression pattern on electroencephalogram (EEG)",
    D: "Biomarkers, specifically neuron-specific enolase and S100B protein",
  }],
  [74, {
    A: "Refuse the request.",
    B: "Request an ethics consult.",
    C: "Request a palliative care consult.",
    D: "Initiate a family care conference.",
    E: "Request a social work consult.",
  }],
  [76, {
    A: "Milrinone infusion, 0.5 mcg/kg/min",
    B: "Dopamine infusion, 10 mcg/kg/min",
    C: "Normal saline solution, 20 mL/kg",
    D: "Norepinephrine infusion, 0.05 mcg/kg/min",
    E: "IV furosemide, 5 mg",
  }],
  [80, {
    A: "Posterior acoustic enhancement",
    B: "Side lobe",
    C: "Reverberation",
    D: "Shadowing",
  }],
  [81, {
    A: "0.1 mg daily",
    B: "0.05 mg daily",
    C: "0.2 mg daily",
    D: "0.05 mg twice daily",
  }],
  [21, {
    A: "The clinician and family agree that the patient is still distressed",
    B: "The patient had a severe brain injury and has no cortical brain function",
    C: "The patient's father is urging the clinician to ‘end this’ because the patient is still breathing",
    D: "Excessive secretions are present, causing breathing difficulty",
  }],
  [53, {
    A: "Right side down and insert the needle in the right upper quadrant of the abdomen, directly below the ribs",
    B: "Head of bed elevated to 45 degrees and insert the needle in the midline abdomen, approximately 2 cm below the umbilicus",
    C: "Right side down and insert the needle in the left side of the abdomen, medial to the anterior superior iliac crest",
    D: "Head of bed elevated to 45 degrees and insert the needle in the midline, directly above the pubic symphysis",
  }],
  [59, {
    A: "His parents are legally his decision-makers until he turns 18 and his wishes should not be considered.",
    B: "Only a court can determine whether the patient has the ability to make end-of-life decisions.",
    C: "Adolescents may have decision-making capacity without court determination.",
    D: "He can make his own decisions without considering his parents' wishes.",
  }],
  [88, {
    A: "Have no effect on the estimate of time to DKA correction",
    B: "Result in underestimation of the time to DKA correction",
    C: "Result in overestimation of the time to DKA correction",
    D: "Make it impossible to estimate the time to DKA correction",
  }],
  [92, {
    A: "First-degree heart block",
    B: "Second-degree heart block, type 1",
    C: "Second-degree heart block, type 2",
    D: "Third-degree heart block",
  }],
  [93, {
    A: "Improve within the next 6 months",
    B: "Increase by 30% within the next 6 months",
    C: "Increase by 50% within the next week",
    D: "Increase by 25%",
  }],
  [103, {
    A: "Independent samples and is preferred over the chi-square test for analyzing paired samples, such as daily and cumulative opioid dosing",
    B: "Paired samples and is preferred over the paired t test for analyzing non-normally distributed data, such as daily and cumulative opioid dosing",
    C: "Independent samples and is preferred over the Student t test for analyzing non-normally distributed data, such as cumulative opioid dosing",
    D: "Paired samples and is the preferred method for analyzing ordinal data, such as daily and cumulative opioid dosing",
  }],
  [100, {
    A: "Fats can be mobilized more rapidly as an energy source.",
    B: "Carbohydrates have a higher caloric density per gram than fats.",
    C: "Carbohydrates can produce ATP in the absence of oxygen.",
    D: "Fats have more efficient ATP production to oxygen consumption than carbohydrates.",
  }],
  [102, {
    A: "Cerebral edema",
    B: "Elevated serum sodium",
    C: "Hyponatremia",
    D: "Myocardial stretch",
    E: "Elevated portal venous pressures",
  }],
  [108, {
    A: "Falsification",
    B: "Fabrication",
    C: "Plagiarism",
    D: "Selection bias",
  }],
  [109, {
    A: "Temperature is below an acceptable value.",
    B: "Pupils are not dilated, so there could be peripheral optic nerve injury.",
    C: "Not enough time has passed since the initial injury to test for brain death.",
    D: "Response to noxious stimuli above the level of the spinal cord injury was not included.",
    E: "Blood pressure is below an acceptable value.",
  }],
  [110, {
    A: "a wave",
    B: "x descent",
    C: "c wave",
    D: "v wave",
    E: "y descent",
  }],
  [112, {
    A: "Patent ductus arteriosus stent dislodgement",
    B: "Restrictive atrial septum",
    C: "Tight pulmonary artery bands",
    D: "Retrograde aortic arch obstruction",
    E: "Pericardial effusion",
  }],
  [115, {
    A: "Refractory hypoglycemia",
    B: "Splenomegaly accompanied by fever",
    C: "Brugada syndrome-like changes on ECG",
    D: "Unexplained metabolic alkalosis",
    E: "Hypocalcemia",
  }],
  [117, {
    A: "It decreases the Reynolds number in turbulent flow airways.",
    B: "It is denser than nitrogen and more effective at delivering bronchodilator medications.",
    C: "It has direct bronchodilatory effects.",
    D: "It has lower viscosity than air and hence results in laminar flow.",
    E: "It has pulmonary vasodilatory properties.",
  }],
  [119, {
    A: "Elevated serum transaminases",
    B: "Elevated amylase",
    C: "Elevated lactate",
    D: "Hyperkalemia",
    E: "Hypernatremia",
  }],
  [121, {
    A: "Ventilator-associated pneumonia",
    B: "Increased dead space",
    C: "Bronchospasm",
    D: "Endotracheal tube obstruction",
  }],
  [123, {
    A: "Cessation of cardiac activity within 30 minutes after withdrawal of medical support",
    B: "Likely progression to brain death during the next 48 hours",
    C: "Injuries that are not the result of suspected nonaccidental traumatic injury",
    D: "Decision to withdraw medical support occurring independently and before any discussion of organ donation",
    E: "No evidence for a cervical spinal cord injury that would explain the neurologic findings",
  }],
  [132, {
    A: "IgG level",
    B: "HLA-DR levels measured by flow cytometry",
    C: "C-reactive protein",
    D: "Bone marrow aspiration",
    E: "Quantitative assay of proteins C and S",
  }],
  [135, {
    A: "Myoglobin has a direct toxic effect on renal tubular cells.",
    B: "Myoglobin deposition in the glomerulus leads to obstruction.",
    C: "Creatine kinase has a direct toxic effect on glomerular epithelial cells.",
    D: "Hypocalcemia, hyperkalemia, and lactic acidosis cause myocardial depression and decreased renal perfusion.",
  }],
  [139, {
    A: "Hemofiltration is the transfer of solute across a semipermeable membrane by pressure-induced water flow (diffusion), and it is preferred for higher-molecular-weight solutes and for removal of water.",
    B: "Hemodialysis is the transfer of solute across a semipermeable membrane along concentration gradients using countercurrent flow for optimal efficiency (convection), and it is ideal for higher-molecular-weight solutes such as creatinine, urea, electrolytes, and acid-base buffers.",
    C: "Continuous venovenous hemodiafiltration combines aspects of both hemofiltration and hemodialysis to optimize clearance of small- and middle-weight solutes.",
    D: "The appropriate temporary dialysis catheter size for this patient is 7 French.",
  }],
  [141, {
    A: "Apply a tourniquet to the hand, irrigate the wound, and apply topical antibiotics.",
    B: "Provide symptomatic management, including adequate analgesia, and administer a tetanus immunization.",
    C: "Admit to the hospital and administer crotalidae polyvalent immune fab.",
    D: "Order blood type and screen and start a platelet transfusion.",
  }],
  [143, {
    A: "Selective demyelination",
    B: "Elaboration of neuronal axons, dendrites, and connections",
    C: "Surge of insulin-like growth factor stimulating cellular growth",
    D: "Increased cerebral blood flow after transition from fetal circulation",
  }],
  [144, {
    A: "Continue to escalate his current sedative infusions until the desired sedation level is reached.",
    B: "Begin a neuromuscular blockade infusion to prevent accidental extubation.",
    C: "Perform a delirium assessment and initiate an antidelirium regimen.",
    D: "Add another sedative to the current sedation regimen.",
  }],
  [145, {
    A: "Metabolic acidosis",
    B: "Low PaO2",
    C: "Low pulse oximetry",
    D: "High oxyhemoglobin level",
  }],
  [149, {
    A: "TLR2 plays an active role in the recognition of lipoteichoic acid on gram-positive bacteria",
    B: "TLR4 plays an active role in the recognition of flagellin-containing bacteria",
    C: "After engagement of TLRs with pathogenic molecules, signal transduction is inhibited by nuclear factor kB",
    D: "Mitogen-activated protein kinases have separate signal induction pathways from TLRs",
  }],
  [152, {
    A: "Decreased bronchial mucus production, bronchoconstriction, and vasoconstriction of the pulmonary arterioles",
    B: "Increased bronchial mucus production, bronchoconstriction, and vasodilation of the pulmonary arterioles",
    C: "Increased bronchial mucus production, bronchodilation, and vasodilation of the pulmonary arterioles",
    D: "Decreased bronchial mucus production, bronchodilation, and vasodilation of the pulmonary arterioles",
  }],
  [154, {
    A: "Alveolar CO2 when a continuous waveform is present and the patient is on supplemental oxygen",
    B: "Exhaled CO2 when a continuous waveform is present and the patient is on supplemental oxygen",
    C: "Alveolar CO2 when a continuous waveform is present and the patient is not on supplemental oxygen",
    D: "Exhaled CO2 when a continuous waveform is present and the patient is not on supplemental oxygen",
  }],
  [158, {
    A: "Decreased levels of proteins C and S",
    B: "Increased release of pyrogenic cytokines from macrophages",
    C: "Increased transcription of heat shock proteins",
    D: "Attenuated cardiovascular response to heat injury compared with adults",
  }],
  [160, {
    A: "Less severe after higher-energy doses of defibrillation",
    B: "Typically resolving after 4-6 hours",
    C: "Global biventricular systolic and diastolic dysfunction",
    D: "Pathophysiologically dissimilar to post-cardiopulmonary bypass myocardial dysfunction",
    E: "Sudden increase in left ventricular compliance",
  }],
  [161, {
    A: "Proximal convoluted tubule",
    B: "Descending loop of Henle",
    C: "Ascending loop of Henle",
    D: "Distal convoluted tubule",
    E: "Collecting tubule",
  }],
  [167, {
    A: "Decreased glomerular filtration rate due to inadequate resuscitation of hemorrhagic shock",
    B: "Increased urea production from the digestion and metabolism of blood products",
    C: "Production of reactive oxygen species by renal tubular cell endocytosis of myoglobin",
    D: "Vasodilation of the splanchnic circulation in response to portal venous hypertension",
  }],
  [169, {
    A: "Lower event survival",
    B: "Coronary vasospasm",
    C: "A higher rate of recurrent malignant rhythms",
    D: "Conversion to pulseless electrical activity",
  }],
  [170, {
    A: "Neurodevelopmental delay",
    B: "Younger age",
    C: "Family involvement",
    D: "Benzodiazepine use",
  }],
  [177, {
    A: "Is a product of the adaptive immune system",
    B: "Is stimulated by interleukin 8 (IL-8) and IL-10",
    C: "Promotes local vasoconstriction",
    D: "Produces peroxynitrite",
    E: "Impairs neutrophil cytotoxic mechanisms",
  }],
  [175, {
    A: "Increased inferior vena cava (IVC) diameter with IVC noncompressibility on ultrasound",
    B: "Central venous pressure (CVP) of 9 cm H2O",
    C: "Low end-diastolic volume on echocardiography",
    D: "Stroke volume variation of 18% with respiration",
    E: "Increase in CVP to 12 cm H2O after infusion of a 10-mL/kg fluid bolus",
  }],
  [181, {
    A: "Handwashing protocols",
    B: "Surgical masks",
    C: "Negative air-flow rooms",
    D: "Gloves",
  }],
  [180, {
    A: "Initiate an isotonic fluid bolus of 20 mL/kg",
    B: "Increase furosemide to 1 mg/kg every 6 hours",
    C: "Renally dose all current medications",
    D: "Consult nephrology for urgent dialysis",
  }],
  [183, {
    A: "Brain MRI",
    B: "Head ultrasound",
    C: "Brain CT",
    D: "Echocardiography",
    E: "Blood cultures and broad-spectrum antibiotics",
  }],
  [184, {
    A: "Administration of IV midazolam, 0.1 mg/kg",
    B: "Administration of normal saline, 20 mL/kg",
    C: "Increase in partial pressure of carbon dioxide from 40 to 50 mm Hg",
    D: "Administration of packed RBCs, 15 mL/kg",
    E: "Increase in core temperature from 36 to 39 °C (96.8 to 102.2 °F)",
  }],
  [186, {
    A: "2 mm Hg",
    B: "4 mm Hg",
    C: "95 mm Hg",
    D: "44 mm Hg",
    E: "7 mm Hg",
  }],
  [187, {
    A: "Dobutamine, 8 mcg/kg/min",
    B: "Norepinephrine, 0.05 mcg/kg/min",
    C: "Nitroprusside, 0.5 mcg/kg/min",
    D: "Milrinone, 0.5 mcg/kg/min",
  }],
  [194, {
    A: "Basophils",
    B: "Natural killer cells",
    C: "Osteoclasts",
    D: "Plasma cells",
    E: "Granulocytes",
  }],
  [197, {
    A: "It can be performed only by trained clinicians.",
    B: "Its interrater reliability is high.",
    C: "It screens for a rare condition in pediatric ICU patients.",
    D: "Its validity varies based on the type of delirium.",
  }],
  [199, {
    A: "4-year-old boy with no past medical history, acute respiratory failure due to respiratory syncytial virus, rapidly escalating ventilator requirements, and oxygenation index 42",
    B: "12-year-old girl with no past medical history, open-book pelvic fracture sustained in a motor vehicle collision, rapidly decreasing blood pressure, and hemoglobin level 4.5 g/dL",
    C: "8-year-old girl with acute myeloblastic leukemia with central nervous system recurrence after 2 prior allogenic bone marrow transplants, with acute respiratory failure thought to be secondary to infection",
    D: "18-hour-old boy born at 22 weeks' estimated gestational age with trisomy 18, intrauterine growth restriction, and acute respiratory failure secondary to meconium aspiration",
  }],
]);

const scenarioOverrides = new Map([
  [180, "A 3-year-old boy with acute lymphoblastic leukemia was admitted to the pediatric ICU 4 days ago with neutropenic fever and Escherichia coli septic shock. He is mechanically ventilated. Heart rate is 110 beats/min and blood pressure is 80/45 mm Hg. He is warm, with normal capillary refill and normal pulses. He is receiving fentanyl and midazolam infusions, epinephrine at 0.05 mcg/kg/min, furosemide at 1 mg/kg every 12 hours, and ceftriaxone. His urine output for the past 6 hours has been less than 0.5 mL/kg/hr. Laboratory results are shown below. Which of the following is the most appropriate course of action?"],
]);

const clinicalDataOverrides = new Map([
  [28, [{
    title: "Laboratory evaluation",
    columns: ["Test", "Result"],
    rows: [
      ["Hemoglobin", "10 g/dL"],
      ["Total bilirubin", "4.0 mg/dL"],
      ["AST", "3,140 U/L"],
      ["ALT", "2,540 U/L"],
      ["Prothrombin time", "21.2 seconds"],
      ["Serum sodium", "134 mEq/L"],
      ["Serum potassium", "4.9 mEq/L"],
      ["Serum chloride", "105 mEq/L"],
      ["Serum bicarbonate", "13 mEq/L"],
      ["BUN", "65 mg/dL"],
      ["Serum creatinine", "1.4 mg/dL"],
    ],
  }]],
  [63, [{
    title: "Laboratory results",
    columns: ["Test", "Result"],
    rows: [
      ["WBC count", "12,000 cells/mcL"],
      ["Hemoglobin", "13 g/dL"],
      ["Platelets", "245,000 cells/mcL"],
      ["Sodium", "135 mEq/L"],
      ["Potassium", "5.1 mEq/L"],
      ["Glucose", "117 mg/dL"],
      ["Bicarbonate", "20 mEq/L"],
      ["Chloride", "95 mEq/L"],
      ["BUN", "12 mg/dL"],
      ["Creatinine", "0.3 mg/dL"],
      ["Calcium", "8.3 mEq/L"],
      ["Phosphate", "6 mg/dL"],
      ["Magnesium", "2.2 mg/dL"],
      ["Lactate", "1.5 mmol/L"],
    ],
  }]],
  [87, [{
    title: "Laboratory analysis",
    columns: ["Test", "Result"],
    rows: [
      ["Prothrombin time", "50 seconds"],
      ["INR", "2"],
      ["Antithrombin III level", "30"],
      ["Platelet count", "200,000"],
      ["Liver function tests", "Normal"],
    ],
  }]],
  [107, [{
    title: "Abnormal laboratory studies",
    columns: ["Test", "Result"],
    rows: [
      ["Serum sodium", "129 mmol/L"],
      ["AST", "200 IU/L"],
      ["C-reactive protein", "32 mg/dL"],
    ],
  }]],
  [114, [{
    title: "Laboratory findings",
    columns: ["Test", "Result"],
    rows: [
      ["WBC count", "0.7 x 10^3/mm^3"],
      ["Hemoglobin", "8.5 g/dL"],
      ["Platelet count", "35 x 10^3/mm^3"],
      ["Neutrophils", "20%"],
      ["Lymphocytes", "70%"],
      ["Basophils", "5%"],
      ["Eosinophils", "5%"],
      ["Sodium", "140 mEq/L"],
      ["Potassium", "4.5 mEq/L"],
      ["BUN", "18 mg/dL"],
      ["Creatinine", "1.0 mg/dL"],
      ["Blood lactate", "3.0 mg/dL"],
    ],
  }]],
  [122, [{
    title: "Thyroid panel",
    columns: ["Test", "Result"],
    rows: [
      ["Thyroid-stimulating hormone", "5 mU/L"],
      ["Thyroxine", "105 ng/dL"],
      ["Triiodothyronine", "70 ng/dL"],
    ],
  }]],
  [125, [{
    title: "Morning laboratory tests",
    columns: ["Test", "Result"],
    rows: [
      ["WBC count", "18 x 10^9/L"],
      ["Hemoglobin", "7.2 g/dL"],
      ["Platelets", "300,000/L"],
      ["Sodium", "140 mmol/L"],
      ["Potassium", "5.1 mmol/L"],
      ["Chloride", "107 mmol/L"],
      ["Bicarbonate", "21 mmol/L"],
      ["BUN", "65 mg/dL"],
      ["Creatinine", "3.1 mg/dL"],
      ["AST", "55 U/L"],
      ["ALT", "80 U/L"],
      ["Alkaline phosphatase", "250 U/L"],
      ["Amylase", "300 U/L"],
      ["Lipase", "200 U/L"],
      ["Total bilirubin", "3.3 mg/dL"],
      ["Direct bilirubin", "1.6 mg/dL"],
      ["Glomerular filtration rate", "31 mL/min/1.73 m^2"],
    ],
  }]],
  [141, [{
    title: "Laboratory tests",
    columns: ["Test", "Result"],
    rows: [
      ["Prothrombin time", "20 sec (normal 11-13 sec)"],
      ["Activated partial thromboplastin time", "55 sec (normal 25-36 sec)"],
      ["Platelets", "70 x 10^3/mcL"],
    ],
  }]],
  [180, [{
    title: "Laboratory results",
    columns: ["Test", "Result"],
    rows: [
      ["Serum sodium", "132 mEq/L"],
      ["Urine sodium", "50 mEq/L"],
      ["Serum urea nitrogen", "25 mg/dL"],
      ["Urine urea nitrogen", "1,200 mg/dL"],
      ["Serum creatinine", "2.5 mg/dL"],
      ["Urine creatinine", "130 mg/dL"],
    ],
  }]],
  [187, [{
    title: "Pulmonary artery catheter variables",
    columns: ["Variable", "Value"],
    rows: [
      ["Cardiac index", "6 L/min/m^2"],
      ["Systemic vascular resistance index", "400 dyne-sec/cm^5/m^2"],
      ["Pulmonary vascular resistance index", "180 dyne-sec/cm^5/m^2"],
      ["Central venous pressure", "6 mm Hg"],
      ["Pulmonary artery occlusion pressure", "8 mm Hg"],
      ["Mixed venous oxygen saturation", "50%"],
    ],
  }]],
  [200, [{
    title: "Laboratory values",
    columns: ["Test", "Result"],
    rows: [
      ["WBCs", "28 x 10^9/L"],
      ["Hemoglobin", "9.5 mg/dL"],
      ["Platelets", "33 x 10^9/L"],
      ["Neutrophils", "80%"],
      ["Lymphocytes", "10%"],
      ["Basophils", "2.5%"],
      ["Eosinophils", "1.5%"],
      ["Monocytes", "6%"],
      ["Sodium", "133 mEq/L"],
      ["Potassium", "5.6 mEq/L"],
      ["Chloride", "105 mEq/L"],
      ["Bicarbonate", "7 mEq/L"],
      ["BUN", "40 mEq/L"],
      ["Creatinine", "4.7 mg/dL"],
      ["Glucose", "108 mg/dL"],
      ["AST (SGOT)", "780 U/L"],
      ["ALT (SGPT)", "440 U/L"],
      ["Calcium", "8.5 mEq/L"],
      ["Magnesium", "3.4 mEq/L"],
      ["Prothrombin time", "28 sec"],
      ["Partial thromboplastin time", "56 sec"],
      ["INR", "2.2"],
    ],
  }]],
]);

const clinicalDataStartMarkers = new Map([
  [28, "Laboratory evaluation reveals the following:"],
  [63, "Laboratory results are:"],
  [87, "His laboratory analysis reveals:"],
  [107, "Abnormal laboratory studies include:"],
  [114, "Laboratory findings include:"],
  [122, "This morning, a thyroid panel shows:"],
  [125, "Morning laboratory tests show:"],
  [141, "Laboratory tests are significant for"],
  [187, "initial hemodynamic variables from the PA catheter are:"],
  [200, "Laboratory values are:"],
]);

const clinicalPromptMarkers = new Map([
  [107, "As fluid resuscitation is initiated"],
  [122, "These results indicate"],
]);

const explanationDataOverrides = new Map([
  [122, [{
    title: "Euthyroid sick syndrome laboratory data",
    columns: ["Variable", "Value"],
    rows: [
      ["Free T4", "Normal"],
      ["T4-to-T3 conversion", "Decreased"],
      ["T3", "Markedly decreased"],
      ["Reverse T3", "Variable"],
      ["TSH", "Normal"],
    ],
  }]],
]);

const explanationVisuals = new Map([
  [44, { page: 51, crop: { left: 332, top: 260, width: 958, height: 700 }, textCutoff: 250, label: "Glasgow Coma Scale" }],
  [176, { page: 202, crop: { left: 145, top: 500, width: 1010, height: 330 }, textCutoff: 490, label: "Splenic injury grading and management" }],
  [187, { page: 215, crop: { left: 335, top: 530, width: 850, height: 315 }, textCutoff: 500, label: "Adult and pediatric hemodynamic values" }],
  [200, { page: 229, crop: { left: 230, top: 315, width: 900, height: 585 }, textCutoff: 300, label: "Sequential Organ Failure Assessment score" }],
]);

const questionVisualOverrides = new Map([
  [39, { page: 43, crop: { left: 260, top: 326, width: 925, height: 200 } }],
  [43, { page: 49, crop: { left: 235, top: 194, width: 1092, height: 315 } }],
  [110, { page: 129, crop: { left: 620, top: 340, width: 280, height: 630 } }],
  [165, { page: 188, crop: { left: 65, top: 500, width: 1385, height: 312 } }],
]);

const explanationPageCutoffs = new Map(
  [...explanationVisuals.values()].map(({ page, textCutoff }) => [page, textCutoff]),
);

const cleanText = (value) => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
  .replace(/[ \t]+/g, " ")
  .replace(/\s+([,.;:?!])/g, "$1")
  .replace(/([,.;:?!])(?=[A-Za-z])/g, "$1 ")
  .replace(/\bA(\d+-year-old)\b/g, "A $1")
  .replace(/\bAl(?=\d)/g, "A 1")
  .replace(/\bAS5(?=-year-old)/g, "A 5")
  .replace(/\bAS(?=-year-old)/g, "A 5")
  .replace(/\bAT0(?=-kg)/g, "A 70")
  .replace(/\bAT(?=-month-old)/g, "A 7")
  .replace(/\bAd(?=-(?:kg|month-old))/g, "A 4")
  .replace(/\bA23\.(?= month-old)/g, "A 23-")
  .replace(/\bA(?=(?:\d+(?:-|\.)|child\b|clinician\b|patient\b|previously\b|research\b|study\b|trainee\b))/gi, "A ")
  .replace(/\bA l(?=-year-old)/g, "A 1")
  .replace(/\bH20\b/g, "H2O")
  .replace(/\bH[;,]0\b/g, "H2O")
  .replace(/\bFI0([2₂])\b/g, "FIO2")
  .replace(/\bFI0[,;]/g, "FIO2")
  .replace(/\bFIO[,;]/g, "FIO2")
  .replace(/\bFIO(?=\s+(?:\d+(?:\.\d+)?|\d+%))/g, "FIO2")
  .replace(/\bPa0([2₂])\b/g, "PaO2")
  .replace(/\bPa0[,;]/g, "PaO2")
  .replace(/\bPaO[,;]/g, "PaO2")
  .replace(/\bPC0([2₂])\b/g, "PCO2")
  .replace(/\bPaC0?[,;]/g, "PaCO2")
  .replace(/\bPaCO[,;]/g, "PaCO2")
  .replace(/\bPACO[,;]/g, "PACO2")
  .replace(/\bPeCO[,;]/g, "PeCO2")
  .replace(/\bPCO[,;]/g, "PCO2")
  .replace(/\bHCO[,;]/g, "HCO3")
  .replace(/\bSa0([2₂])\b/g, "SaO2")
  .replace(/\bSp0([2₂])\b/g, "SpO2")
  .replace(/\bCO[,;]/g, "CO2")
  .replace(/\bC0([2₂])\b/g, "CO2")
  .replace(/\bEXCO2\b/g, "ETCO2")
  .replace(/\bmEg\b/g, "mEq")
  .replace(/\btype \|/gi, (match) => match.startsWith("Type") ? "Type I" : "type I")
  .replace(/\btype Il\b/g, "type II")
  .replace(/\bChiari \|/g, "Chiari I")
  .replace(/\bstage \|/g, "stage I")
  .replace(/\|b\./g, "lb.")
  .replace(/cm®\/m\?/g, "cm^5/m^2")
  .replace(/\bmm He\b/g, "mm Hg")
  .replace(/\bpatient s\b/g, "patient is")
  .replace(/\b12 g\/kg fentanyl\b/g, "12 mcg/kg fentanyl")
  .replace(/\b(?:ug|yig)\s*\/kg/g, "mcg/kg")
  .replace(/\bpg(?=\/kg)/g, "mcg")
  .replace(/\big(?=\/kg)/g, "mcg")
  .replace(/\bmiL\b/g, "mL")
  .replace(/\b(\d+)mL\b/g, "$1 mL")
  .replace(/\bml\b/g, "mL")
  .replace(/\bWhatis\b/g, "What is")
  .replace(/\bWhat i the\b/g, "What is the")
  .replace(/\bitis\b/gi, (match) => match[0] === "I" ? "It is" : "it is")
  .replace(/\bandor\b/g, "and/or")
  .replace(/\bto to\b/g, "to")
  .replace(/\bFEUrealis\b/g, "FEUrea is")
  .replace(/, s that it will\b/g, ", is that it will")
  .replace(/\bcritically infants\b/g, "critically ill infants")
  .replace(/\bProcalitonin\b/g, "Procalcitonin")
  .replace(/\bChangethe\b/g, "Change the")
  .replace(/\bDiuretictherapy\b/g, "Diuretic therapy")
  .replace(/\bCVPto\b/g, "CVP to")
  .replace(/\bIniate\b/g, "Initiate")
  .replace(/\b(\d+)mm Hg\b/g, "$1 mm Hg")
  .replace(/\b(\d+)-1b\b/g, "$1-lb")
  .replace(/\b(\d+)-b\./g, "$1-lb")
  .replace(/\b(\d+)-Ib\.?/g, "$1-lb")
  .replace(/\b(\d+) Ib\b/g, "$1 lb")
  .replace(/\bkg\/keg\/hr\b/g, "kg/hr")
  .replace(/\bmL\/keg\/hr\b/g, "mL/kg/hr")
  .replace(/\bCPRand\b/g, "CPR and")
  .replace(/\b3to\b/g, "3 to")
  .replace(/\bnonpurposefuly\b/g, "nonpurposefully")
  .replace(/\btreating hs agitation\b/g, "treating his agitation")
  .replace(/\bwas sustained inhalation injuries\b/g, "sustained inhalation injuries")
  .replace(/\bWhich is of the following\b/g, "Which of the following")
  .replace(/\bDopamine ii infused\b/g, "Dopamine is infused")
  .replace(/,\s+(His|He)\b/g, ". $1")
  .replace(/\bVO[,;]/g, "VO2")
  .replace(/\bDO(?=\s+relationship)/g, "DO2")
  .replace(/\bDO(?=\))/g, "DO2")
  .replace(/L\/min\/m\?/g, "L/min/m^2")
  .replace(/\/mm\?/g, "/mm^3")
  .replace(/\bmZ\b/g, "m^2")
  .replace(/\b1\.73m2\b/g, "1.73 m^2")
  .replace(/\b18 x 10%(?!\w)/g, "18 x 10^9/L")
  .replace(/\b4000 x 10°\/L\b/g, "4,000 x 10^9/L")
  .replace(/\b80,000 x 10\/L\b/g, "80,000 x 10^9/L")
  .replace(/\b0\.7 x 103\/mm\^3\b/g, "0.7 x 10^3/mm^3")
  .replace(/\b35 x 10%\/mm\^3\b/g, "35 x 10^3/mm^3")
  .replace(/\bWBCs 28 x 10\/L\b/g, "WBCs 28 x 10^9/L")
  .replace(/\bplatelets 33 x 10%\/L\b/g, "platelets 33 x 10^9/L")
  .replace(/\bSpO;/g, "SpO2")
  .replace(/\bN- acetyleysteine\b/g, "N-acetylcysteine")
  .replace(/\be\. g\./g, "e.g.")
  .replace(/\bsystems inconsistent\b/g, "symptoms inconsistent")
  .replace(/\bdue to ts variable\b/g, "due to its variable")
  .replace(/\bdouble o triple\b/g, "double or triple")
  .replace(/\b1in\b/g, "1 in")
  .replace(/\b50mg\b/g, "50 mg")
  .replace(/\btype Ill\b/g, "type III")
  .replace(/\bgrade Ill\b/g, "grade III")
  .replace(/\bCVWWHDF\b/g, "CVVHDF")
  .replace(/\bCVWHDF\b/g, "CVVHDF")
  .replace(/\bgirlis\b/g, "girl is")
  .replace(/\bfollowing ii correct\b/g, "following is correct")
  .replace(/\btransphenoidal\b/g, "transsphenoidal")
  .replace(/\bcamitine\b/g, "carnitine")
  .replace(/\bant-inflammatory\b/g, "anti-inflammatory")
  .replace(/\bymphohistiocytosis\b/g, "lymphohistiocytosis")
  .replace(/\bestravasation\b/g, "extravasation")
  .replace(/\bcritically (?:ll|il)\b/g, "critically ill")
  .replace(/\b1CU\b/g, "ICU")
  .replace(/\bAK!\b/g, "AKI")
  .replace(/AK!/g, "AKI")
  .replace(/\bseverity AK\./g, "severity AKI.")
  .replace(/\b509 within\b/g, "50% within")
  .replace(/\bFEN less than 19\b/g, "FENa less than 1%")
  .replace(/\bFENa less than 19%\b/g, "FENa less than 1%")
  .replace(/\bFEN,\b/g, "FENa")
  .replace(/\bFEN\b/g, "FENa")
  .replace(/\bS100b\b/g, "S100B")
  .replace(/\$100b\b/g, "S100B")
  .replace(/\bug\/L\b/g, "mcg/L")
  .replace(/\blactic dehydrogenase\b/g, "lactate dehydrogenase")
  .replace(/\bphosphorous\b/g, "phosphorus")
  .replace(/\bN- acetyl/g, "N-acetyl")
  .replace(/\bbeta- adrenergic\b/g, "beta-adrenergic")
  .replace(/\ba-adrenergic\b/g, "alpha-adrenergic")
  .replace(/\bA 23- month-old\b/g, "A 23-month-old")
  .replace(/\b1\.5- cm\b/g, "1.5-cm")
  .replace(/\bseveral- hour\b/g, "several-hour")
  .replace(/\bheart rate125\b/g, "heart rate 125")
  .replace(/\bStaphyloccocus\b/g, "Staphylococcus")
  .replace(/\bVitals signs\b/g, "Vital signs")
  .replace(/\bleaking\. grade\b/g, "leaking grade")
  .replace(/\bmonitoring, The\b/g, "monitoring. The")
  .replace(/\badministrating\b/g, "administering")
  .replace(/\b10-month old\b/g, "10-month-old")
  .replace(/connected to ~20 cm H2O/g, "connected to -20 cm H2O")
  .replace(/\bALT:\s*/g, "ALT ")
  .replace(/\bAST (\d+) U\/dL\b/g, "AST $1 U/L")
  .replace(/\bALT (\d+) U\/dL\b/g, "ALT $1 U/L")
  .replace(/\bserum (sodium|potassium|chloride|bicarbonate),? (\d+(?:\.\d+)?) mEq\/dL\b/g, "serum $1 $2 mEq/L")
  .replace(/\bGlomerular filtration rate is (\d+ mL\/min\/1\.73 m\^2) Which\b/g, "Glomerular filtration rate is $1. Which")
  .replace(/\bLaboratory values are:/g, "Laboratory values are:")
  .replace(/\bPAO,\b/g, "PAO2")
  .replace(/\bPAO,/g, "PAO2")
  .replace(/\bPry\b/g, "PB")
  .replace(/\bPB;/g, "PB")
  .replace(/\bPyiz0\b/g, "PH2O")
  .replace(/\bPo of 47 mm Hg\b/g, "PH2O of 47 mm Hg")
  .replace(/«\s*/g, "")
  .replace(/\bWhich of the following Is\b/g, "Which of the following is")
  .replace(/\bright to-left\b/g, "right-to-left")
  .replace(/\bthe the\b/g, "the")
  .replace(/\bAnumber\b/g, "A number")
  .replace(/\bV fluids\b/g, "IV fluids")
  .replace(/\bsot is\b/g, "so it is")
  .replace(/\bfor issue deeper\b/g, "for tissue deeper")
  .replace(/\bMyelinate begins\b/g, "Myelination begins")
  .replace(/\blater lfe\b/g, "later life")
  .replace(/\bantiinflammatory\b/g, "anti-inflammatory")
  .replace(/\b12- hour\b/g, "12-hour")
  .replace(/\binterexamination\b/g, "inter-examination")
  .replace(/\bMetabolicalkalosis\b/g, "Metabolic alkalosis")
  .replace(/\bhandwashing\. protocols\b/g, "handwashing protocols")
  .replace(/\bA 14-year-old-boy\b/g, "A 14-year-old boy")
  .replace(/\s+/g, " ")
  .trim();

const cleanChoiceText = (value, key) => cleanText(value)
  .replace(new RegExp(`^${key}[.)]\\s+`, "i"), "")
  .replace(new RegExp(`^${key}c[.)]\\s+`, "i"), "")
  .replace(new RegExp(`^${key}\\s+(?=[A-Z])`), "")
  .replace(/^\[3\s+/, "")
  .trim();

const parseTsvLines = (page) => {
  const groups = new Map();
  const rows = page.tsv.trim().split("\n").slice(1);

  for (const row of rows) {
    const fields = row.split("\t");
    if (Number(fields[0]) !== 5 || !fields[11]) continue;
    const key = fields.slice(1, 5).join(":");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      x: Number(fields[6]),
      y: Number(fields[7]),
      width: Number(fields[8]),
      height: Number(fields[9]),
      confidence: Number(fields[10]),
      text: fields.slice(11).join("\t"),
    });
  }

  return [...groups.values()].map((words) => ({
    x: Math.min(...words.map((word) => word.x)),
    y: Math.min(...words.map((word) => word.y)),
    right: Math.max(...words.map((word) => word.x + word.width)),
    bottom: Math.max(...words.map((word) => word.y + word.height)),
    confidence: words.reduce((sum, word) => sum + word.confidence, 0) / words.length,
    text: cleanText(words.map((word) => word.text).join(" ")),
    words,
  })).filter((line) => line.text).sort((a, b) => a.y - b.y || a.x - b.x);
};

const groupConsecutiveRows = (rows) => {
  const segments = [];
  for (const row of rows) {
    const previous = segments.at(-1);
    if (previous && row <= previous[1] + 1) previous[1] = row;
    else segments.push([row, row]);
  }
  return segments;
};

const colorRows = (segments) => {
  const rows = [];
  for (let index = 0; index < segments.length; index += 1) {
    let [start, end] = segments[index];
    while (index + 1 < segments.length && segments[index + 1][0] - end <= 25) {
      end = segments[index += 1][1];
    }
    if (
      end - start < 35
      && index + 1 < segments.length
      && segments[index + 1][1] - start <= 135
      && segments[index + 1][0] - end >= 30
    ) {
      end = segments[index += 1][1];
    }
    if (end - start >= 35 && end - start <= 140) rows.push([start, end]);
  }
  return rows;
};

const longestRun = (data, info, y, predicate) => {
  let longest = 0;
  let current = 0;
  for (let x = 0; x < info.width; x += 1) {
    const offset = (y * info.width + x) * info.channels;
    if (predicate(data[offset], data[offset + 1], data[offset + 2])) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
};

const analyzePage = async (pageNumber) => {
  const pagePath = path.join(PAGE_DIRECTORY, `page-${String(pageNumber).padStart(3, "0")}.jpg`);
  const { data, info } = await sharp(pagePath).raw().toBuffer({ resolveWithObject: true });
  const qualifyingRows = { neutral: [], green: [], red: [] };

  const predicates = {
    neutral: (red, green, blue) => {
      const value = (red + green + blue) / 3;
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
      return value > 175 && value < 250 && chroma < 18;
    },
    green: (red, green, blue) => green > red + 7 && green > blue + 4 && green > 120,
    red: (red, green, blue) => red > green + 7 && red > blue + 4 && red > 120,
  };

  for (let y = 0; y < info.height; y += 1) {
    for (const [kind, predicate] of Object.entries(predicates)) {
      if (longestRun(data, info, y, predicate) > info.width * 0.72) qualifyingRows[kind].push(y);
    }
  }

  const greenRows = colorRows(groupConsecutiveRows(qualifyingRows.green));
  const redRows = colorRows(groupConsecutiveRows(qualifyingRows.red));
  const coloredRows = [
    ...greenRows.map((range) => ({ range, kind: "green" })),
    ...redRows.map((range) => ({ range, kind: "red" })),
  ];

  let boundaries = groupConsecutiveRows(qualifyingRows.neutral)
    .map(([start, end]) => Math.round((start + end) / 2))
    .filter((y) => y > info.height * 0.12 && y < info.height * 0.94);

  for (const { range } of coloredRows) {
    boundaries = boundaries.filter((y) => y < range[0] - 5 || y > range[1] + 5);
    boundaries.push(...range);
  }
  boundaries = [...new Set(boundaries)].sort((a, b) => a - b);

  const rowCandidates = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const top = boundaries[index];
    const bottom = boundaries[index + 1];
    const height = bottom - top;
    if (height < 38 || height > 140) continue;
    rowCandidates.push({
      top,
      bottom,
      isCorrect: greenRows.some(([greenTop, greenBottom]) => (
        Math.abs(greenTop - top) < 7 && Math.abs(greenBottom - bottom) < 7
      )),
    });
  }

  const rowSequences = [];
  for (let index = 0; index < rowCandidates.length; index += 1) {
    const sequence = [rowCandidates[index]];
    for (let next = index + 1; next < rowCandidates.length && sequence.length < 5; next += 1) {
      const gap = rowCandidates[next].top - sequence.at(-1).bottom;
      if (gap >= 8 && gap <= 38) sequence.push(rowCandidates[next]);
      else if (gap > 38) break;
    }
    rowSequences.push(sequence);
  }

  return {
    height: info.height,
    width: info.width,
    rowSequences,
  };
};

const isHeaderOrChrome = (line) => (
  /Pediatric Multidisciplinary Critical Care Knowledge Assessment Program 2023/i.test(line.text)
  || /Question\s+\d+\s+(?:of|ot|01)\s+(?:200|ZUU)/i.test(line.text)
  || /^(?:Commentary\s+)?References$/i.test(line.text)
  || /^(?:Commentary|References)$/i.test(line.text)
  || (line.text.length < 12 && line.x > 1000)
);

const extractScenario = (page, analysis, optionRows) => {
  const header = page.lines.find((line) => /Question\s+\d+/i.test(line.text));
  const minimumY = header ? header.bottom + 35 : 25;
  const maximumY = optionRows?.[0]?.top ?? analysis.height * 0.92;
  const candidates = page.lines.filter((line) => (
    line.y >= minimumY
    && line.bottom < maximumY - 5
    && line.x < analysis.width * 0.1
    && line.text.length >= 3
    && !isHeaderOrChrome(line)
    && !/disabled\. You will receive full credit/i.test(line.text)
  ));

  if (!candidates.length) return { text: "", top: minimumY, bottom: minimumY };
  const paragraph = [candidates[0]];
  for (let index = 1; index < candidates.length; index += 1) {
    const previous = paragraph.at(-1);
    if (candidates[index].y - previous.bottom > 36) break;
    paragraph.push(candidates[index]);
  }

  return {
    text: cleanText(paragraph.map((line) => line.text).join(" ")),
    top: paragraph[0].y,
    bottom: Math.max(...paragraph.map((line) => line.bottom)),
  };
};

const extractChoiceText = (page, analysis, row) => {
  const words = page.lines.flatMap((line) => line.words)
    .filter((word) => {
      const centerY = word.y + word.height / 2;
      return centerY > row.top && centerY < row.bottom && word.x > analysis.width * 0.13;
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);

  const lineGroups = [];
  for (const word of words) {
    const group = lineGroups.find((candidate) => Math.abs(candidate.y - word.y) < 8);
    if (group) {
      group.words.push(word);
      group.y = Math.min(group.y, word.y);
    } else {
      lineGroups.push({ y: word.y, words: [word] });
    }
  }

  return cleanText(lineGroups.sort((a, b) => a.y - b.y).map((group) => (
    group.words.sort((a, b) => a.x - b.x).map((word) => word.text).join(" ")
  )).join(" "));
};

const extractExplanation = (pages) => {
  let commentaryStarted = false;
  const explanationLines = [];

  for (const page of pages) {
    const marker = page.lines.find((line) => /\bCommentary\b/i.test(line.text));
    if (marker) commentaryStarted = true;
    if (!commentaryStarted) continue;
    const minimumY = marker ? marker.bottom + 8 : 20;

    for (const line of page.lines) {
      if (line.y < minimumY || isHeaderOrChrome(line)) continue;
      if (explanationPageCutoffs.has(page.number) && line.y >= explanationPageCutoffs.get(page.number)) continue;
      if (/^(?:Commentary\s+)?References$/i.test(line.text)) continue;
      if (line.text.replace(/[^A-Za-z]/g, "").length < 3) continue;
      if (line.y > 0.93 * page.analysis.height) continue;
      explanationLines.push(line);
    }
  }

  const explanation = cleanText(explanationLines.map((line) => line.text).join(" "));
  if (!explanation || /^Requires rationale\.?$/i.test(explanation)) return null;
  return explanation;
};

const trimIncompleteExplanation = (questionNumber, explanation) => {
  if (!explanation || questionNumber === 187 || /[.!?)\]]$/.test(explanation)) return explanation;
  const lastCompleteSentence = Math.max(
    explanation.lastIndexOf(". "),
    explanation.lastIndexOf("? "),
    explanation.lastIndexOf("! "),
  );
  return lastCompleteSentence >= 0 ? explanation.slice(0, lastCompleteSentence + 1) : null;
};

const compactClinicalScenario = (questionNumber, scenario) => {
  const marker = clinicalDataStartMarkers.get(questionNumber);
  if (!marker) return null;
  const dataStart = scenario.indexOf(marker);
  const promptMarker = clinicalPromptMarkers.get(questionNumber);
  const promptStart = promptMarker
    ? scenario.lastIndexOf(promptMarker)
    : Math.max(
      scenario.lastIndexOf("Which of the following"),
      scenario.lastIndexOf("which of the following"),
      scenario.lastIndexOf("What is the"),
      scenario.lastIndexOf("What are the"),
    );
  if (dataStart < 0 || promptStart <= dataStart) return null;
  const stem = scenario.slice(0, dataStart).trim().replace(/,\s+and$/i, ".");
  return `${stem} Laboratory data are summarized below. ${scenario.slice(promptStart).trim()}`;
};

const exportExplanationVisual = async (questionNumber) => {
  const config = explanationVisuals.get(questionNumber);
  if (!config) return null;
  const pagePath = path.join(PAGE_DIRECTORY, `page-${String(config.page).padStart(3, "0")}.jpg`);
  const fileName = `q${String(questionNumber).padStart(3, "0")}-explanation.jpg`;
  await sharp(pagePath)
    .extract(config.crop)
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toFile(path.join(ASSET_DIRECTORY, fileName));
  return {
    src: `/PICUMCQBANK/images/mcckap-2023/${fileName}`,
    label: config.label,
    caption: `${config.label} provided in the MCCKAP 2023 commentary for question ${questionNumber}.`,
  };
};

const hasMeaningfulPixels = async (input, crop) => {
  const { data, info } = await sharp(input).extract(crop).resize({ width: 300 }).raw().toBuffer({ resolveWithObject: true });
  let nonWhite = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (data[offset] < 242 || data[offset + 1] < 242 || data[offset + 2] < 242) nonWhite += 1;
  }
  return nonWhite / (info.width * info.height) > 0.025;
};

const dominantContentBounds = async (input) => {
  const metadata = await sharp(input).metadata();
  const scale = Math.min(1, 640 / metadata.width);
  const { data, info } = await sharp(input)
    .resize({ width: Math.max(1, Math.round(metadata.width * scale)) })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const colorCounts = new Map();
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const key = [data[offset], data[offset + 1], data[offset + 2]]
      .map((channel) => Math.min(248, Math.round(channel / 8) * 8))
      .join(",");
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
  }
  const background = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0][0]
    .split(",")
    .map(Number);
  const foreground = new Uint8Array(info.width * info.height);

  for (let pixel = 0; pixel < foreground.length; pixel += 1) {
    const offset = pixel * info.channels;
    const difference = Math.max(
      Math.abs(data[offset] - background[0]),
      Math.abs(data[offset + 1] - background[1]),
      Math.abs(data[offset + 2] - background[2]),
    );
    if (difference > 16) foreground[pixel] = 1;
  }

  const queue = new Int32Array(foreground.length);
  const components = [];
  for (let start = 0; start < foreground.length; start += 1) {
    if (!foreground[start]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    foreground[start] = 0;
    let area = 0;
    let minX = info.width;
    let minY = info.height;
    let maxX = 0;
    let maxY = 0;

    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      area += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [
        x > 0 ? pixel - 1 : -1,
        x + 1 < info.width ? pixel + 1 : -1,
        y > 0 ? pixel - info.width : -1,
        y + 1 < info.height ? pixel + info.width : -1,
      ];
      for (const neighbor of neighbors) {
        if (neighbor >= 0 && foreground[neighbor]) {
          foreground[neighbor] = 0;
          queue[tail++] = neighbor;
        }
      }
    }

    const boxArea = (maxX - minX + 1) * (maxY - minY + 1);
    const density = area / boxArea;
    const spansFrame = (
      (minX <= 2 && maxX >= info.width - 3)
      || (minY <= 2 && maxY >= info.height - 3)
    );
    if (area > foreground.length * 0.004 && density > 0.08 && !(spansFrame && density < 0.25)) {
      components.push({ minX, minY, maxX, maxY });
    }
  }

  if (!components.length) return null;
  const padding = 8;
  const left = Math.max(0, Math.min(...components.map((component) => component.minX)) - padding);
  const top = Math.max(0, Math.min(...components.map((component) => component.minY)) - padding);
  const right = Math.min(info.width, Math.max(...components.map((component) => component.maxX)) + padding + 1);
  const bottom = Math.min(info.height, Math.max(...components.map((component) => component.maxY)) + padding + 1);
  const scaledLeft = Math.floor(left / scale);
  const scaledTop = Math.floor(top / scale);
  return {
    left: scaledLeft,
    top: scaledTop,
    width: Math.min(metadata.width - scaledLeft, Math.ceil((right - left) / scale)),
    height: Math.min(metadata.height - scaledTop, Math.ceil((bottom - top) / scale)),
  };
};

const foregroundContentBounds = async (input) => {
  const metadata = await sharp(input).metadata();
  const scale = Math.min(1, 700 / metadata.width);
  const { data, info } = await sharp(input)
    .resize({ width: Math.max(1, Math.round(metadata.width * scale)) })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const colorCounts = new Map();
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const key = [data[offset], data[offset + 1], data[offset + 2]]
      .map((channel) => Math.min(248, Math.round(channel / 8) * 8))
      .join(",");
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
  }
  const background = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0][0]
    .split(",")
    .map(Number);

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;
  for (let y = 5; y < info.height - 5; y += 1) {
    for (let x = 5; x < info.width - 5; x += 1) {
      if (x > info.width * 0.86 && y > info.height * 0.64) continue;
      const offset = (y * info.width + x) * info.channels;
      const difference = Math.max(
        Math.abs(data[offset] - background[0]),
        Math.abs(data[offset + 1] - background[1]),
        Math.abs(data[offset + 2] - background[2]),
      );
      if (difference <= 18) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }
  if (count < info.width * info.height * 0.001) return null;
  const padding = 7;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(info.width - 1, maxX + padding);
  maxY = Math.min(info.height - 1, maxY + padding);
  const left = Math.floor(minX / scale);
  const top = Math.floor(minY / scale);
  return {
    left,
    top,
    width: Math.min(metadata.width - left, Math.ceil((maxX - minX + 1) / scale)),
    height: Math.min(metadata.height - top, Math.ceil((maxY - minY + 1) / scale)),
  };
};

const exportQuestionVisual = async ({ questionNumber, pageNumber, scenario, optionRows, analysis }) => {
  const override = questionVisualOverrides.get(questionNumber);
  const sourcePage = override?.page ?? pageNumber;
  const pagePath = path.join(PAGE_DIRECTORY, `page-${String(sourcePage).padStart(3, "0")}.jpg`);
  const top = Math.max(0, scenario.bottom + 14);
  const bottom = optionRows?.[0]?.top
    ? optionRows[0].top - 14
    : Math.min(analysis.height - 55, analysis.height * 0.94);
  if (bottom - top < 115) return null;

  const cropTop = Math.max(0, Math.floor(top));
  const cropBottom = Math.min(analysis.height, Math.ceil(bottom));
  const crop = override?.crop ?? {
    left: 24,
    top: cropTop,
    width: analysis.width - 48,
    height: cropBottom - cropTop,
  };
  if (!override && !(await hasMeaningfulPixels(pagePath, crop))) return null;

  const fileName = `q${String(questionNumber).padStart(3, "0")}-question.jpg`;
  try {
    const extracted = await sharp(pagePath).extract(crop).toBuffer();
    const panel = await sharp(extracted)
      .trim({ background: { r: 255, g: 255, b: 255 }, threshold: 8 })
      .toBuffer();
    const contentBounds = await foregroundContentBounds(panel);
    const output = contentBounds ? sharp(panel).extract(contentBounds) : sharp(panel);
    await output
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toFile(path.join(ASSET_DIRECTORY, fileName));
  } catch (error) {
    throw new Error(`Unable to crop question ${questionNumber} page ${pageNumber}: ${JSON.stringify(crop)}`, { cause: error });
  }

  return `/PICUMCQBANK/images/mcckap-2023/${fileName}`;
};

const toTypeScript = (questions) => `// Generated from MCCKAP 2023 by scripts/import-mcckap-2023.mjs.\nimport type { Question } from "@/types/question";\n\nexport const mcckap2023Questions: Question[] = ${JSON.stringify(questions, null, 2)};\n`;

const ocrPages = JSON.parse(await fs.readFile(OCR_FILE, "utf8"));
const pages = ocrPages.map((page, index) => ({
  ...page,
  number: index + 1,
  lines: parseTsvLines(page),
}));

const questionPages = new Map();
let currentQuestion = 0;
for (const page of pages) {
  const pageText = page.lines.map((line) => line.text).join(" ");
  const header = pageText.match(/Question\s+(\d{1,3})\s+(?:of|ot|01)\s+(?:200|ZUU)/i);
  if (header) currentQuestion = Number(header[1]);
  if (pageNumberOverrides.has(page.number)) currentQuestion = pageNumberOverrides.get(page.number);
  if (!questionPages.has(currentQuestion)) questionPages.set(currentQuestion, []);
  questionPages.get(currentQuestion).push(page);
}

await fs.rm(ASSET_DIRECTORY, { recursive: true, force: true });
await fs.mkdir(ASSET_DIRECTORY, { recursive: true });
const pageAnalyses = new Map();
for (const page of pages) {
  const analysis = await analyzePage(page.number);
  page.analysis = analysis;
  pageAnalyses.set(page.number, analysis);
}

const questions = [];
const audit = [];
for (let questionNumber = 1; questionNumber <= 200; questionNumber += 1) {
  const sourcePages = questionPages.get(questionNumber) ?? [];
  const sourceText = sourcePages.map((page) => page.text).join(" ");
  if (/question has been disabled/i.test(sourceText)) {
    audit.push({ questionNumber, status: "disabled", pages: sourcePages.map((page) => page.number) });
    continue;
  }

  let optionPage = null;
  let optionRows = null;
  for (const page of sourcePages) {
    const sequences = page.analysis.rowSequences;
    const candidates = sequences.filter((sequence) => sequence.length >= 3 && sequence.length <= 5);
    const preferred = candidates
      .filter((sequence) => sequence.some((row) => row.isCorrect))
      .sort((a, b) => b.length - a.length)[0]
      ?? candidates.sort((a, b) => b.length - a.length)[0];
    if (preferred && (!optionRows || preferred.length > optionRows.length)) {
      optionPage = page;
      optionRows = preferred;
    }
  }

  const overriddenChoices = choiceOverrides.get(questionNumber);
  if ((!optionPage || !optionRows) && !overriddenChoices) {
    audit.push({ questionNumber, status: "missing-options", pages: sourcePages.map((page) => page.number) });
    continue;
  }

  const firstPage = sourcePages[0];
  const firstPageRows = optionPage?.number === firstPage.number ? optionRows : null;
  const scenario = extractScenario(firstPage, firstPage.analysis, firstPageRows);
  const choices = Object.fromEntries(Object.entries(overriddenChoices ?? Object.fromEntries(optionRows.map((row, index) => [
    String.fromCharCode(65 + index),
    extractChoiceText(optionPage, optionPage.analysis, row),
  ]))).map(([key, value]) => [key, cleanChoiceText(value, key)]));
  const correctAnswer = answerOverrides.get(questionNumber) ?? (
    optionRows ? String.fromCharCode(65 + optionRows.findIndex((row) => row.isCorrect)) : null
  );
  const validCorrectAnswer = correctAnswer && correctAnswer >= "A" && choices[correctAnswer]
    ? correctAnswer
    : null;

  const questionVisual = await exportQuestionVisual({
    questionNumber,
    pageNumber: firstPage.number,
    scenario,
    optionRows: firstPageRows,
    analysis: firstPage.analysis,
  });
  const explanationVisual = await exportExplanationVisual(questionNumber);

  const question = {
    id: 6000 + questionNumber,
    title: `MCCKAP 2023 Question ${questionNumber}`,
    scenario: scenarioOverrides.get(questionNumber) ?? scenario.text,
    choices,
    correctAnswer: validCorrectAnswer,
    correctAnswerText: validCorrectAnswer ? choices[validCorrectAnswer] : null,
    explanation: trimIncompleteExplanation(questionNumber, extractExplanation(sourcePages)),
    source: SOURCE,
    category: CATEGORY,
  };
  if (clinicalDataOverrides.has(questionNumber)) {
    question.clinicalData = clinicalDataOverrides.get(questionNumber);
    const displayScenario = compactClinicalScenario(questionNumber, question.scenario);
    if (displayScenario) question.displayScenario = displayScenario;
  }
  if (explanationDataOverrides.has(questionNumber)) {
    question.explanationData = explanationDataOverrides.get(questionNumber);
  }

  if (questionVisual || explanationVisual) {
    question.visuals = {};
    if (questionVisual) {
      question.visuals.question = [{
        src: questionVisual,
        label: `Question ${questionNumber} source figure`,
        caption: `Figure or table provided with MCCKAP 2023 question ${questionNumber}.`,
      }];
    }
    if (explanationVisual) question.visuals.explanation = [explanationVisual];
  }

  questions.push(question);
  audit.push({
    questionNumber,
    status: validCorrectAnswer ? "ready" : "missing-answer",
    pages: sourcePages.map((page) => page.number),
    detectedChoices: optionRows?.length ?? 0,
    choices: Object.keys(choices).length,
    answer: validCorrectAnswer,
    explanation: Boolean(question.explanation),
    visual: Boolean(questionVisual),
    explanationVisual: Boolean(explanationVisual),
  });
}

await fs.writeFile(OUTPUT_FILE, toTypeScript(questions));
await fs.writeFile(
  path.join(ROOT, "tmp/pdfs/mcckap-2023/import-audit.json"),
  `${JSON.stringify(audit, null, 2)}\n`,
);

const summary = {
  questions: questions.length,
  disabled: audit.filter((item) => item.status === "disabled").length,
  missingOptions: audit.filter((item) => item.status === "missing-options").length,
  missingAnswers: audit.filter((item) => item.status === "missing-answer").length,
  withExplanations: questions.filter((question) => question.explanation).length,
  withQuestionVisuals: questions.filter((question) => question.visuals?.question?.length).length,
  withExplanationVisuals: questions.filter((question) => question.visuals?.explanation?.length).length,
};
console.log(JSON.stringify(summary, null, 2));
