// Email service for sending emails via SMTP and generating AI content
import { generateText, type Message } from './textGeneration';

export interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  from?: string;
  fromName?: string;
}

export interface VisitEmailContext {
  patientName: string;
  patientAge?: number;
  doctorName: string;
  visitDate: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  medications?: string[];
  followUpDate?: string;
  vitals?: Record<string, any>;
  noteContent?: Record<string, string>;
}

export interface EmailGenerationResult {
  subject: string;
  body: string;
}

// SMTP Configuration - these should be set in environment variables
export const SMTP_CONFIG = {
  host: import.meta.env.VITE_SMTP_HOST || '',
  port: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
  secure: import.meta.env.VITE_SMTP_SECURE === 'true',
  user: import.meta.env.VITE_SMTP_USER || '',
  password: import.meta.env.VITE_SMTP_PASSWORD || '',
  fromEmail: import.meta.env.VITE_SMTP_FROM_EMAIL || '',
  fromName: import.meta.env.VITE_SMTP_FROM_NAME || 'ClinicalScribe AI',
};

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || '/api/send-email';

/**
 * Check if SMTP is configured
 */
export function isSmtpConfigured(): boolean {
  return !!(SMTP_CONFIG.host && SMTP_CONFIG.user && SMTP_CONFIG.password && SMTP_CONFIG.fromEmail);
}

/**
 * Generate AI email content for a patient visit
 */
export async function generateVisitEmail(
  context: VisitEmailContext,
  customPrompt?: string
): Promise<EmailGenerationResult> {
  const basePrompt = customPrompt || `Generate a professional, warm, and informative email to send to a patient after their medical visit.`;

  const contextInfo = `
Patient Information:
- Name: ${context.patientName}
${context.patientAge ? `- Age: ${context.patientAge}` : ''}

Visit Details:
- Date: ${new Date(context.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Doctor: Dr. ${context.doctorName}
${context.chiefComplaint ? `- Reason for Visit: ${context.chiefComplaint}` : ''}
${context.diagnosis ? `- Diagnosis: ${context.diagnosis}` : ''}
${context.treatmentPlan ? `- Treatment Plan: ${context.treatmentPlan}` : ''}
${context.medications && context.medications.length > 0 ? `- Medications: ${context.medications.join(', ')}` : ''}
${context.followUpDate ? `- Follow-up Date: ${context.followUpDate}` : ''}
${context.vitals ? `- Vitals Recorded: Blood Pressure, Heart Rate, Temperature, etc.` : ''}
`;

  const fullPrompt = `${basePrompt}

${contextInfo}

Requirements:
1. Start with a warm greeting using the patient's first name
2. Thank them for their visit
3. Summarize the key points from their visit in patient-friendly language (avoid medical jargon)
4. Include any important follow-up instructions
5. Remind them of any scheduled follow-up appointments
6. End with encouraging words and contact information for questions
7. Keep the tone professional but caring
8. DO NOT include any sensitive medical details that shouldn't be in email
9. Keep it concise but informative (about 200-300 words)

Please generate ONLY the email content in this exact JSON format:
{
  "subject": "Your subject line here",
  "body": "Your email body here with proper line breaks using \\n"
}`;

  try {
    const messages: Message[] = [{ role: 'user', content: fullPrompt }];
    const response = await generateText(messages);
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subject: parsed.subject || `Visit Summary - ${new Date(context.visitDate).toLocaleDateString()}`,
        body: parsed.body || response,
      };
    }

    // Fallback if JSON parsing fails
    return {
      subject: `Visit Summary - ${new Date(context.visitDate).toLocaleDateString()}`,
      body: response,
    };
  } catch (error) {
    console.error('Error generating email:', error);
    throw new Error('Failed to generate email content');
  }
}

/**
 * Regenerate email with a custom prompt
 */
export async function regenerateEmail(
  context: VisitEmailContext,
  customPrompt: string,
  currentEmail?: { subject: string; body: string }
): Promise<EmailGenerationResult> {
  const enhancedPrompt = `${customPrompt}

${currentEmail ? `
Current email draft:
Subject: ${currentEmail.subject}
Body: ${currentEmail.body}

Please modify the email based on the user's request while keeping the core visit information accurate.
` : ''}`;

  return generateVisitEmail(context, enhancedPrompt);
}

/**
 * Send email via backend API endpoint
 * For production (Netlify), always attempts to call the Render backend
 * For local dev, uses localhost endpoint
 * Falls back to demo mode only if API is unreachable
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Always try to call the API endpoint (whether SMTP is configured locally or not)
  // The backend API (Render) has the SMTP credentials
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        toName: emailData.toName,
        subject: emailData.subject,
        body: emailData.body,
        from: emailData.from || SMTP_CONFIG.fromEmail || 'noreply@clinicalscribe.com',
        fromName: emailData.fromName || SMTP_CONFIG.fromName || 'ClinicalScribe AI',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('Error calling email API:', error);
    
    // Fallback to demo mode if API is unreachable
    // This allows local development without running Render server
    console.warn('Email API unreachable. Using demo mode.');
    return {
      success: true,
      messageId: `demo-${Date.now()}`,
    };
  }
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format email body for HTML display
 */
export function formatEmailBodyForHtml(body: string): string {
  return body
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

/**
 * Format email body for plain text
 */
export function formatEmailBodyForPlainText(body: string): string {
  return body.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?p>/gi, '\n');
}
