-- Migration: Add patient emails table for tracking sent emails
-- Created: 2025-12-18

-- Create patient_emails table
CREATE TABLE IF NOT EXISTS patient_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    
    -- Email content
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    
    -- Email metadata
    email_type TEXT DEFAULT 'visit_summary', -- visit_summary, follow_up, reminder, custom
    status TEXT DEFAULT 'draft', -- draft, sent, failed, delivered
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- AI generation tracking
    ai_generated BOOLEAN DEFAULT true,
    ai_prompt TEXT, -- The prompt used to generate/regenerate
    generation_context JSONB, -- Context used for AI generation (visit data, etc.)
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_patient_emails_user_id ON patient_emails(user_id);
CREATE INDEX idx_patient_emails_patient_id ON patient_emails(patient_id);
CREATE INDEX idx_patient_emails_visit_id ON patient_emails(visit_id);
CREATE INDEX idx_patient_emails_status ON patient_emails(status);
CREATE INDEX idx_patient_emails_sent_at ON patient_emails(sent_at);

-- Enable RLS
ALTER TABLE patient_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own patient emails"
    ON patient_emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create patient emails"
    ON patient_emails FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient emails"
    ON patient_emails FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patient emails"
    ON patient_emails FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_patient_emails_updated_at
    BEFORE UPDATE ON patient_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
