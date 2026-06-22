export interface SeedEntry {
  title: string;
  category: string;
  content: string;
}

// Admin-curated general healthcare knowledge. This is informational
// reference content only — written to support patient understanding,
// not to diagnose or prescribe. Each entry is chunked and embedded
// by the seed script so it can be retrieved alongside a user's own
// report data in the RAG pipeline.
export const globalMedicalSeedData: SeedEntry[] = [
  {
    title: 'Understanding Cholesterol',
    category: 'cholesterol',
    content: `Cholesterol is a waxy, fat-like substance found in every cell of the body, used to build cell membranes and produce hormones. A standard lipid panel reports several values: Total Cholesterol, LDL (low-density lipoprotein), HDL (high-density lipoprotein), and Triglycerides.

LDL is often called "bad cholesterol" because high levels can lead to plaque buildup in arteries, increasing risk of heart disease. A desirable LDL level is generally below 100 mg/dL, with levels above 160 mg/dL considered high.

HDL is called "good cholesterol" because it helps remove other forms of cholesterol from the bloodstream. Higher HDL levels (above 60 mg/dL) are protective, while levels below 40 mg/dL are considered a risk factor.

Total Cholesterol below 200 mg/dL is considered desirable, 200-239 mg/dL is borderline high, and 240 mg/dL and above is high.

Triglycerides are another type of fat in the blood. Normal levels are below 150 mg/dL. Levels between 150-199 mg/dL are borderline high, 200-499 mg/dL is high, and 500+ mg/dL is very high.

Lifestyle factors that influence cholesterol include diet (saturated and trans fats), physical activity, body weight, smoking, and genetics. Regular exercise, a diet rich in fiber and unsaturated fats, and avoiding tobacco can help maintain healthy levels.`,
  },
  {
    title: 'Understanding Diabetes and Blood Sugar',
    category: 'diabetes',
    content: `Diabetes is a condition affecting how the body processes blood glucose (sugar). The two main types are Type 1, where the body produces little or no insulin, and Type 2, where the body becomes resistant to insulin or doesn't produce enough.

Common tests include Fasting Blood Glucose, where a normal result is 70-99 mg/dL, prediabetes is 100-125 mg/dL, and diabetes is diagnosed at 126 mg/dL or higher on two separate tests.

HbA1c (Hemoglobin A1c) measures average blood sugar over the past 2-3 months. A normal HbA1c is below 5.7%, prediabetes is 5.7%-6.4%, and diabetes is 6.5% or higher.

Random Blood Glucose of 200 mg/dL or higher, along with symptoms like increased thirst and frequent urination, may indicate diabetes.

Postprandial (after-meal) glucose is typically checked 2 hours after eating; a normal result is below 140 mg/dL.

Managing blood sugar involves balanced nutrition, regular physical activity, weight management, and for some, medication or insulin therapy as prescribed by a doctor. Symptoms of high blood sugar (hyperglycemia) include excessive thirst, frequent urination, and fatigue. Symptoms of low blood sugar (hypoglycemia) include shakiness, sweating, confusion, and rapid heartbeat.`,
  },
  {
    title: 'Understanding Blood Pressure',
    category: 'blood_pressure',
    content: `Blood pressure measures the force of blood against artery walls, recorded as two numbers: systolic (pressure when the heart beats) over diastolic (pressure when the heart rests between beats).

Normal blood pressure is below 120/80 mmHg. Elevated blood pressure is systolic 120-129 with diastolic below 80. Stage 1 Hypertension is systolic 130-139 or diastolic 80-89. Stage 2 Hypertension is systolic 140 or higher, or diastolic 90 or higher. A Hypertensive Crisis is systolic over 180 and/or diastolic over 120, which requires immediate medical attention.

Low blood pressure (Hypotension) is generally considered below 90/60 mmHg, though some people naturally run lower without symptoms.

Factors affecting blood pressure include diet (especially sodium intake), physical activity, stress, weight, alcohol consumption, and genetics. The DASH diet (Dietary Approaches to Stop Hypertension), regular aerobic exercise, limiting sodium and alcohol, and stress management are commonly recommended lifestyle approaches.

Blood pressure should ideally be measured after resting for 5 minutes, seated with feet flat on the floor, and the arm supported at heart level.`,
  },
  {
    title: 'Common Vitamin Deficiencies',
    category: 'vitamins',
    content: `Vitamin D deficiency is common and is measured via 25-hydroxyvitamin D blood test. Levels below 20 ng/mL indicate deficiency, 20-29 ng/mL is considered insufficient, and 30-100 ng/mL is sufficient. Symptoms can include fatigue, bone pain, and muscle weakness. Sources include sunlight exposure, fatty fish, fortified foods, and supplements.

Vitamin B12 deficiency is measured via serum B12 levels. Normal range is typically 200-900 pg/mL, though levels below 200 pg/mL suggest deficiency. Symptoms include fatigue, weakness, numbness or tingling in hands and feet, and difficulty concentrating. It's found in animal products, so vegetarians and vegans are at higher risk and may need supplementation.

Iron deficiency is assessed through serum ferritin and hemoglobin levels. Normal ferritin ranges vary but are generally 20-250 ng/mL for men and 10-120 ng/mL for women; low ferritin indicates depleted iron stores. Iron deficiency anemia causes fatigue, pale skin, shortness of breath, and brittle nails.

Folate (Vitamin B9) deficiency is linked to anemia and, in pregnancy, neural tube defects. Normal serum folate is generally above 3 ng/mL.

Calcium levels are typically 8.5-10.5 mg/dL in blood; deficiency can affect bone health over time and is influenced by Vitamin D status, since Vitamin D helps the body absorb calcium.`,
  },
  {
    title: 'Common Medications: General Information',
    category: 'medications',
    content: `This is general educational information about common medication categories. It is not a substitute for guidance from a pharmacist or physician, and specific dosing always depends on individual medical history.

Statins (e.g., atorvastatin, rosuvastatin) are commonly prescribed to lower LDL cholesterol by reducing cholesterol production in the liver. They are usually taken once daily, often in the evening.

Metformin is a first-line medication for Type 2 diabetes that helps lower blood sugar by reducing glucose production in the liver and improving insulin sensitivity. It's typically taken with meals to reduce gastrointestinal side effects.

ACE inhibitors (e.g., lisinopril, enalapril) and ARBs (e.g., losartan) are common blood pressure medications that relax blood vessels. Common side effects of ACE inhibitors can include a dry cough.

Antibiotics treat bacterial infections and should always be taken for the full prescribed course, even if symptoms improve early, to prevent antibiotic resistance.

Always disclose all current medications and supplements to healthcare providers, as drug interactions can affect both safety and effectiveness. Never stop or change a prescribed medication without consulting the prescribing doctor.`,
  },
  {
    title: 'General Healthcare FAQs',
    category: 'general_faq',
    content: `How often should I get a routine blood test? For generally healthy adults, an annual checkup with basic blood work (lipid panel, glucose, complete blood count) is commonly recommended, though frequency can vary based on age, risk factors, and existing conditions.

What does a Complete Blood Count (CBC) check? A CBC measures red blood cells, white blood cells, platelets, hemoglobin, and hematocrit. It can help detect anemia, infection, and various blood disorders. Normal hemoglobin is roughly 13.5-17.5 g/dL for men and 12.0-15.5 g/dL for women.

What is a normal resting heart rate? For most healthy adults, a normal resting heart rate is 60-100 beats per minute, with well-conditioned athletes sometimes having lower rates.

What does BMI (Body Mass Index) indicate? BMI is a screening tool calculated from height and weight. Under 18.5 is underweight, 18.5-24.9 is normal weight, 25-29.9 is overweight, and 30+ is considered obese. BMI doesn't account for muscle mass, so it's one data point among several for assessing health.

When should I see a doctor about a lab result? Any result flagged as significantly abnormal, especially if accompanied by symptoms, should be discussed with a healthcare provider promptly. Mildly abnormal isolated results are often worth monitoring with a follow-up test before drawing conclusions, since lab values can fluctuate.

What is the difference between urgent care and an emergency room? Urgent care is appropriate for non-life-threatening issues needing prompt attention, like minor infections or sprains. Emergency rooms are for serious or life-threatening conditions like chest pain, severe bleeding, difficulty breathing, or signs of stroke.`,
  },
];
