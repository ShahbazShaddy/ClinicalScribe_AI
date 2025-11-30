import type { Note } from '@/App';

export function generateSampleNote(noteType: Note['noteType'], chiefComplaint?: string): Note['content'] {
  const complaints = chiefComplaint || 'persistent lower back pain';
  
  if (noteType === 'SOAP') {
    return {
      subjective: `Patient is a 45-year-old presenting with chief complaint of ${complaints} for 3 weeks. Pain is described as dull, aching, 6/10 severity, worse with prolonged sitting. No radiation to legs. No numbness or tingling. Denies recent trauma. OTC ibuprofen provides minimal relief.

Patient reports pain is interfering with daily activities and sleep quality. No previous history of similar episodes. Denies fever, weight loss, or bowel/bladder dysfunction.`,

      objective: `Vital Signs: BP 128/82, HR 76, T 98.4°F, RR 16, SpO2 98% on room air
Weight: 185 lbs, Height: 5'10"

General: Alert and oriented x3, no acute distress, cooperative
HEENT: Normocephalic, atraumatic
Cardiovascular: Regular rate and rhythm, no murmurs
Respiratory: Clear to auscultation bilaterally
Musculoskeletal: Tenderness to palpation over L4-L5. Full range of motion with pain at extremes. Negative straight leg raise bilaterally. Normal gait. No paraspinal muscle spasm noted. Strength 5/5 in lower extremities bilaterally.
Neurological: Sensation intact, reflexes 2+ and symmetric`,

      assessment: `1. Acute mechanical low back pain (M54.5)
   - Most likely muscular strain
   - No red flag symptoms present
   - Pain localized without neurological compromise

2. Muscle spasm, lower back region`,

      plan: `1. Medications:
   - Cyclobenzaprine 5mg PO TID x 7 days for muscle spasm
   - Continue ibuprofen 600mg PO TID with food (max 2400mg/day)
   - May add acetaminophen 500mg PO Q6H PRN for additional pain relief

2. Non-pharmacological interventions:
   - Physical therapy referral - 6 sessions approved
   - Heat therapy 20 minutes TID
   - Ice therapy for acute pain episodes
   - Gentle stretching exercises demonstrated

3. Activity modification:
   - Avoid heavy lifting >10 lbs
   - Maintain proper posture
   - Short walks encouraged (10-15 minutes BID)

4. Patient education:
   - Proper lifting mechanics reviewed
   - Ergonomic workstation setup discussed
   - Warning signs for immediate return visit explained

5. Follow-up:
   - Return in 2 weeks if no improvement
   - Return sooner if symptoms worsen or new neurological symptoms develop
   - Physical therapy to begin this week

6. Work status: May continue work with lifting restrictions`,

      icd10: `M54.5 - Low back pain
M62.838 - Other muscle spasm`,

      cpt: `99213 - Office or other outpatient visit, established patient, level 3 (20-29 minutes)
97110 - Therapeutic exercises (if performed)`
    };
  }

  // Add other note types if needed
  return {
    subjective: `Patient presenting with ${complaints}. Detailed history obtained.`,
    objective: 'Physical examination completed. Vital signs stable.',
    assessment: 'Clinical impression documented.',
    plan: 'Treatment plan discussed and agreed upon.',
    icd10: 'Appropriate ICD-10 codes',
    cpt: 'Appropriate CPT codes'
  };
}
