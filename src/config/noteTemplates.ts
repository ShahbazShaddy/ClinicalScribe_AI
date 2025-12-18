/**
 * Note Template Configuration
 * Defines the structure and sections for different note types
 */

export interface NoteTemplate {
  type: 'SOAP' | 'Progress' | 'Consultation' | 'H&P';
  sections: NoteSection[];
  description: string;
  systemPrompt: string;
}

export interface NoteSection {
  key: string;
  label: string;
  description: string;
  placeholder: string;
}

export const NOTE_TEMPLATES: Record<string, NoteTemplate> = {
  SOAP: {
    type: 'SOAP',
    description: 'Standard SOAP note format',
    sections: [
      {
        key: 'subjective',
        label: 'Subjective',
        description: "Patient's reported symptoms, history, and concerns",
        placeholder: 'What the patient tells you about their condition...',
      },
      {
        key: 'objective',
        label: 'Objective',
        description: 'Clinical findings, vital signs, physical exam results, test results',
        placeholder: 'Vital signs, physical examination findings, lab results...',
      },
      {
        key: 'assessment',
        label: 'Assessment',
        description: 'Clinical impression, diagnosis, differential diagnoses',
        placeholder: 'Clinical impression and diagnoses...',
      },
      {
        key: 'plan',
        label: 'Plan',
        description: 'Treatment plan, medications, follow-up instructions, referrals',
        placeholder: 'Treatment recommendations and follow-up plan...',
      },
      {
        key: 'icd10',
        label: 'ICD-10 Codes',
        description: 'Relevant diagnosis codes for billing',
        placeholder: 'Code - Description (one per line)',
      },
      {
        key: 'cpt',
        label: 'CPT Codes',
        description: 'Relevant procedure codes for billing',
        placeholder: 'Code - Description (one per line)',
      },
    ],
    systemPrompt: `You are a clinical documentation specialist. Generate a structured SOAP note from the transcribed patient conversation.

IMPORTANT: You MUST return a JSON object with ALL these exact keys (do not skip any):
{
  "subjective": "Patient's reported symptoms, history, and concerns",
  "objective": "Clinical findings, vital signs, physical exam findings, test results",
  "assessment": "Clinical impression, diagnosis, differential diagnoses",
  "plan": "Treatment plan, medications, follow-up instructions, referrals",
  "icd10": "ICD-10 diagnosis codes (format: 'Code - Description' on separate lines)",
  "cpt": "CPT procedure codes (format: 'Code - Description' on separate lines)"
}

Guidelines:
- Be thorough and professional
- If information is not available for a section, write "Not documented"
- Return ONLY valid JSON, no additional text, markdown, or code blocks
- Ensure all string values are properly escaped for JSON`,
  },

  Progress: {
    type: 'Progress',
    description: 'Progress/Update note format',
    sections: [
      {
        key: 'interval_history',
        label: 'Interval History',
        description: 'Events and changes since last visit',
        placeholder: 'What has changed since the last appointment...',
      },
      {
        key: 'current_status',
        label: 'Current Status',
        description: 'Current symptoms, vital signs, and clinical findings',
        placeholder: 'Current clinical status and findings...',
      },
      {
        key: 'response_to_treatment',
        label: 'Response to Treatment',
        description: 'How patient is responding to ongoing treatment',
        placeholder: 'Treatment efficacy and patient response...',
      },
      {
        key: 'assessment_update',
        label: 'Assessment Update',
        description: 'Updated clinical impression',
        placeholder: 'Updated assessment and diagnosis...',
      },
      {
        key: 'plan_modification',
        label: 'Plan Modification',
        description: 'Changes to treatment plan',
        placeholder: 'Any changes to medications, dosages, or follow-up...',
      },
      {
        key: 'icd10',
        label: 'ICD-10 Codes',
        description: 'Updated diagnosis codes',
        placeholder: 'Code - Description (one per line)',
      },
      {
        key: 'cpt',
        label: 'CPT Codes',
        description: 'Procedure codes for this visit',
        placeholder: 'Code - Description (one per line)',
      },
    ],
    systemPrompt: `You are a clinical documentation specialist. Generate a structured Progress note from the transcribed patient conversation.

IMPORTANT: You MUST return a JSON object with ALL these exact keys (do not skip any):
{
  "interval_history": "Events and changes since last visit",
  "current_status": "Current symptoms, vital signs, and clinical findings",
  "response_to_treatment": "How patient is responding to ongoing treatment",
  "assessment_update": "Updated clinical impression",
  "plan_modification": "Changes to the treatment plan",
  "icd10": "ICD-10 diagnosis codes (format: 'Code - Description' on separate lines)",
  "cpt": "CPT procedure codes (format: 'Code - Description' on separate lines)"
}

Guidelines:
- Be concise and focus on changes from previous visits
- If information is not available for a section, write "Not documented"
- Return ONLY valid JSON, no additional text, markdown, or code blocks
- Ensure all string values are properly escaped for JSON`,
  },

  Consultation: {
    type: 'Consultation',
    description: 'Consultation note format',
    sections: [
      {
        key: 'reason_for_consultation',
        label: 'Reason for Consultation',
        description: 'Why the patient was referred',
        placeholder: 'Chief complaint and reason for this consultation...',
      },
      {
        key: 'history_of_present_illness',
        label: 'History of Present Illness',
        description: 'Detailed history related to the consultation request',
        placeholder: 'Detailed history related to the consultation...',
      },
      {
        key: 'relevant_past_history',
        label: 'Relevant Past History',
        description: 'Relevant medical history for this consultation',
        placeholder: 'Past medical history relevant to consultation...',
      },
      {
        key: 'physical_examination',
        label: 'Physical Examination',
        description: 'Focused physical examination findings',
        placeholder: 'Physical examination findings...',
      },
      {
        key: 'findings_and_impression',
        label: 'Findings and Impression',
        description: 'Consultation findings and clinical impression',
        placeholder: 'Consultant impression and findings...',
      },
      {
        key: 'recommendations',
        label: 'Recommendations',
        description: 'Recommendations for ongoing care',
        placeholder: 'Treatment recommendations and follow-up plan...',
      },
      {
        key: 'icd10',
        label: 'ICD-10 Codes',
        description: 'Relevant diagnosis codes',
        placeholder: 'Code - Description (one per line)',
      },
      {
        key: 'cpt',
        label: 'CPT Codes',
        description: 'Consultation and procedure codes',
        placeholder: 'Code - Description (one per line)',
      },
    ],
    systemPrompt: `You are a clinical documentation specialist. Generate a structured Consultation note from the transcribed patient conversation.

IMPORTANT: You MUST return a JSON object with ALL these exact keys (do not skip any):
{
  "reason_for_consultation": "Why the patient was referred",
  "history_of_present_illness": "Detailed history related to the consultation",
  "relevant_past_history": "Relevant medical and family history",
  "physical_examination": "Focused physical examination findings",
  "findings_and_impression": "Consultant findings and clinical impression",
  "recommendations": "Treatment recommendations and follow-up plan",
  "icd10": "ICD-10 diagnosis codes (format: 'Code - Description' on separate lines)",
  "cpt": "CPT consultation codes (format: 'Code - Description' on separate lines)"
}

Guidelines:
- Be thorough and provide clear recommendations
- If information is not available for a section, write "Not documented"
- Return ONLY valid JSON, no additional text, markdown, or code blocks
- Ensure all string values are properly escaped for JSON`,
  },

  'H&P': {
    type: 'H&P',
    description: 'History and Physical Examination format',
    sections: [
      {
        key: 'chief_complaint',
        label: 'Chief Complaint',
        description: 'Primary reason for the visit',
        placeholder: 'Chief complaint in patient\'s own words...',
      },
      {
        key: 'history_of_present_illness',
        label: 'History of Present Illness',
        description: 'Detailed story of current illness',
        placeholder: 'Chronological development of current symptoms...',
      },
      {
        key: 'past_medical_history',
        label: 'Past Medical History',
        description: 'Significant past medical conditions',
        placeholder: 'Previous diagnoses, surgeries, hospitalizations...',
      },
      {
        key: 'medications_and_allergies',
        label: 'Medications & Allergies',
        description: 'Current medications and known allergies',
        placeholder: 'Medications, dosages, and documented allergies...',
      },
      {
        key: 'family_history',
        label: 'Family History',
        description: 'Relevant family medical history',
        placeholder: 'Significant family medical history...',
      },
      {
        key: 'social_history',
        label: 'Social History',
        description: 'Lifestyle, occupational, and social factors',
        placeholder: 'Occupation, tobacco/alcohol use, living situation...',
      },
      {
        key: 'review_of_systems',
        label: 'Review of Systems',
        description: 'Systematic review of body systems',
        placeholder: 'Symptoms by organ system...',
      },
      {
        key: 'physical_examination',
        label: 'Physical Examination',
        description: 'Comprehensive physical exam findings',
        placeholder: 'Vital signs, general appearance, and organ systems...',
      },
      {
        key: 'assessment',
        label: 'Assessment',
        description: 'Clinical assessment and diagnoses',
        placeholder: 'Clinical impression and diagnoses...',
      },
      {
        key: 'plan',
        label: 'Plan',
        description: 'Initial treatment and management plan',
        placeholder: 'Initial treatment plan and follow-up...',
      },
      {
        key: 'icd10',
        label: 'ICD-10 Codes',
        description: 'Relevant diagnosis codes',
        placeholder: 'Code - Description (one per line)',
      },
      {
        key: 'cpt',
        label: 'CPT Codes',
        description: 'Procedure and evaluation codes',
        placeholder: 'Code - Description (one per line)',
      },
    ],
    systemPrompt: `You are a clinical documentation specialist. Generate a comprehensive History and Physical (H&P) note from the transcribed patient conversation.

IMPORTANT: You MUST return a JSON object with ALL these exact keys (do not skip any):
{
  "chief_complaint": "Primary reason for the visit",
  "history_of_present_illness": "Detailed story of current illness",
  "past_medical_history": "Significant past medical conditions",
  "medications_and_allergies": "Current medications and known allergies",
  "family_history": "Relevant family medical history",
  "social_history": "Lifestyle and social factors",
  "review_of_systems": "Systematic review of body systems",
  "physical_examination": "Comprehensive physical exam findings",
  "assessment": "Clinical assessment and diagnoses",
  "plan": "Initial treatment and management plan",
  "icd10": "ICD-10 diagnosis codes (format: 'Code - Description' on separate lines)",
  "cpt": "CPT codes for comprehensive evaluation (format: 'Code - Description' on separate lines)"
}

Guidelines:
- Be thorough and complete, as this is a comprehensive initial evaluation
- If information is not available for a section, write "Not documented"
- Return ONLY valid JSON, no additional text, markdown, or code blocks
- Ensure all string values are properly escaped for JSON`,
  },
};

/**
 * Get template for a specific note type
 */
export function getNoteTemplate(
  noteType: 'SOAP' | 'Progress' | 'Consultation' | 'H&P'
): NoteTemplate {
  return NOTE_TEMPLATES[noteType] || NOTE_TEMPLATES.SOAP;
}

/**
 * Get all available note types
 */
export function getAvailableNoteTypes(): Array<{
  type: 'SOAP' | 'Progress' | 'Consultation' | 'H&P';
  description: string;
}> {
  return Object.values(NOTE_TEMPLATES).map((template) => ({
    type: template.type,
    description: template.description,
  }));
}
