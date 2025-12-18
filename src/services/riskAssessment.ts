import { generateText, type Message } from './textGeneration';
import type { RiskAssessment } from '@/db/services';

interface VisitData {
  chiefComplaint?: string;
  diagnosis?: string;
  vitals?: {
    bp?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    oxygenSaturation?: number;
  };
  summary?: string;
  treatmentPlan?: string;
  noteContent?: Record<string, string>;
  transcription?: string;
}

interface PatientData {
  name: string;
  age?: number;
  gender?: string;
  diagnoses?: string[];
  medications?: string[];
  allergies?: string[];
}

/**
 * Analyze a clinical visit and generate a risk assessment using AI
 */
export async function analyzeVisitRisk(
  visitData: VisitData,
  patientData: PatientData,
  previousVisits?: VisitData[]
): Promise<RiskAssessment> {
  const systemPrompt = `You are a clinical risk assessment AI assistant. Analyze the provided patient visit information and generate a risk assessment.

Your response MUST be valid JSON in this exact format:
{
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "riskScore": <number 0-100>,
  "riskFactors": ["factor1", "factor2", ...],
  "summary": "Brief summary of the risk assessment",
  "concerns": ["concern1", "concern2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "followUpUrgency": "routine" | "soon" | "urgent" | "immediate"
}

Risk Level Guidelines:
- LOW (0-25): Stable patient, no immediate concerns, routine follow-up
- MODERATE (26-50): Some concerns that need monitoring, follow-up within 2-4 weeks
- HIGH (51-75): Significant concerns, needs close monitoring, follow-up within 1 week
- CRITICAL (76-100): Immediate intervention may be needed, urgent follow-up

Consider these factors when assessing risk:
1. Vital signs abnormalities (hypertension, tachycardia, fever, hypoxia)
2. Severity of chief complaint and diagnosis
3. Patient age and comorbidities
4. Medication interactions and allergies
5. Changes from previous visits (worsening trends)
6. Social and lifestyle factors mentioned in notes
7. Mental health indicators
8. Compliance and follow-up adherence`;

  // Build the visit context
  let visitContext = `PATIENT INFORMATION:
- Name: ${patientData.name}
- Age: ${patientData.age || 'Unknown'}
- Gender: ${patientData.gender || 'Unknown'}
`;

  if (patientData.diagnoses && patientData.diagnoses.length > 0) {
    visitContext += `- Known Diagnoses: ${patientData.diagnoses.join(', ')}\n`;
  }
  if (patientData.medications && patientData.medications.length > 0) {
    visitContext += `- Current Medications: ${patientData.medications.join(', ')}\n`;
  }
  if (patientData.allergies && patientData.allergies.length > 0) {
    visitContext += `- Allergies: ${patientData.allergies.join(', ')}\n`;
  }

  visitContext += `\nCURRENT VISIT:`;
  if (visitData.chiefComplaint) {
    visitContext += `\n- Chief Complaint: ${visitData.chiefComplaint}`;
  }
  if (visitData.diagnosis) {
    visitContext += `\n- Diagnosis: ${visitData.diagnosis}`;
  }
  if (visitData.vitals) {
    visitContext += `\n- Vitals:`;
    if (visitData.vitals.bp) visitContext += ` BP: ${visitData.vitals.bp}`;
    if (visitData.vitals.heartRate) visitContext += ` HR: ${visitData.vitals.heartRate}bpm`;
    if (visitData.vitals.temperature) visitContext += ` Temp: ${visitData.vitals.temperature}°C`;
    if (visitData.vitals.weight) visitContext += ` Weight: ${visitData.vitals.weight}kg`;
    if (visitData.vitals.oxygenSaturation) visitContext += ` SpO2: ${visitData.vitals.oxygenSaturation}%`;
  }
  if (visitData.summary) {
    visitContext += `\n- Summary: ${visitData.summary}`;
  }
  if (visitData.treatmentPlan) {
    visitContext += `\n- Treatment Plan: ${visitData.treatmentPlan}`;
  }

  // Add note content if available
  if (visitData.noteContent && Object.keys(visitData.noteContent).length > 0) {
    visitContext += `\n\nCLINICAL NOTE DETAILS:`;
    Object.entries(visitData.noteContent).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        visitContext += `\n${key}: ${value.substring(0, 500)}`;
      }
    });
  }

  // Add transcription if available (limited)
  if (visitData.transcription) {
    const limitedTranscription = visitData.transcription.length > 1000
      ? visitData.transcription.substring(0, 1000) + '...'
      : visitData.transcription;
    visitContext += `\n\nTRANSCRIPTION EXCERPT:\n${limitedTranscription}`;
  }

  // Add previous visit context for trend analysis
  if (previousVisits && previousVisits.length > 0) {
    visitContext += `\n\nPREVIOUS VISITS (${previousVisits.length} total):`;
    previousVisits.slice(0, 3).forEach((pv, i) => {
      visitContext += `\n--- Previous Visit ${i + 1} ---`;
      if (pv.chiefComplaint) visitContext += `\nComplaint: ${pv.chiefComplaint}`;
      if (pv.diagnosis) visitContext += `\nDiagnosis: ${pv.diagnosis}`;
      if (pv.vitals?.bp) visitContext += `\nBP: ${pv.vitals.bp}`;
    });
  }

  visitContext += `\n\nPlease analyze this information and provide a risk assessment in JSON format.`;

  const messages: Message[] = [
    { role: 'user', content: visitContext }
  ];

  try {
    const response = await generateText(messages, systemPrompt, 0.3, 1500);
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const assessment = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        riskLevel: validateRiskLevel(assessment.riskLevel),
        riskScore: Math.min(100, Math.max(0, parseInt(assessment.riskScore) || 0)),
        riskFactors: Array.isArray(assessment.riskFactors) ? assessment.riskFactors : [],
        summary: assessment.summary || '',
        concerns: Array.isArray(assessment.concerns) ? assessment.concerns : [],
        recommendations: Array.isArray(assessment.recommendations) ? assessment.recommendations : [],
        followUpUrgency: validateFollowUpUrgency(assessment.followUpUrgency),
      };
    }
    
    // Default if parsing fails
    return getDefaultRiskAssessment();
  } catch (error) {
    console.error('Error analyzing visit risk:', error);
    return getDefaultRiskAssessment();
  }
}

function validateRiskLevel(level: string): 'low' | 'moderate' | 'high' | 'critical' {
  const validLevels = ['low', 'moderate', 'high', 'critical'];
  return validLevels.includes(level?.toLowerCase()) 
    ? level.toLowerCase() as 'low' | 'moderate' | 'high' | 'critical'
    : 'low';
}

function validateFollowUpUrgency(urgency: string): string {
  const validUrgencies = ['routine', 'soon', 'urgent', 'immediate'];
  return validUrgencies.includes(urgency?.toLowerCase()) ? urgency.toLowerCase() : 'routine';
}

function getDefaultRiskAssessment(): RiskAssessment {
  return {
    riskLevel: 'low',
    riskScore: 0,
    riskFactors: [],
    summary: 'Unable to perform risk assessment',
    concerns: [],
    recommendations: ['Manual review recommended'],
    followUpUrgency: 'routine',
  };
}

/**
 * Get risk level color for UI display
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'moderate':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
    default:
      return 'text-green-600 bg-green-100 border-green-200';
  }
}

/**
 * Get risk level badge variant
 */
export function getRiskBadgeVariant(riskLevel: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'moderate':
      return 'secondary';
    case 'low':
    default:
      return 'outline';
  }
}
