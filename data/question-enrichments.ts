import { Question } from "@/types/question";

type QuestionEnrichment = Partial<Pick<Question, "displayScenario" | "clinicalData" | "choices" | "correctAnswer" | "correctAnswerText" | "images">>;

// These tables reproduce values already present in the source question stems.
// They keep dense clinical data readable without changing the question content.
export const questionEnrichments: Record<number, QuestionEnrichment> = {
  // Verified against the original Zimmerman and PICU MCQ Review PDFs. These figures
  // belong to the preceding item on the source page, not to the question below it.
  2260: { images: [] },
  2411: { images: [] },
  2540: { images: [] },
  3412: { images: [] },
  3413: { images: ["/PICUMCQBANK/images/picumcq/picumcq-pg20-img1.jpeg"] },
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
  1098: {
    displayScenario: "This item refers to a figure or video in the original PDF. A 15-year-old boy recently returned from the Ivory Coast after a church mission trip. He has a 1-week history of periodic fever, lethargy, malaise, and worsening headaches. On admission he develops seizure activity and remains unresponsive. Brain computed tomography shows no obvious intracranial masses or areas of contrast enhancement. Microscopic evaluation of a thin blood smear is shown in the Figure. Of the following, the medications and routes for initial treatment of this disease SHOULD include",
    clinicalData: [{
      title: "Laboratory data",
      columns: ["Test", "Result"],
      rows: [["White blood cell count", "19,200/uL"], ["Hemoglobin / hematocrit", "5.1 g/dL / 18%"], ["Platelet count", "200 x 10^3/uL"], ["Sodium / potassium / chloride", "131 / 3.8 / 105 mEq/L"], ["Total CO2", "11 mEq/L"], ["Urea nitrogen / creatinine", "32 mg/dL / 2.8 mg/dL"], ["Glucose", "46 mg/dL"], ["Lactate", "7.0 mmol/L"]],
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
  1129: {
    displayScenario: "A 12-year-old boy is admitted to the PICU late in the evening for fever and weight loss over several weeks. The hematology-oncology service recommends 1.5 times maintenance fluids and rasburicase for elevated uric acid, and requests that he be nil per os for a bone marrow aspirate and biopsy in the morning. Six hours later he develops respiratory distress; his lungs are clear and chest radiography is without significant pathology. An arterial blood gas obtained by co-oximetry is summarized below. Of the following, the MOST important immediate treatment for this patient is",
    clinicalData: [
      { title: "Initial laboratory data", columns: ["Test", "Result"], rows: [["White blood cell count", "250,000/uL"], ["Hemoglobin / hematocrit", "10 g/dL / 40%"], ["Sodium / potassium / chloride", "140 / 4.1 / 95 mEq/L"], ["Bicarbonate", "20 mEq/L"], ["Urea nitrogen / creatinine", "19 mg/dL / 1.2 mg/dL"], ["Uric acid", "12.3 mg/dL"]] },
      { title: "Arterial blood gas during respiratory distress", columns: ["Test", "Result"], rows: [["pH", "7.30"], ["PaCO2 / PaO2", "30 / 95 mm Hg"], ["Oxygen saturation", "95%"], ["Lactate", "8 mmol/L"]] },
    ],
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
