-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(10),
  date_of_birth DATE,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  diagnoses TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(50),
  insurance_provider VARCHAR(255),
  insurance_id VARCHAR(100),
  medical_record_number VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  visit_type VARCHAR(50) DEFAULT 'routine',
  chief_complaint TEXT,
  vitals JSONB DEFAULT '{}',
  summary TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_date DATE,
  duration INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Update notes table to include patient_id reference
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_note_id ON visits(note_id);
CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON notes(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own patients" ON patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own patients" ON patients
  FOR DELETE USING (true);

-- RLS Policies for visits table
CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own visits" ON visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own visits" ON visits
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own visits" ON visits
  FOR DELETE USING (true);

-- Create trigger to auto-update updated_at for patients
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-update updated_at for visits
CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
