-- Create patient_chat_sessions table
CREATE TABLE IF NOT EXISTS patient_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'Patient Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create patient_chat_messages table
CREATE TABLE IF NOT EXISTS patient_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES patient_chat_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patient_chat_sessions_patient_id ON patient_chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_chat_sessions_user_id ON patient_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_chat_messages_session_id ON patient_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_patient_chat_messages_patient_id ON patient_chat_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_chat_messages_created_at ON patient_chat_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE patient_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_chat_sessions table
CREATE POLICY "Users can view own patient chat sessions" ON patient_chat_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own patient chat sessions" ON patient_chat_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own patient chat sessions" ON patient_chat_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own patient chat sessions" ON patient_chat_sessions
  FOR DELETE USING (true);

-- RLS Policies for patient_chat_messages table
CREATE POLICY "Users can view own patient chat messages" ON patient_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own patient chat messages" ON patient_chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own patient chat messages" ON patient_chat_messages
  FOR DELETE USING (true);

-- Create trigger to auto-update updated_at for patient_chat_sessions
CREATE TRIGGER update_patient_chat_sessions_updated_at
  BEFORE UPDATE ON patient_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update patient_chat_sessions updated_at when messages are added
CREATE OR REPLACE FUNCTION update_patient_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE patient_chat_sessions SET updated_at = NOW() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update patient_chat_sessions updated_at when messages are added
CREATE TRIGGER update_patient_chat_sessions_on_message
  AFTER INSERT ON patient_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_chat_sessions_updated_at();
