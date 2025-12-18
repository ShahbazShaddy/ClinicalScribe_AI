-- Add risk assessment fields to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low',
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS risk_assessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS risk_notes TEXT;

-- Add risk assessment fields to visits table
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS risk_score INTEGER,
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_risk_assessment JSONB;

-- Create patient_risk_history table for tracking risk over time
CREATE TABLE IF NOT EXISTS patient_risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  risk_level VARCHAR(20) NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_factors JSONB DEFAULT '[]',
  assessed_by VARCHAR(50) DEFAULT 'ai', -- 'ai' or 'manual'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_risk_level ON patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_patients_risk_score ON patients(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_visits_risk_level ON visits(risk_level);
CREATE INDEX IF NOT EXISTS idx_patient_risk_history_patient_id ON patient_risk_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_risk_history_created_at ON patient_risk_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE patient_risk_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_risk_history table
CREATE POLICY "Users can view patient risk history" ON patient_risk_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert patient risk history" ON patient_risk_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update patient risk history" ON patient_risk_history
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete patient risk history" ON patient_risk_history
  FOR DELETE USING (true);
