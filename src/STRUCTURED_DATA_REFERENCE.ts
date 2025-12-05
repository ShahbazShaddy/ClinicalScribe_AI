/**
 * STRUCTURED DATA SYSTEM - QUICK REFERENCE
 * 
 * New files created:
 * - src/types/structuredData.ts - Type definitions for vitals, clinical info, symptoms
 * - src/components/StructuredDataPanel.tsx - React component for displaying structured data
 * - src/lib/sampleNotesWithStructuredData.ts - Sample notes with pre-populated structured data
 * 
 * Files modified:
 * - src/services/textGeneration.ts - Added extractStructuredData() function
 * - src/pages/NotePage.tsx - Added structured data panel on right side
 * - src/App.tsx - Added structuredData field to Note interface
 * 
 * FEATURES IMPLEMENTED:
 * 
 * 1. STRUCTURED DATA PANEL (Right sidebar on NotePage)
 *    - Sticky positioning on desktop
 *    - Displays vitals with color-coded status indicators
 *    - Shows clinical information (diagnoses, medications, allergies, lab values)
 *    - Lists symptoms with severity badges
 *    - Edit mode for manual corrections
 * 
 * 2. VITALS WITH VISUAL INDICATORS:
 *    - Blood Pressure: Normal (<120/80), Elevated (120-129/<80), High (≥130/80), Critical (≥180/120)
 *    - Heart Rate: Normal (60-100), Low (<60), High (>100)
 *    - Temperature: Normal (98.6°F), Fever (100.4-103.9°F), High Fever (≥104°F)
 *    - Weight: Tracks previous value and calculates change with trend arrow
 *    - O2 Saturation: Normal (≥95%), Low (90-94%), Critical (<90%)
 *    - Respiratory Rate: Normal (12-20), Low (<12), High (>20)
 *    
 *    Color coding:
 *    - Green: Normal
 *    - Yellow: Elevated (mild concern)
 *    - Orange: High/Low (moderate concern)
 *    - Red: Critical (urgent attention)
 * 
 * 3. CLINICAL INFORMATION DISPLAY:
 *    - Chief Complaint (text)
 *    - Diagnoses (badge chips)
 *    - Medications with dosage and frequency
 *    - Lab Values with reference ranges and status
 *    - Allergies (red badges for visibility)
 * 
 * 4. SYMPTOMS DISPLAY:
 *    - Symptom name
 *    - Severity level (mild, moderate, severe)
 *    - Duration information
 *    - Bullet point format
 * 
 * 5. AUTOMATIC EXTRACTION:
 *    The extractStructuredData() function in textGeneration.ts:
 *    - Parses note content for vitals
 *    - Extracts diagnoses and clinical data
 *    - Identifies medications with dosages
 *    - Extracts lab values and normal ranges
 *    - Lists reported symptoms with severity
 * 
 * 6. SAMPLE NOTES WITH REALISTIC DATA:
 *    
 *    a) HTN Follow-up (Robert Johnson, 58y)
 *       - BP: 156/94 (CRITICAL - red)
 *       - Weight: 190 lbs (+3 from last visit - red up arrow)
 *       - Diagnoses: Hypertension, Type 2 Diabetes
 *       - Medications: Lisinopril 20mg, Amlodipine 5mg, Metformin 1000mg BID
 *       - Symptoms: Mild headaches
 * 
 *    b) Diabetic Review (Maria Garcia, 62y)
 *       - BP: 132/82 (Elevated - yellow)
 *       - Weight: 162 lbs (Stable - green)
 *       - HbA1c: 6.8% (Normal - green)
 *       - Diagnoses: Type 2 Diabetes, Hypertension, Hyperlipidemia
 *       - Medications: Metformin 1000mg BID, Sitagliptin 100mg, Lisinopril, Atorvastatin
 *       - Symptoms: Well-controlled, no hypoglycemia
 * 
 *    c) Acute Illness (James Wilson, 35y)
 *       - Temp: 100.9°F (Fever - orange)
 *       - SpO2: 96% (Normal - green)
 *       - Diagnoses: Viral URI, Acute Bronchitis
 *       - Medications: Acetaminophen, Ibuprofen, DXM
 *       - Symptoms: Cough (moderate), Fever (moderate), Body aches (moderate)
 * 
 * USAGE:
 * 
 * 1. To display structured data in NotePage:
 *    - Already integrated! Just view any note with structuredData
 *    
 * 2. To extract structured data from new notes:
 *    const data = await extractStructuredData(noteContent);
 *    
 * 3. To use sample notes:
 *    import { allSampleNotes } from '@/lib/sampleNotesWithStructuredData';
 *    
 * 4. To edit structured data:
 *    - Click "Edit" button on StructuredDataPanel
 *    - Modify values
 *    - Click "Save"
 * 
 * STYLING:
 * - Uses Tailwind CSS classes for responsive design
 * - Color-coded backgrounds for vital status
 * - Badge components for quick visual scanning
 * - Trending indicators (TrendingUp/TrendingDown icons) for weight changes
 * - Sticky positioning for vital signs panel on desktop
 * 
 * FUTURE ENHANCEMENTS:
 * - Auto-extraction on note creation
 * - Trend comparison with previous visits (previousVisitData field)
 * - Export structured data to PDF
 * - Confidence scores for extraction accuracy
 * - Manual override of extracted values
 * - Alerts for critical values
 */

export default {};
