import { Question } from "@/types/question";

type QuestionEnrichment = Partial<Pick<Question, "displayScenario" | "clinicalData" | "explanationData" | "visuals" | "choices" | "correctAnswer" | "correctAnswerText" | "images">>;

// These tables reproduce values already present in the source question stems.
// They keep dense clinical data readable without changing the question content.
export const questionEnrichments: Record<number, QuestionEnrichment> = {
  // Verified against the original Zimmerman and PICU MCQ Review PDFs. These figures
  // belong to the preceding item on the source page, not to the question below it.
  2260: { images: [] },
  2411: { images: [] },
  2540: { images: [] },
  3412: {
    images: [],
    visuals: { question: [{ src: "/images/picumcq/q3412-ventilation-perfusion.svg", label: "Ventilation-perfusion figure", caption: "In an upright lung, blood flow and ventilation are both greatest at the base, but blood flow declines more steeply toward the apex; V/Q therefore rises from base to apex." }] },
  },
  3413: { images: ["/PICUMCQBANK/images/picumcq/picumcq-pg20-img1.jpeg"] },
  // The source PDF names these figures but does not embed them. The following
  // self-contained diagrams faithfully reflect the findings stated in its stems
  // and explanations, so the questions remain answerable in the web review.
  3401: {
    visuals: { question: [{ src: "/images/picumcq/q3401-dilated-cardiomyopathy-ecg.svg", label: "ECG schematic", caption: "Sinus tachycardia, left atrial enlargement, poor R-wave progression, and lateral T-wave inversion as described in the source explanation." }] },
  },
  3402: {
    visuals: { question: [{ src: "/images/picumcq/q3402-pompe-ecg.svg", label: "ECG schematic", caption: "Short PR interval with biventricular hypertrophy and strain changes characteristic of infantile Pompe disease." }] },
  },
  3407: {
    visuals: { question: [{ src: "/images/picumcq/q3407-pressure-volume-loop.svg", label: "Pressure-volume loop", caption: "A normal saline bolus increases preload, shifting the loop rightward and increasing stroke volume." }] },
  },
  3408: {
    visuals: { question: [{ src: "/images/picumcq/q3408-tamponade-hemodynamics.svg", label: "Hemodynamic data", caption: "Cardiac tamponade produces near-equal elevated diastolic filling pressures with low output." }] },
    choices: {
      A: "Elevated right atrial pressure with low right ventricular diastolic and pulmonary capillary wedge pressures.",
      B: "High pulmonary capillary wedge pressure with normal right atrial and right ventricular diastolic pressures.",
      C: "Near-equal elevated right atrial, right ventricular end-diastolic, and pulmonary capillary wedge pressures with low cardiac output.",
      D: "Isolated elevation of right ventricular systolic pressure with normal diastolic filling pressures.",
      E: "Low cardiac filling pressures with a hyperdynamic cardiac output.",
    },
    correctAnswer: "C",
    correctAnswerText: "Near-equal elevated right atrial, right ventricular end-diastolic, and pulmonary capillary wedge pressures with low cardiac output.",
  },
  3410: {
    visuals: { question: [{ src: "/images/picumcq/q3410-oxygen-dissociation-shunt.svg", label: "Oxygen-content curve", caption: "The source values give CcO2 20 mL/dL, CaO2 17 mL/dL, and CvO2 10 mL/dL; shunt fraction is 30%." }] },
  },
  3459: {
    visuals: { explanation: [{ src: "/images/picumcq/q3459-peep-afterload.svg", label: "PEEP and afterload", caption: "In left ventricular failure, positive pleural pressure can reduce left ventricular transmural pressure and afterload." }] },
  },
  3496: {
    visuals: { explanation: [{ src: "/images/picumcq/q3496-paco2-cerebral-blood-flow.svg", label: "PaCO2 and cerebral blood flow", caption: "Both hypocapnia and hypercapnia can be harmful after severe traumatic brain injury; target normoventilation unless otherwise directed." }] },
  },
  3385: {
    displayScenario: "A 9-year-old, 30-kg boy is admitted to the PICU for status asthmaticus despite continuous albuterol and oral prednisone. He remains tachypneic with diffuse bilateral wheeze, poor air movement, and marked accessory-muscle use. Laboratory data are summarized below. Which of the following is the most appropriate next step in treatment?",
    clinicalData: [{ title: "Laboratory data", columns: ["Test", "Result"], rows: [["Sodium", "141 mEq/L"], ["Potassium", "4.3 mEq/L"], ["Chloride", "104 mEq/L"], ["Bicarbonate", "19 mEq/L"], ["Blood urea nitrogen / creatinine", "17 / 0.2 mg/dL"], ["Glucose", "104 mg/dL"], ["Calcium / phosphorus / magnesium", "10.1 / 3.3 / 1.9"]] }],
  },
  3396: {
    displayScenario: "A 1-month-old with hypoplastic left heart syndrome after a Norwood stage I procedure presents with poor intake, irritability, cyanosis, mottling, and respiratory distress. After a 10-mL/kg normal saline bolus and intubation, the child does not improve. Blood-gas data are summarized below. You are called from this community emergency department. Which advice is most appropriate?",
    clinicalData: [{ title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.33"], ["PaCO2", "68 mm Hg"], ["PaO2", "24 mm Hg"], ["Base excess", "-2 mEq/L"]] }],
  },
  3414: {
    // The source page for question 30 contains the venous-return figure. It was
    // previously (and incorrectly) displayed with question 32.
    images: [],
    displayScenario: "A 12-year-old with ARDS is ventilated with synchronized intermittent mandatory ventilation in pressure-control/pressure-support mode (PIP 28 cm H2O, PEEP 12 cm H2O, FiO2 0.60, rate 15/min). Arterial blood-gas and environmental data are summarized below. What is this patient’s PAO2-PaO2 difference?",
    clinicalData: [{ title: "Gas-exchange data", columns: ["Parameter", "Value"], rows: [["PaCO2 / PaO2", "60 / 60 mm Hg"], ["Respiratory quotient", "0.8"], ["Core temperature", "37 C"], ["Barometric pressure", "747 mm Hg"]] }],
  },
  3432: {
    displayScenario: "A 10-year-old with fever, vomiting, hypotension, severe hypoxemia, and respiratory distress is intubated. Oxygenation improves after intubation, but the acid-base status is unchanged. Blood gases before and after intubation are summarized below. Which condition has also occurred as a result of endotracheal intubation?",
    clinicalData: [{ title: "Arterial blood gases", columns: ["Test", "Before intubation", "After intubation"], rows: [["pH", "7.15", "7.15"], ["PaCO2", "35 mm Hg", "35 mm Hg"], ["PaO2", "46 mm Hg", "75 mm Hg"]] }],
  },
  3462: {
    displayScenario: "A 10-year-old with scoliosis and aspiration pneumonia is on assist-control ventilation. Ventilator and arterial blood-gas data are summarized below. What (if anything) should be done?",
    clinicalData: [{ title: "Ventilator and blood-gas data", columns: ["Parameter", "Value"], rows: [["FiO2 / PEEP", "1.0 / 5 cm H2O"], ["Tidal volume / rate", "6 mL/kg / 16 per min"], ["PaO2 / PaCO2", "48 / 57 mm Hg"], ["pH", "7.20"], ["Plateau pressure", "29 cm H2O"], ["Expiratory time", "Adequate for emptying"]] }],
  },
  3491: {
    displayScenario: "A 6-year-old with sickle beta-thalassemia develops acute hypoxemia and increased work of breathing. Chest radiography shows new right-upper-lobe and left-lower-lobe infiltrates. Blood-gas data on 100% oxygen are summarized below. What is the most likely initiating mechanism for this acute deterioration?",
    clinicalData: [{ title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["FiO2", "1.0 via nonrebreathing mask"], ["pH", "7.27"], ["PaCO2", "60 mm Hg"], ["PaO2", "50 mm Hg"]] }],
  },
  3548: {
    displayScenario: "A previously healthy 6-year-old boy presents with respiratory distress, abdominal and chest pain, icterus, hepatosplenomegaly, and hypoxemia. Chest radiography shows cardiomegaly and a right-middle-lobe opacity. Key blood-gas and hemoglobin data are summarized below. Which therapy should be ordered immediately?",
    clinicalData: [{ title: "Arterial blood gas and hemoglobin", columns: ["Test", "Result"], rows: [["pH", "7.34"], ["PaCO2", "56 mm Hg"], ["PaO2", "62 mm Hg"], ["Bicarbonate", "24 mmol/L"], ["Hemoglobin", "6.4 g/dL"]] }],
  },
  3614: {
    displayScenario: "An 8-year-old with smoke-inhalation injury is intubated and resuscitated. Bronchoscopy shows soot throughout the airway. After empirical treatment with an older cyanide antidote kit, perfusion and acid-base status worsen. Serial data are summarized below. What therapy should now be considered?",
    clinicalData: [{ title: "Serial blood-gas and toxin data", columns: ["Test", "Initial", "Two hours later"], rows: [["pH", "7.37", "7.20"], ["PaCO2 / PaO2", "25 / 450 mm Hg", "39 / 95 mm Hg"], ["Bicarbonate", "14.3 mEq/L", "18 mEq/L"], ["Lactate", "4.2 mmol/L", "8 mmol/L"], ["Carboxyhemoglobin", "2.5%", "2.2%"]] }],
  },
  3626: {
    displayScenario: "A 9-year-old with acute myelogenous leukemia and hyperleukocytosis receives rasburicase for tumor-lysis prophylaxis. Pulse-oximetry saturation falls to 85% without improvement on 100% oxygen, although the arterial oxygen tension is very high. Arterial blood-gas data are summarized below. Which cation is directly involved in this process?",
    clinicalData: [{ title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.42"], ["PaCO2", "30 mm Hg"], ["PaO2", "480 mm Hg"], ["Bicarbonate", "20 mEq/L"], ["Pulse oximetry", "85%"]] }],
  },
  3645: {
    displayScenario: "A 5-month-old with repaired obstructed total anomalous pulmonary venous connection and pulmonary hypertension develops respiratory failure and is transitioned to HFOV. Serum chemistry and arterial blood-gas data are summarized below. Which continuous medication most likely caused the laboratory discrepancy?",
    clinicalData: [{ title: "Chemistry and blood-gas data", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "152 / 3.6 / 107 mmol/L"], ["CO2", "23 mmol/L"], ["BUN / creatinine", "34 mg/dL / 1.26 mg/dL"], ["Glucose", "132 mg/dL"], ["Serum osmolality", "348 mOsm/kg"], ["pH / PaCO2 / PaO2", "7.25 / 51 / 43 mm Hg"], ["Base deficit / lactate", "-4.7 / 1.2 mg/dL"]] }],
  },
  3651: {
    displayScenario: "A 2-year-old with MRSA pneumonia has fluid-refractory septic shock despite epinephrine and dopamine. Examination suggests myocardial depression and the central venous pressure is 10-12 mm Hg. Blood-gas and perfusion data are summarized below. What is the next best intervention?",
    clinicalData: [{ title: "Perfusion and blood-gas data", columns: ["Parameter", "Value"], rows: [["Epinephrine / dopamine", "0.15 / 15 mcg/kg/min"], ["Fluid received", "100 mL/kg normal saline"], ["pH / PaCO2 / PaO2", "7.25 / 30 / 85 mm Hg"], ["Bicarbonate / base deficit", "16 mEq/L / -8"], ["Lactate", "5 mg/dL"], ["Central venous pressure", "10-12 mm Hg"]] }],
  },
  3652: {
    displayScenario: "A 12-year-old with severe status asthmaticus is intubated and receiving continuous albuterol and IV methylprednisolone. He has good peripheral perfusion, no marked air trapping, and a mixed venous saturation of 75%. Ventilator and blood-gas data are summarized below. Which intervention is most likely to improve his lactic acidosis?",
    clinicalData: [{ title: "Ventilator, perfusion, and blood-gas data", columns: ["Parameter", "Value"], rows: [["Ventilator rate / PEEP / FiO2", "10 per min / 5 cm H2O / 0.50"], ["Tidal volume", "6 mL/kg"], ["Mixed venous oxygen saturation", "75%"], ["pH / PaCO2 / PaO2", "7.20 / 55 / 95 mm Hg"], ["Arterial lactate", "7.3 mmol/L"]] }],
  },
  3658: {
    displayScenario: "A 5-day-old infant with hypoplastic left heart syndrome after a Norwood procedure and Blalock-Taussig shunt has low cardiac output. Hemodynamic, blood-gas, and laboratory data are summarized below. What is the most appropriate next management step?",
    clinicalData: [{ title: "Hemodynamic and perfusion data", columns: ["Parameter", "Value"], rows: [["Heart rate / blood pressure / CVP", "180/min / 90/45 mm Hg / 12 mm Hg"], ["SaO2 / mixed venous saturation", "85% / 30%"], ["Urine output", "0.5 mL/kg/h"], ["Dopamine / milrinone", "7.5 / 0.25 mcg/kg/min"], ["pH / PaCO2 / PaO2", "7.31 / 50 / 38 mm Hg"], ["Base deficit / hematocrit / lactate", "-6 / 41% / 6.0 mmol/L"]] }],
  },
  3593: {
    displayScenario: "While rounding in the PICU, a resident notes an ETCO2 of 45 mm Hg while a simultaneous arterial blood gas has a PaCO2 of 60 mm Hg and suggests ignoring the ETCO2. Despite this difference, there is useful information in capnography. Which is the best reason to continue monitoring ETCO2?",
    choices: {
      A: "An end-tidal waveform without a true plateau indicates restrictive lung disease.",
      B: "Dead-space fraction is estimated as Vd/Vt = (PaCO2 - PECO2) / PECO2.",
      C: "Early ARDS is marked by a normal dead-space fraction.",
      D: "Sudden loss of the end-tidal CO2 waveform most likely indicates ventilator malfunction.",
      E: "Dead-space fraction is an independent risk factor for death.",
    },
    correctAnswer: "E",
    correctAnswerText: "Dead-space fraction is an independent risk factor for death.",
  },
  1024: {
    displayScenario: "A 15-year-old high school cheerleader presents to the pediatric intensive care unit with hypotension, fever, tachycardia, and severe lower back pain. She denies trauma, although cheerleading practice has been intense. Three days ago she was diagnosed with a muscle strain and prescribed rest and meloxicam. The pain became severe enough that she did not want to get out of bed; she then developed fever and decreased urine output. After fluids and ceftriaxone for presumed sepsis, her blood pressure improves and she produces some urine. Overnight her urine output falls, a bladder scan shows 800 mL, and a urinary catheter drains a large volume. Several hours later, she reports that she cannot move her legs normally. Magnetic resonance imaging with gadolinium contrast is obtained (Figure). Of the following, the MOST likely diagnosis is",
    clinicalData: [{
      title: "Initial laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "18,000/uL"], ["Hemoglobin / hematocrit", "15 g/dL / 45%"], ["Platelets", "150 x 10^3/uL"], ["Sodium / potassium / chloride", "145 / 4.5 / 108 mEq/L"], ["Bicarbonate", "18 mEq/L"], ["Urea nitrogen / creatinine", "30 mg/dL / 1.3 mg/dL"], ["Glucose", "100 mg/dL"], ["C-reactive protein", "98 mg/dL"], ["Erythrocyte sedimentation rate", "80 mm/hour"]],
    }],
  },
  1052: {
    displayScenario: "A 4-year-old child is admitted to the PICU after ventricular septal defect patch repair on cardiopulmonary bypass. Eight hours after admission, urine output has decreased to 0.2 mL/kg/h for 3 hours. The child is resting comfortably on 2 L/min nasal cannula oxygen. Examination shows cool extremities and a capillary refill time of 4 seconds; chest tube drainage is serous with no signs of bleeding. Of the following, the BEST next step in management is",
    clinicalData: [{
      title: "Postoperative laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "14.0 x 10^3/uL"], ["Hemoglobin", "8.5 g/dL"], ["Platelet count", "225 x 10^3/uL"], ["Sodium / potassium / chloride", "148 / 4.0 / 115 mEq/L"], ["Bicarbonate", "16 mEq/L"], ["Lactate", "4.0 mmol/L"], ["Urea nitrogen / creatinine", "22 mg/dL / 0.6 mg/dL"], ["Magnesium", "2 mEq/L"], ["Albumin", "4.0 g/dL"], ["Ionized calcium", "4.8 mg/dL"]],
    }],
  },
  1054: {
    displayScenario: "A 30-day-old infant has remained intubated after repair of congenital diaphragmatic hernia and VA-ECMO decannulation. Pulmonary hypertension is treated with sildenafil. During the last 24 hours, fluid balance is +200 mL and the chest radiograph is stable. The infant receives one diuretic, and the team adds a second. The following day, repeat laboratory data are obtained. Of the following, the mechanism of action of the second diuretic medication added to this infant's regimen is",
    clinicalData: [
      { title: "Before the second diuretic", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "134 / 3.4 / 103 mEq/L"], ["Total CO2", "36 mEq/L"], ["Urea nitrogen / creatinine", "30 mg/dL / 0.2 mg/dL"], ["Glucose", "90 mg/dL"], ["Arterial pH / PaCO2 / PaO2", "7.48 / 58 mm Hg / 86 mm Hg"], ["Bicarbonate", "35 mEq/L"], ["Oxygen saturation", "95%"]] },
      { title: "One day after the second diuretic", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "132 / 3.2 / 103 mEq/L"], ["Total CO2", "30 mEq/L"], ["Urea nitrogen / creatinine", "32 mg/dL / 0.2 mg/dL"], ["Glucose", "90 mg/dL"]] },
    ],
  },
  1066: {
    explanationData: [{
      title: "Myer-Cotton staging for subglottic stenosis",
      columns: ["Grade", "Airway obstruction"],
      rows: [["I", "0%-50%"], ["II", "51%-70%"], ["III", "71%-99%"], ["IV", "100%"]],
    }],
  },
  1069: {
    explanationData: [{
      title: "Complications of nephrotic syndrome",
      columns: ["Due to nephrotic syndrome", "Due to steroids or immunosuppression therapy"],
      rows: [
        ["Infections: sepsis, cellulitis, pneumonia, spontaneous bacterial peritonitis", "Infection with atypical organisms; reactivation of CMV or hepatitis B"],
        ["Fluid overload: pleural effusion, pericardial effusion", "Osteoporosis"],
        ["Acute kidney injury", "Bone marrow suppression"],
        ["Electrolyte issues", "Hyperglycemia"],
        ["Anemia", "Gastric or peptic ulcers"],
        ["Hypertension", "Behavior problems"],
        ["Thromboembolism of veins or arteries: renal vein thrombosis, pulmonary embolus, sagittal venous thrombosis", ""],
      ],
    }],
  },
  1074: {
    explanationData: [{
      title: "Causes of hypertensive emergencies in children",
      columns: ["Age", "Causes"],
      rows: [
        ["Infant", "Coarctation of the aorta; renal parenchymal disease; renovascular causes"],
        ["Young child", "Renal parenchymal disease; renovascular causes; endocrine causes (eg, thyrotoxicosis); coarctation of the aorta"],
        ["School age", "Renal parenchymal disease (eg, hemolytic uremic syndrome, Henoch-Schonlein purpura, acute poststreptococcal glomerulonephritis); renovascular causes; endocrine causes; coarctation of the aorta"],
        ["Adolescent", "Renal parenchymal disease; renovascular causes; endocrine causes; medication and recreational substances"],
      ],
    }],
  },
  1075: {
    explanationData: [{
      title: "Factors associated with medication errors",
      columns: ["Factor", "Vulnerability", "Hospital-based example"],
      rows: [
        ["Organizational", "Divergent systems; conflicting priorities", "Bedside medication pumps programmed differently than the EMR order"],
        ["Work", "Distraction; patient load; repetition", "Nurse asked to enter a complex medication order while providing patient care"],
        ["Task", "Complexity; ambiguous information; reliance on experience", "Inability to locate medication-administration guidelines on the hospital intranet"],
        ["Team", "Support; recognition of deficiency; communication", "Lack of medication-information handover at shift change"],
        ["Individual", "Inexperience; fund of knowledge; lack of skill", "Non-pediatric residents writing weight-based medication dosing"],
      ],
    }],
  },
  1089: {
    displayScenario: "A 3-month-old male infant is admitted to the pediatric intensive care unit with respiratory distress resulting from viral bronchiolitis. The infant has a history of prematurity, respiratory distress syndrome, and bronchopulmonary dysplasia, and at home requires supplemental oxygen via nasal cannula to maintain his oxygen saturation above 92%. His home medications include bronchodilators, inhaled steroids, furosemide, and ranitidine. Over the past 24 hours the infant has developed poor oral intake, rapid breathing, and an increased supplemental oxygen requirement. On admission, the infant is tachypneic, tachycardic, and hypotensive with weak pulses and prolonged capillary refill time. The infant is placed on non-invasive positive-pressure ventilation, intravenous access is secured, and a 20 mL/kg isotonic fluid bolus is administered. Capillary blood gas values are summarized below. Of the following, the MOST likely cause of this infant’s abnormal pH is",
    clinicalData: [{
      title: "Capillary blood gas",
      columns: ["Test", "Result"],
      rows: [["pH", "7.51"], ["PCO2", "47 mm Hg"], ["HCO3", "39 mEq/L (39 mmol/L)"]],
    }],
    explanationData: [{
      title: "Causes of metabolic alkalosis in children",
      columns: ["High urine chloride (chloride resistant)", "Low urine chloride (chloride responsive)"],
      rows: [[
        "Mineralocorticoid excess; renal artery stenosis; renin-secreting tumor; adrenal hyperplasia; Liddle syndrome; Cushing syndrome; iatrogenic steroid use; licorice ingestion; Bartter syndrome; Gitelman syndrome; hypokalemia; hypomagnesemia; milk-alkali syndrome; exogenous buffer administration; 17alpha-hydroxylase/17,20-lyase deficiency; 11-beta-hydroxylase deficiency",
        "Gastrointestinal loss: vomiting, diarrhea, nasogastric suction, cystic fibrosis, villous adenoma, congenital chloride-losing enteropathy; post-hypercapnia syndrome; volume contraction from diuretic use",
      ]],
    }],
  },
  1090: {
    explanationData: [{
      title: "Diagnostic criteria for hemophagocytic lymphohistiocytosis",
      columns: ["Criterion", "Finding"],
      rows: [
        ["1", "Persistent fever"],
        ["2", "Splenomegaly"],
        ["3", "Cytopenias: hemoglobin <9.0 g/dL (90 g/L), neutrophils <1,000/uL (<1.0 x 10^9/L), platelets <100 x 10^3/uL (<100 x 10^9/L)"],
        ["4", "Hypofibrinogenemia (<150 mg/dL [1.5 g/L]) or hypertriglyceridemia (>265 mg/dL [>3.0 mmol/L])"],
        ["5", "Hyperferritinemia (>500 ng/mL [>500 ug/L])"],
        ["6", "Hemophagocytosis"],
        ["7", "Low natural killer cell activity"],
        ["8", "High concentration of soluble interleukin 2 receptor"],
      ],
    }],
  },
  1139: {
    clinicalData: [{
      title: "Arterial blood gas and perfusion data",
      columns: ["Test", "Result"],
      rows: [
        ["Carboxyhemoglobin", "28% to 1.6% over 6 hours"],
        ["pH", "7.18"],
        ["PaCO2", "36 mm Hg"],
        ["PaO2", "264 mm Hg"],
        ["Base excess", "-10.00 mEq/L (-10 mmol/L)"],
        ["Lactate", "61.26 to 104.50 mg/dL (6.8 to 11.6 mmol/L)"],
      ],
    }],
  },
  1183: {
    clinicalData: [
      {
        title: "Initial blood gas",
        columns: ["Test", "Result"],
        rows: [["pH", "7.15"], ["PaCO2", "38 mm Hg"], ["PaO2", "60 mm Hg"], ["Base deficit", "-20 mEq/L"], ["FiO2", "0.21"]],
      },
      {
        title: "Repeat blood gas and co-oximetry",
        columns: ["Test", "Result"],
        rows: [["pH", "7.18"], ["PaCO2", "35 mm Hg"], ["PaO2", "63 mm Hg"], ["Base deficit", "-18 mEq/L"], ["Lactate", "108.11 mg/dL (12 mmol/L)"], ["Carboxyhemoglobin", "10%"], ["Methemoglobin", "10%"]],
      },
    ],
  },
  1093: {
    displayScenario: "A 17-year-old adolescent boy with a history of anxiety and COVID-19 infection 7 months ago is evaluated for chest pain and tachycardia. In addition, he has mild nasal congestion, malaise, and a sore throat. Oxygen saturation in room air is 96%. He was given 2 L of normal saline in the emergency department but remains tachycardic. An electrocardiogram demonstrated sinus tachycardia with normal axis and intervals. Cardiac markers are summarized below. He reports tenderness to palpation over the sternum and discomfort when supine or with cough. A chest radiograph shows a cardiac silhouette that is at the high end of normal without any pulmonary infiltrates. A rapid antigen test result for SARS-CoV-2 is positive. Of the following, the disease process that is MOST likely causing this patient’s symptoms is",
    clinicalData: [{
      title: "Cardiac markers",
      columns: ["Test", "Result"],
      rows: [["Troponin I", "<0.01 ng/mL (<0.01 µg/L)"], ["Brain-type natriuretic peptide", "<10 pg/mL (<10 ng/L)"], ["D-dimer", "10 µg/mL (54.76 nmol/L)"]],
    }],
  },
  1125: {
    displayScenario: "A 3-year-old previously healthy girl presents to the pediatric emergency department with altered mental status and vomiting after being found with an open bottle of pills about 3 hours earlier. The family is not sure what she ingested but reported having acetaminophen, diphenhydramine, aspirin, and some leftover antibiotics in the home. Her vital signs are as follows: blood pressure 90/48 mm Hg, heart rate 155 beats/min, respiratory rate 52 breaths/min, and oxygen saturation 100% in room air. Intravenous access is established, and 20 mL/kg of 0.9% saline is administered. On examination, the child has a Glasgow Coma Scale score of 13 (opens eyes to voice; is confused, but follows commands). Her lungs are clear to auscultation, her heart examination findings are normal, her abdomen is mildly tender diffusely, and the skin is normal. Her pupils are mid-position and briskly reactive; her deep tendon reflexes are normal. Venous blood gas and toxicology results are summarized below. Of the following, the MOST appropriate next step in management is to",
    clinicalData: [{
      title: "Venous blood gas and toxicology",
      columns: ["Test", "Result"],
      rows: [["pH", "7.37"], ["PCO2", "24 mm Hg"], ["PO2", "86 mm Hg"], ["Bicarbonate", "14 mEq/L"], ["Anion gap", "28"], ["Blood salicylate concentration", "64 mg/dL"], ["Blood acetaminophen concentration", "<4 µg/mL"]],
    }],
  },
  1098: {
    displayScenario: "A 15-year-old boy recently returned from the Ivory Coast after a church mission trip. He has a 1-week history of periodic fever, lethargy, malaise, and worsening headaches. On admission he develops seizure activity and remains unresponsive. Brain computed tomography shows no obvious intracranial masses or areas of contrast enhancement. Microscopic evaluation of a thin blood smear is shown in the Figure. Of the following, the medications and routes for initial treatment of this disease SHOULD include",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "19,200/uL"], ["Hemoglobin / hematocrit", "5.1 g/dL / 18%"], ["Platelet count", "200 x 10^3/uL"], ["Sodium / potassium / chloride", "131 / 3.8 / 105 mEq/L"], ["Total CO2", "11 mEq/L"], ["Urea nitrogen / creatinine", "32 mg/dL / 2.8 mg/dL"], ["Glucose", "46 mg/dL"], ["Lactate", "7.0 mmol/L"]],
    }],
  },
  1107: {
    explanationData: [{
      title: "PICU medications with known high risk of torsades de pointes",
      columns: ["Medication class", "Medication"],
      rows: [
        ["Anesthetics", "Propofol; sevoflurane"],
        ["Antiarrhythmics", "Amiodarone; flecainide; procainamide; sotalol"],
        ["Antibiotics", "Azithromycin; ciprofloxacin; erythromycin; levofloxacin"],
        ["Antifungals", "Fluconazole; pentamidine"],
        ["Antipsychotics", "Droperidol; haloperidol"],
        ["Gastrointestinal medications", "Ondansetron"],
        ["Narcotics", "Methadone"],
      ],
    }],
  },
  1112: {
    displayScenario: "A 12-year-old boy is admitted to the pediatric intensive care unit with tachypnea, increased work of breathing, abdominal pain, and severe acidosis. Arterial blood gas results are summarized below. Further evaluation reveals new-onset type I diabetes mellitus with diabetic ketoacidosis. He is treated with intravenous fluids and an insulin infusion; his symptoms resolve and his anion gap and pH improve. After 2 days of recovery, he begins intermittent subcutaneous insulin therapy. Overnight, he transitions to self-administered injections using an insulin pen and is scheduled for transfer to the general pediatric floor for continued diabetes education. The physician is then called emergently because the patient's 10-year-old brother, who has been visiting unsupervised, develops generalized tonic-clonic seizure activity. His mother denies significant medical history, prior seizures, recent ingestions, or trauma. After ensuring that the airway is protected and applying a facemask with 100% oxygen, the MOST appropriate next step is to",
    clinicalData: [{
      title: "Initial arterial blood gas",
      columns: ["Test", "Result"],
      rows: [["pH", "6.97"], ["PCO2", "19 mm Hg"], ["PO2", "100 mm Hg"]],
    }],
  },
  1120: {
    displayScenario: "A 5-year-old child sustains 40% partial- and full-thickness burns to the torso and extremities. Debridement occurs under general anesthesia. The child is extubated after sugammadex, but then develops respiratory distress in the PICU and requires escalating noninvasive ventilation. Despite bilevel positive airway pressure and FiO2 1.0, oxygen saturation is 86%; the child remains tachycardic and becomes lethargic. Intubation is planned. Of the following, the BEST next step in treatment is intravenous administration of",
    clinicalData: [
      { title: "Initial blood tests", columns: ["Test", "Result"], rows: [["White blood cell count", "3,200/uL"], ["Hemoglobin / hematocrit", "8.2 g/dL / 28%"], ["Sodium / potassium / chloride", "154 / 5.8 / 108 mEq/L"], ["Total CO2", "15 mEq/L"], ["Urea nitrogen / creatinine", "28 mg/dL / 1.3 mg/dL"], ["Glucose", "132 mg/dL"], ["Lactate", "3.1 mmol/L"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.21"], ["PaCO2 / PaO2", "58 / 146 mm Hg"], ["Bicarbonate", "16 mEq/L"], ["Base excess", "-5 mEq/L"]] },
      { title: "Urinalysis", columns: ["Test", "Result"], rows: [["Urine", "Slightly blood tinged"], ["Red blood cells", "Positive"], ["Specific gravity", "1.030"]] },
    ],
  },
  1124: {
    explanationData: [{
      title: "Modified Duke criteria",
      columns: ["Category", "Criteria"],
      rows: [
        ["Major: positive blood culture", "Typical microorganisms from 2 separate cultures; or persistently positive cultures (>2 cultures drawn >12 hours apart, or all of 3 or a majority of >4 cultures drawn at least 1 hour apart); or a single positive culture for Coxiella burnetii or antiphase-I IgG titer >1:800"],
        ["Major: evidence of endocardial involvement", "Echocardiogram positive for infective endocarditis: vegetation, abscess, pseudoaneurysm, intracardiac fistula, valvular perforation, or new partial dehiscence of a prosthetic valve; or new valvular regurgitation"],
        ["Minor", "Predisposing heart condition or intravenous drug use; fever >38 C; vascular phenomena; immunological phenomena; microbiological evidence not meeting major criteria"],
        ["Definite infective endocarditis", "2 major, or 1 major and 3 minor, or 5 minor criteria"],
        ["Possible infective endocarditis", "1 major and 1 minor, or 3 minor criteria"],
      ],
    }],
  },
  1127: {
    explanationData: [
      {
        title: "Transmission-based isolation precautions",
        columns: ["Precaution", "Purpose", "Key requirements"],
        rows: [
          ["Contact", "Prevents transmission through direct or indirect contact with the care environment", "Private room; clean nonsterile gloves and gown; limit transport and common-area sharing; avoid sharing noncritical equipment"],
          ["Droplet", "Prevents transmission of droplets (>5 microns) through close respiratory or mucous-membrane contact", "Private room or cohort; no special airflow required; mask (preferably N95) and droplet mask on patient during transport; respiratory hygiene; gown and gloves per Standard Precautions"],
          ["Airborne", "Prevents transmission of airborne droplets (<5 microns) that remain infectious and suspended for more than 1 hour", "Negative-pressure room with 6-12 air exchanges/hour; HEPA filtration before recirculation; closed doors and windows; N95 mask; droplet mask on patient during transport; respiratory hygiene; gown and gloves per Standard Precautions"],
        ],
      },
      {
        title: "Standard precautions",
        columns: ["Measure", "Requirements"],
        rows: [
          ["Core principle", "Minimum protection for all patients at all times; assumes blood, body fluids, secretions, and excretions may contain infectious organisms"],
          ["Hand hygiene", "After touching blood, body fluids, secretions, contaminated items, after removing gloves, and between patients"],
          ["Personal protective equipment", "Gloves for contact with blood, body fluids, secretions, contaminated items, mucous membranes, or non-intact skin; gown for potential contact with contaminated fluids; mask or eye protection for possible sprays"],
          ["Safe injections", "Single-use needles and syringes; limit multi-use vials and dedicate to a single patient when possible"],
          ["Safe handling", "Clean and disinfect contaminated equipment and surfaces according to policy"],
          ["Respiratory hygiene", "Cover mouth and nose when coughing or sneezing; hand hygiene after touching the patient or care-environment items; wear a mask or maintain more than 3 feet of distance when possible"],
        ],
      },
    ],
  },
  1129: {
    displayScenario: "A 12-year-old boy is admitted to the PICU late in the evening for fever and weight loss over several weeks. The hematology-oncology service recommends 1.5 times maintenance fluids and rasburicase for elevated uric acid, and requests that he be nil per os for a bone marrow aspirate and biopsy in the morning. Six hours later he develops respiratory distress; his lungs are clear and chest radiography is without significant pathology. An arterial blood gas obtained by co-oximetry is summarized below. Of the following, the MOST important immediate treatment for this patient is",
    clinicalData: [
      { title: "Initial laboratory data", columns: ["Test", "Result"], rows: [["White blood cell count", "250,000/uL"], ["Hemoglobin / hematocrit", "10 g/dL / 40%"], ["Sodium / potassium / chloride", "140 / 4.1 / 95 mEq/L"], ["Bicarbonate", "20 mEq/L"], ["Urea nitrogen / creatinine", "19 mg/dL / 1.2 mg/dL"], ["Uric acid", "12.3 mg/dL"]] },
      { title: "Arterial blood gas during respiratory distress", columns: ["Test", "Result"], rows: [["pH", "7.30"], ["PaCO2 / PaO2", "30 / 95 mm Hg"], ["Oxygen saturation", "95%"], ["Lactate", "8 mmol/L"]] },
    ],
  },
  1273: {
    clinicalData: [{
      title: "Laboratory results",
      columns: ["Test", "Result"],
      rows: [
        ["White blood cell count", "11,000 cells/µL (11 x 10^9/L)"],
        ["Hemoglobin", "4 g/dL (40 g/L)"],
        ["Hematocrit", "13%"],
        ["Platelet count", "120 x 10^3/µL (120 x 10^9/L)"],
        ["Total bilirubin", "24 mg/dL (410.5 µmol/L)"],
        ["Direct bilirubin", "0.5 mg/dL (8.5 µmol/L)"],
        ["Aspartate transaminase", "110 U/L"],
        ["Alkaline phosphatase", "300 U/L"],
        ["Alanine transaminase", "75 U/L"],
        ["Gamma-glutamyltransferase", "120 U/L"],
        ["International normalized ratio", "1.5"],
      ],
    }],
  },
  1131: {
    explanationData: [{
      title: "Drugs that can cause a prolonged QT interval in PICU patients",
      columns: ["Drug class", "Examples"],
      rows: [
        ["Antiarrhythmic agents", "Amiodarone; flecainide; procainamide; sotalol"],
        ["Antiemetic and promotility agents", "Droperidol; metoclopramide; ondansetron; azithromycin; erythromycin"],
        ["Antibiotics", "Macrolides; fluoroquinolones; other: amantadine, clindamycin"],
        ["Miscellaneous drugs", "Immunosuppressive agents; antipsychotic and tricyclic antidepressants; other: methadone, fosphenytoin, phenytoin, octreotide, papaverine, risperidone, terlipressin"],
      ],
    }],
  },
  1133: {
    displayScenario: "A 16-year-old boy is struck by an automobile and is intubated at the scene with a Glasgow Coma Scale score of 6. He undergoes evacuation of a right subdural hematoma, placement of an external ventricular drain, and femur fixation. After surgery he is admitted to the PICU intubated with central and arterial lines. His intracranial pressure is 10 to 16 mm Hg while receiving midazolam and fentanyl. One hour after PICU admission, he has 5 mL of clear external ventricular drain fluid and 15 mL of urine output. Of the following, after administering a 5 mL/kg 3% sodium chloride bolus, the MOST appropriate next step is to",
    clinicalData: [
      { title: "Vital signs and monitoring", columns: ["Measure", "Result"], rows: [["Temperature", "37.5 C"], ["Heart rate / respiratory rate", "95 / 15 per minute"], ["Blood pressure", "115/70 mm Hg"], ["Oxygen saturation", "100% on FiO2 0.5"], ["Central venous pressure", "11 mm Hg"], ["Intracranial pressure", "10 to 16 mm Hg"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.35"], ["PaCO2 / PaO2", "38 / 100 mm Hg"], ["HCO3", "20 mEq/L"], ["Lactate", "2 mmol/L"]] },
      { title: "Serum chemistry", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "128 / 4.3 / 110 mEq/L"], ["Total CO2", "21 mEq/L"], ["Urea nitrogen / creatinine", "10 mg/dL / 0.8 mg/dL"], ["Glucose", "140 mg/dL"], ["Serum osmolality", "270 mOsm/kg"]] },
      { title: "Hemogram and coagulation", columns: ["Test", "Result"], rows: [["Hemoglobin / hematocrit", "10 g/dL / 31%"], ["Platelet count", "324 x 10^3/uL"], ["Prothrombin time / partial thromboplastin time", "13 / 25 seconds"], ["Fibrinogen", "200 mg/dL"]] },
      { title: "Urinalysis", columns: ["Test", "Result"], rows: [["Specific gravity", "1.028"], ["Nitrites / leukocyte esterase", "Negative / negative"], ["Red blood cells", "Trace"], ["Urine osmolality", "340 mOsm/kg"], ["Urine sodium", "100 mEq/L"], ["Urine creatinine", "40 mg/dL"]] },
    ],
    explanationData: [{
      title: "Common causes of hyponatremia in children",
      columns: ["Etiology", "Volume status", "Serum osmolality", "Urine sodium", "Urine osmolality", "Urine specific gravity", "Urine output", "Other findings"],
      rows: [
        ["SIADH", "= / ↑", "↓", "↑", "↑", "↑", "↓", "Inciting events: cancer, infection, brain injury, drugs"],
        ["Cerebral salt wasting", "↓", "↓", "↑", "↑", "↑", "↑", "Brain injury"],
        ["Congestive heart failure", "↑", "↓", "↓", "↑", "= / ↑", "↓", "Gallop; poor perfusion"],
        ["Cirrhosis", "↑", "= / ↓", "↓", "↑", "= / ↑", "↓", "Evidence of liver injury or failure; ascites; jaundice"],
        ["Adrenal insufficiency", "↓", "↓", "↑", "↑", "↑", "Variable", "Risk factors for adrenal insufficiency; hypotension if uncontrolled"],
        ["Primary polydipsia", "= / ↑", "↓", "↓", "↓", "↓", "↑", "History of inappropriately excessive water intake; incorrect formula mixing"],
        ["GI losses or poor intake", "= / ↓", "↓", "↓", "↓", "↑", "= / ↓", "History of poor feeding, diarrhea, or vomiting"],
        ["Renal failure", "↑", "↑", "↑", "↑", "= / ↑", "↓", "Elevated urea nitrogen and serum creatinine"],
      ],
    }],
  },
  1136: {
    explanationData: [{
      title: "pRIFLE and KDIGO criteria for acute kidney injury in children",
      columns: ["Classification", "pRIFLE", "KDIGO", "pRIFLE urine output", "KDIGO urine output"],
      rows: [
        ["Risk / Stage 1", "eCCr decrease by 25%", "Serum creatinine increase 1.5-1.9 times baseline or >0.3 mg/dL (>26.5 micromol/L)", "<0.5 mL/kg/h for >8 hours", "<0.5 mL/kg/h for 6-12 hours"],
        ["Injury / Stage 2", "eCCr decrease by 50%", "Serum creatinine increase 2.0-2.9 times baseline", "<0.5 mL/kg/h for >16 hours", "<0.5 mL/kg/h for >12 hours"],
        ["Failure / Stage 3", "eCCr decrease by 75% or <35 mL/min/1.73 m2", "Serum creatinine increase 3.0 times baseline or eGFR <35 mL/min/1.73 m2", "<0.3 mL/kg/h for >12 hours or anuria for >12 hours", "<0.3 mL/kg/h for >24 hours or anuria for >12 hours"],
        ["Loss", "Persistent failure >4 weeks", "No equivalent", "Meets failure criteria for >4 weeks", "No equivalent"],
        ["End stage", "Persistent failure >3 months", "No equivalent", "Meets failure criteria for >3 months", "No equivalent"],
      ],
    }],
  },
  1348: {
    clinicalData: [
      {
        title: "Initial arterial blood gas",
        columns: ["Test", "Result"],
        rows: [["pH", "7.32"], ["PaCO2", "48 mm Hg"], ["PaO2", "68 mm Hg"], ["HCO3", "16 mEq/L"], ["Base deficit", "-3 mEq/L"]],
      },
      {
        title: "Arterial blood gas after ventilator changes",
        columns: ["Test", "Result"],
        rows: [["pH", "7.20"], ["PaCO2", "64 mm Hg"], ["PaO2", "72 mm Hg"], ["HCO3", "15 mEq/L"], ["Base deficit", "4 mEq/L"]],
      },
    ],
  },
  1362: {
    clinicalData: [{
      title: "Electrolytes and venous pH",
      columns: ["Test", "Result"],
      rows: [["Sodium", "147 mEq/L"], ["Potassium", "2.6 mEq/L"], ["Chloride", "103 mEq/L"], ["HCO3", "30 mEq/L"], ["Venous pH", "7.43"]],
    }],
  },
  1368: {
    clinicalData: [{
      title: "Initial laboratory data",
      columns: ["Test", "Result"],
      rows: [["pH", "7.21"], ["PaCO2", "47 mm Hg"], ["PaO2", "200 mm Hg"], ["HCO3", "34 mEq/L"], ["Base deficit", "-6 mEq/L"], ["Glucose", "122 mg/dL"], ["Lactate", "4.1 mmol/L"], ["Leukocyte count", "22,000 cells/mm3"]],
    }],
  },
  1467: {
    clinicalData: [{
      title: "Laboratory results",
      columns: ["Test", "Result"],
      rows: [["Sodium", "144 mEq/L"], ["Potassium", "3.0 mEq/L"], ["Chloride", "109 mEq/L"], ["CO2", "19 mEq/L"], ["BUN", "15 mg/dL"], ["Creatinine", "1.2 mg/dL"], ["White blood cell count", "6.3 x 10^9/L"], ["Hemoglobin", "10.2 g/dL"], ["Hematocrit", "34.6%"], ["Cyclosporine", "620 ng/mL (normal 100-400 ng/mL)"]],
    }],
  },
  2692: {
    clinicalData: [{
      title: "Laboratory results",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "2,000/mL (2 x 10^9/L)"], ["Hemoglobin", "8.0 g/dL (80 g/L)"], ["Platelet count", "53,000/mL (53 x 10^9/L)"], ["Absolute neutrophil count", "750/mL (0.75 x 10^9/L)"], ["Aspartate aminotransferase", "578 IU/L"], ["Alanine aminotransferase", "613 IU/L"]],
    }],
  },
  1158: {
    displayScenario: "A 15-year-old, 80-kg boy is transferred from oncology after rapid respiratory deterioration requiring 30 L/min of high-flow nasal cannula oxygen at FiO2 1.0. He underwent an allogeneic stem cell transplant 45 days ago for B-cell acute lymphocytic leukemia and received apheresis platelets about 8 hours before transfer. He develops fever and cough, and on PICU assessment is coughing clotted blood into a washcloth. His work of breathing continues to worsen, and emergency chest radiography is performed (Figure). Of the following, the MOST likely diagnosis for this patient is",
    clinicalData: [
      { title: "Hematology and coagulation", columns: ["Test", "Result"], rows: [["White blood cells", "3,500/uL"], ["Hemoglobin / hematocrit", "6 g/dL / 19%"], ["Platelets", "40 x 10^3/uL"], ["Prothrombin time / INR", "15 seconds / 1.4"], ["Partial thromboplastin time", "30 seconds"], ["Fibrinogen", "377 mg/dL"], ["D-dimer", "1.55 mcg/mL"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.35"], ["PaCO2 / PaO2", "50 / 60 mm Hg"], ["Bicarbonate", "28 mEq/L"]] },
    ],
  },
  1166: {
    displayScenario: "A 7-week-old infant is admitted to the PICU for failure to thrive and stridor. Since birth the infant has fed poorly, breathes quickly, and has blue lips during feeding. Examination shows dysmorphic facial features, hypotonia, low-set ears, cleft palate, an acyanotic grade III holosystolic murmur, and intermittent stridor that is worse with agitation. The infant has good air movement and no respiratory distress. Of the following, the MOST likely cause of this patient's stridor is",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cells", "8,620/uL"], ["Hemoglobin / hematocrit", "8.1 g/dL / 27%"], ["Sodium / potassium / chloride", "128 / 2.9 / 94 mEq/L"], ["Total CO2", "19 mEq/L"], ["Urea nitrogen / creatinine", "21 mg/dL / 0.28 mg/dL"], ["Glucose", "112 mg/dL"], ["ALT / AST", "33 / 21 U/L"], ["Albumin", "3.1 g/dL"], ["Total / ionized calcium", "6.9 / 2.16 mg/dL"], ["Magnesium", "2.19 mg/dL"], ["Lactate", "1.6 mmol/L"]],
    }],
  },
  1170: {
    displayScenario: "A 13-year-old boy with obesity is admitted to the PICU with acute hypoxemic respiratory failure due to COVID-19. He is intubated, sedated, and treated with dexamethasone and remdesivir. He receives volume-controlled synchronized intermittent mandatory ventilation with tidal volume 6 mL/kg ideal body weight, pressure support 10 cm H2O, PEEP 8 cm H2O, and FiO2 0.6. Of the following, the MOST appropriate next step is to",
    clinicalData: [
      { title: "Hematology and coagulation", columns: ["Test", "Result"], rows: [["Hemoglobin / hematocrit", "10 g/dL / 30%"], ["Platelet count", "200 x 10^3/uL"], ["White blood cells", "15,000/uL"], ["Neutrophils / lymphocytes / monocytes", "62% / 36% / 2%"], ["Prothrombin time / aPTT", "17 / 35 seconds"], ["Fibrinogen", "400 mg/dL"], ["D-dimer", "6 mcg/mL FEU"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.32"], ["PaCO2 / PaO2", "50 / 63 mm Hg"]] },
      { title: "Serum chemistry", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "138 / 3.8 / 100 mEq/L"], ["Total CO2", "26 mEq/L"], ["Urea nitrogen / creatinine", "20 mg/dL / 0.6 mg/dL"], ["Albumin", "3.8 g/dL"], ["C-reactive protein", "2 mg/dL"]] },
    ],
  },
  1215: {
    displayScenario: "A 17-year-old with obesity is admitted to the PICU in shock after 5 days of cough and myalgia. He reports headache, pleuritic chest pain, and increasing pain in his back and extremities. He is acutely ill with cold, mottled, clammy extremities and acrocyanosis. Chest radiography shows decreased lung volumes and a large cardiac silhouette. After broad-spectrum antibiotics and multiple normal saline boluses, he produces only a few milliliters of urine. Aggressive fluid resuscitation continues, but he develops worsening dyspnea and receives epinephrine. He is then intubated. Echocardiography shows an ejection fraction of 37%, diffuse ventricular hypokinesis, an underfilled left ventricle, and a moderate pericardial effusion. Twenty-four hours after admission he develops symptomatic bradycardia followed by asystole. Of the following, the diagnostic test MOST likely to reveal the cause of this patient's death is",
    clinicalData: [
      { title: "Initial hematology and coagulation", columns: ["Test", "Result"], rows: [["Hematocrit / hemoglobin", "46.5% / 16.2 g/dL"], ["White blood cells", "11,300/uL"], ["Neutrophils / bands", "71% / 5%"], ["Platelets", "57 x 10^3/uL"], ["Prothrombin time / partial thromboplastin time", "28.9 / 44.1 seconds"], ["D-dimer", "3.202 ng/mL"], ["Fibrinogen", "324 mg/dL"]] },
      { title: "Initial serum chemistry", columns: ["Test", "Result"], rows: [["Glucose", "208 mg/dL"], ["Calcium / phosphorus", "7.4 / 3.9 mg/dL"], ["Albumin", "1.9 g/dL"], ["Sodium / potassium / chloride", "124 / 3.7 / 95 mEq/L"], ["Total CO2", "8.4 mEq/L"], ["Lactate", "17.8 mmol/L"], ["Urea nitrogen / creatinine", "35 mg/dL / 2.6 mg/dL"], ["Creatine kinase", "21,956 U/L"], ["Troponin", "1.71 ng/mL"]] },
      { title: "Urinalysis", columns: ["Test", "Result"], rows: [["Appearance", "Yellow, turbid"], ["Glucose / protein", "+1 / +2"], ["Specific gravity", ">1.030"], ["pH", "5"], ["Red / white blood cells", ">5 / 20 per high-power field"]] },
      { title: "Blood gas after clinical deterioration", columns: ["Test", "Result"], rows: [["FiO2", "0.70"], ["pH", "7.12"], ["PaCO2 / PaO2", "49 / 59 mm Hg"], ["Bicarbonate", "15 mEq/L"], ["Oxygen saturation", "95%"]] },
    ],
  },
  1230: {
    displayScenario: "A previously healthy 4-month-old infant has recently returned from visiting family in rural Colombia. The day after returning, fever, fussiness, vomiting, sleepiness, and poor intake develop. He briefly improves, then presents with recurrent fever, lethargy, jaundice, and poor urine output. He is hypotensive and hypoxemic in room air. Of the following, the MOST likely diagnosis for this patient is",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cells", "3,400/uL"], ["Hemoglobin / hematocrit", "9.8 g/dL / 28%"], ["Platelets", "152 x 10^3/uL"], ["Sodium / potassium / chloride", "132 / 6 / 100 mEq/L"], ["Total CO2", "15 mEq/L"], ["Urea nitrogen / creatinine", "30 mg/dL / 0.8 mg/dL"], ["Glucose", "100 mg/dL"], ["AST / ALT", "3,163 / 1,545 U/L"], ["Total bilirubin", "5.5 mg/dL"], ["Prothrombin time / INR", "45 seconds / 3.7"]],
    }],
  },
  1256: {
    displayScenario: "A rapid response is called for a 17-year-old with new pleuritic chest pain, tachycardia, and tachypnea. He is hospitalized after radical orchiectomy for testicular cancer and began prophylactic enoxaparin 48 hours ago. He is diaphoretic with an intermittent S3 and a liver edge 3 cm below the right costal margin. Point-of-care cardiac ultrasonography is performed (Video). Of the following, the medication recommended for the MOST likely diagnosis is",
    clinicalData: [
      { title: "Serum chemistry and cardiac markers", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "135 / 4.2 / 90 mEq/L"], ["Total CO2", "22 mEq/L"], ["Urea nitrogen / creatinine", "20 mg/dL / 0.8 mg/dL"], ["Calcium / albumin", "9.0 mg/dL / 3.5 g/dL"], ["B-type natriuretic peptide", "120 pg/mL"], ["Troponin", "0.1 ng/mL"]] },
      { title: "Complete blood count", columns: ["Test", "Result"], rows: [["White blood cells", "8.0 x 10^3/uL"], ["Red blood cells", "5.0 x 10^6/uL"], ["Hemoglobin / hematocrit", "13 g/dL / 39%"], ["Platelets", "450,000/uL"]] },
      { title: "Coagulation", columns: ["Test", "Result"], rows: [["Prothrombin time / INR", "18 seconds / 1.3"], ["aPTT", "50 seconds"], ["Fibrinogen", "400 mg/dL"], ["D-dimer", "1 mcg/mL"]] },
    ],
  },
  1299: {
    displayScenario: "A previously healthy 16-year-old boy presents with lethargy and lightheadedness after a week of fatigue and poor appetite with increased thirst. His mother reports progressive skin darkening for 9 months. He is profoundly hypotensive, dehydrated, and has weak pulses. Despite 60 mL/kg of normal saline, he remains hypotensive. Of the following, the patient's shock will MOST likely improve after administration of:",
    clinicalData: [
      { title: "Serum chemistry", columns: ["Test", "Result"], rows: [["Sodium / potassium / chloride", "125 / 6.5 / 87 mEq/L"], ["Total CO2", "20 mEq/L"], ["Urea nitrogen / creatinine", "60 mg/dL / 1.94 mg/dL"], ["Glucose", "80 mg/dL"], ["Calcium / magnesium / phosphorus", "11 / 2 / 6 mg/dL"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.31"], ["PaCO2 / PaO2", "39 / 100 mm Hg"], ["Bicarbonate", "20 mEq/L"], ["Lactate", "3.4 mmol/L"], ["Ionized calcium", "1.37 mmol/L"]] },
    ],
  },
  1306: {
    displayScenario: "A 3-year-old boy is found with open imipramine and aripiprazole bottles nearby, with pill fragments in his mouth. In the PICU he has tachycardia, shallow respirations, fever, hot dry skin, waxing and waning mental status, rigidity, weak cough and gag reflexes, and minimal dark urine output. Electrocardiography shows sinus tachycardia with normal QRS interval and a QT interval of 0.56 seconds. After intubation, fluid resuscitation, and active cooling, the BEST treatment is:",
    clinicalData: [
      { title: "Initial blood tests", columns: ["Test", "Result"], rows: [["Lactate", "3.1 mmol/L"], ["Creatine phosphokinase", "730 U/L"], ["White blood cells", "15.2 x 10^3/uL"], ["Hemoglobin / hematocrit", "11 g/dL / 34%"], ["Sodium / potassium / chloride", "131 / 3.8 / 105 mEq/L"], ["Total CO2", "15 mEq/L"], ["Urea nitrogen / creatinine", "12 mg/dL / 0.8 mg/dL"], ["Glucose", "126 mg/dL"], ["AST / ALT / LDH", "64 / 93 / 650 U/L"]] },
      { title: "Arterial blood gas", columns: ["Test", "Result"], rows: [["pH", "7.36"], ["PaCO2 / PaO2", "42 / 146 mm Hg"], ["Bicarbonate", "21 mEq/L"], ["Base excess", "-3 mEq/L"]] },
      { title: "Urinalysis", columns: ["Test", "Result"], rows: [["Color", "Dark"], ["Blood / red blood cells", "Slight / positive"], ["Specific gravity", "1.018"], ["pH", "6.3"], ["Urine drug screen", "Positive for amphetamines"]] },
    ],
  },
  1359: {
    displayScenario: "A 3-week-old healthy term infant has colic-like agitation progressing to intermittent breath-holding spells. After an initial fluid bolus, the infant becomes apneic and cyanotic, is intubated, and is transferred to the PICU. Central access is obtained on the third attempt; the nurse then reports bleeding from peripheral and previous central line sites. The infant is hypothermic, tachycardic, hypotensive, minimally responsive, poorly perfused, and has minimal urine output. Of the following, the MOST consistent cause of this clinical deterioration is:",
    clinicalData: [
      { title: "Initial blood gas and tests", columns: ["Test", "Result"], rows: [["Venous pH / PCO2 / bicarbonate", "7.129 / 58 mm Hg / 19 mEq/L"], ["Venous base deficit", "10 mEq/L"], ["White blood cells", "18.1 x 10^3/uL"], ["Hemoglobin / hematocrit", "9.5 g/dL / 27.3%"], ["Platelets", "379 x 10^3/uL"], ["Bands", "10%"], ["Glucose", "228 mg/dL"]] },
      { title: "Subsequent tests", columns: ["Test", "Result"], rows: [["Arterial pH / PaCO2 / PaO2", "7.23 / 34 / 275 mm Hg"], ["Arterial bicarbonate / base deficit", "15 mEq/L / 9 mEq/L"], ["Hemoglobin / hematocrit", "5.9 g/dL / 17%"], ["Platelets", "346 x 10^3/uL"], ["PT / aPTT", ">130 / >320 seconds"], ["Urinalysis", "Red blood cells and protein; no ketones"]] },
    ],
  },
  1468: {
    displayScenario: "A 16-year-old boy is admitted to the PICU with severe epistaxis and hematemesis. He has no prior history of bleeding or medication exposure. He reports marijuana and synthetic cannabinoid use. He has gingival bleeding but is hemodynamically stable with normal neurologic, pulmonary, cardiovascular, and abdominal examinations. Of the following, the MOST appropriate treatment is:",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cells", "10.6 x 10^3/uL"], ["Hemoglobin / hematocrit", "9 g/dL / 28%"], ["Platelets", "130,000/uL"], ["Sodium / potassium / chloride", "137 / 3.6 / 105 mEq/L"], ["Total CO2", "21 mEq/L"], ["Urea nitrogen / creatinine", "5 mg/dL / 0.72 mg/dL"], ["Glucose", "94 mg/dL"], ["AST / ALT", "15 / 11 U/L"], ["Albumin / total bilirubin", "3.8 g/dL / 0.3 mg/dL"], ["Lactate", "1.8 mmol/L"], ["Urinalysis", "RBC positive; specific gravity 1.012; protein, ketones, and glucose negative"], ["Ethanol / salicylates / acetaminophen", "<10 mg/dL / undetectable / undetectable"]],
    }],
  },
  1472: {
    displayScenario: "An 8-year-old previously healthy boy is transferred to the PICU on the eighth day of a febrile illness. He has developed rash, lethargy, respiratory distress, hypoxemia, meningismus, splenomegaly, and peripheral edema. He is intermittently lucid but follows simple commands. Of the following, the historical information MOST likely to be present is that he:",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cells", "6,000/uL"], ["Hemoglobin / hematocrit", "11 g/dL / 33%"], ["Platelets", "56 x 10^3/uL"], ["Sodium / potassium / chloride", "128 / 4 / 101 mEq/L"], ["Urea nitrogen / creatinine", "36 mg/dL / 1.6 mg/dL"], ["AST / ALT", "120 / 110 U/L"], ["Total bilirubin", "0.2 mg/dL"]],
    }],
  },
  1484: {
    displayScenario: "A 17-year-old girl is found unresponsive with empty acetaminophen and oxycodone bottles nearby. After a normal saline bolus and naloxone, her mental status, respiratory rate, and blood pressure improve. Intravenous N-acetylcysteine is started. Sixty hours after ICU admission, she becomes confused and then somnolent. Of the following, the BEST next therapy is:",
    clinicalData: [
      { title: "At presentation", columns: ["Test", "Result"], rows: [["Arterial pH / PaCO2 / PaO2", "7.15 / 35 / 60 mm Hg"], ["Bicarbonate", "12 mEq/L"], ["Sodium / potassium / chloride", "140 / 4 / 100 mEq/L"], ["Urea nitrogen / creatinine", "18 mg/dL / 1 mg/dL"], ["Acetaminophen level", "400 mcg/mL"], ["Ammonia", "30 micromol/L"], ["AST / ALT", "100 / 60 U/L"], ["Unconjugated / conjugated bilirubin", "0.4 / 0.2 mg/dL"], ["Prothrombin time", "14 seconds"]] },
      { title: "Sixty hours after ICU admission", columns: ["Test", "Result"], rows: [["Acetaminophen level", "60 mcg/mL"], ["Ammonia", "180 micromol/L"], ["AST / ALT", "3,000 / 3,000 U/L"], ["Unconjugated / conjugated bilirubin", "2.4 / 1.2 mg/dL"], ["Prothrombin time", "18 seconds"]] },
    ],
  },
  1023: {
    clinicalData: [{
      title: "Venous blood gas and cardiac marker",
      columns: ["Test", "Result"],
      rows: [["pH", "7.28"], ["PvCO2", "32 mm Hg"], ["PvO2", "80 mm Hg"], ["HCO3", "17 mEq/L"], ["Lactate", "4.5 mmol/L"], ["High-sensitivity troponin", "8.5 ng/mL"]],
    }],
  },
  1029: {
    clinicalData: [{
      title: "Venous blood gas",
      columns: ["Test", "Result"],
      rows: [["pH", "7.28"], ["PCO2", "32 mm Hg"], ["Bicarbonate", "17 mmol/L"], ["Lactate", "5 mmol/L"]],
    }],
  },
  1064: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "33,400/µL (33.4 x 10^9/L)"], ["Hemoglobin", "0.91 g/dL (9.1 g/L)"], ["Platelets", "431 x 10^3/µL (431 x 10^9/L)"], ["Mean corpuscular volume", "74 µm3 (74 fL)"], ["Neutrophils", "74%"], ["Lymphocytes", "21%"], ["Monocytes", "5%"]],
    }],
  },
  1097: {
    clinicalData: [{
      title: "Renal function",
      columns: ["Test", "Result"],
      rows: [["Serum creatinine", "1.2 mg/dL (106.1 µmol/L)"], ["Blood urea nitrogen", "15 mg/dL (5.4 mmol/L)"]],
    }],
  },
  1172: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["Blood urea nitrogen", "88 mg/dL (31.4 mmol/L)"], ["Creatinine", "5 mg/dL (381 µmol/L)"], ["Potassium", "10.1 mEq/L (10.1 mmol/L)"], ["Bicarbonate", "18 mEq/L (18 mmol/L)"]],
    }],
  },
  1243: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["Hemoglobin", "7.2 mg/dL"], ["Aspartate aminotransferase", "1,768 U/L"], ["Alanine aminotransferase", "2,245 U/L"], ["Conjugated bilirubin", "14 mg/dL (239.46 µmol/L)"], ["Creatinine", "2.1 mg/dL (185.64 µmol/L)"], ["Albumin", "1.8 g/dL (18.0 g/L)"]],
    }],
  },
  1244: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["White blood cells", "19,800/µL (19.8 x 10^9/L)"], ["Hemoglobin", "9.6 g/dL (75 g/L)"], ["Hematocrit", "30%"], ["Platelets", "256 x 10^3/µL (256 x 10^9/L)"], ["Hemoglobin S", "40.0%"]],
    }],
  },
  1245: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "7,500/µL (7.5 x 10^9/L)"], ["Ferritin", "2,000 ng/mL (2,000 µg/L)"], ["Brain-type natriuretic peptide", "90.0 pg/mL (90 ng/L)"]],
    }],
  },
  1305: {
    clinicalData: [{
      title: "Arterial blood gas",
      columns: ["Test", "Result"],
      rows: [["PaO2", "120 mm Hg"], ["PaCO2", "35 mm Hg"]],
    }],
  },
  1326: {
    clinicalData: [{
      title: "Serum potassium during resuscitation",
      columns: ["Time", "Potassium"],
      rows: [["During resuscitation", "8.5 mEq/L (8.5 mmol/L)"], ["After return of spontaneous circulation", "5.4 mEq/L (5.4 mmol/L)"]],
    }],
  },
  1356: {
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["BUN", "30.6 mg/dL"], ["Creatinine", "1.28 mg/dL"], ["Direct Coombs", "Positive"], ["Hemoglobin", "4.4 g/dL"], ["Lactic acid", "1.8 mmol/L"], ["Reticulocyte count", "14.6%"]],
    }],
  },
  1439: {
    clinicalData: [{
      title: "Laboratory test results",
      columns: ["Test", "Result"],
      rows: [["Serum sodium", "118 mEq/L (118 mmol/L)"], ["Potassium", "3.8 mEq/L (3.8 mmol/L)"], ["Chloride", "96 mEq/L (96 mmol/L)"], ["Bicarbonate", "27 mEq/L (27 mmol/L)"], ["BUN", "31 mg/dL (11 mmol/L)"], ["Creatinine", "0.4 mg/dL (35.3 µmol/L)"], ["Glucose", "112 mg/dL (6.2 mmol/L)"], ["Serum osmolality", "253 mOsm/kg (253 mmol/kg)"]],
    }],
  },
  1455: {
    clinicalData: [{
      title: "Arterial blood gas",
      columns: ["Test", "Result"],
      rows: [["pH", "7.28"], ["PCO2", "40 mm Hg"], ["PaO2", "62 mm Hg"]],
    }],
  },
  3127: {
    choices: {
      A: "Increase FiO2 to 100% and hand ventilate.",
      B: "Administer 2 mcg/kg fentanyl bolus.",
      C: "5 mL/kg 5% albumin bolus.",
      D: "Amiodarone 5 mg/kg bolus.",
      E: "Preparation for cardioversion.",
      F: "A and B.",
    },
    correctAnswer: "F",
    correctAnswerText: "A and B.",
  },
  3338: {
    correctAnswer: "B",
    correctAnswerText: "False",
  },
  3509: {
    displayScenario: "Forty-two hours after severe traumatic brain injury with an initial Glasgow Coma Scale score of 4, a 3-year-old remains intubated and ventilated. A previous epidural hemorrhage was evacuated, and neurosurgery performed a decompressive craniotomy for increased intracranial pressure. Oxygen saturation is 98%, PaCO2 is 38 mm Hg, blood pressure is 104/68 mm Hg, and intracranial pressure is 32 mm Hg. Over 4 hours, urine output increases to 11 mL/kg/h and serum sodium rises from 152 to 162 mEq/L. The mother asks what this means. It is most appropriate to reply that:",
    choices: {
      A: "These are good signs, because we want the sodium to increase in order to increase serum osmolality to help with cerebral edema.",
      B: "These are ominous signs, because diabetes insipidus in the setting of severe traumatic brain injury carries a mortality rate of over 75%.",
      C: "These are signs of diabetes insipidus, which we frequently see in traumatic brain injury, and this has no influence on mortality.",
      D: "The increased urine output will most likely help decrease the overall cerebral edema.",
      E: "These are signs of diabetes insipidus, which can be expected to occur in the setting of a decompressive craniectomy.",
    },
    correctAnswer: "B",
    correctAnswerText: "These are ominous signs, because diabetes insipidus in the setting of severe traumatic brain injury carries a mortality rate of over 75%.",
  },
  3522: {
    displayScenario: "A 4-year-old boy is admitted to the PICU after being backed over by a car. Tire tracks are visible on the anterior abdominal wall. Initial blood pressure is normal, and computed tomography demonstrates a grade 4 splenic injury. Which radiographic description best matches this injury?",
    choices: {
      A: "Laceration involving segmental or hilar vessels, associated with more than 25% splenic devascularization.",
      B: "Nonexpanding subcapsular hematoma involving 10% to 50% of surface area.",
      C: "Laceration of more than 3 cm parenchymal depth involving trabecular vessels.",
      D: "Subcapsular hematoma involving more than 50% of surface area.",
      E: "Complete devascularization of the spleen.",
    },
    correctAnswer: "A",
    correctAnswerText: "Laceration involving segmental or hilar vessels, associated with more than 25% splenic devascularization.",
  },
  3636: {
    displayScenario: "A 3-month-old infant hospitalized with croup is emergently intubated for acute respiratory failure. The ventilator alarms for low volumes and high pressures. Chest rise is poor and breath sounds are symmetric but diminished. Chest radiography confirms that the endotracheal tube is in good position, with no hyperinflation or pneumothorax. An arterial blood gas shows respiratory acidosis (pH 7.16, PaCO2 75 mm Hg) and PaO2 220 mm Hg while receiving FiO2 0.50. When removed from the ventilator for bag ventilation, high pressures are needed to move the chest. The best course of action is to:",
    choices: {
      A: "Increase the ventilator respiratory rate to compensate for respiratory acidosis.",
      B: "Switch the ventilator to pressure-control mode to overcome airway resistance.",
      C: "Attempt to clear the endotracheal tube with suctioning and consider reintubation if there is no improvement.",
      D: "Administer an albuterol aerosol to relieve severe airway bronchoconstriction.",
      E: "Administer hypertonic saline aerosol to relieve small-airway obstruction.",
    },
    correctAnswer: "C",
    correctAnswerText: "Attempt to clear the endotracheal tube with suctioning and consider reintubation if there is no improvement.",
  },
};
