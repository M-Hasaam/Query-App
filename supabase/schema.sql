-- Students table
CREATE TABLE students (
  id TEXT PRIMARY KEY, -- format: i25XXXX
  serial SERIAL,
  roll_number TEXT,    -- e.g., 25I-3107
  name TEXT NOT NULL,
  a1 FLOAT DEFAULT 0,
  a2 FLOAT DEFAULT 0,
  a3 FLOAT DEFAULT 0
);

-- Queries table
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  roll_no TEXT REFERENCES students(id),
  assignment_no TEXT NOT NULL, -- A1, A2, A3
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent a student from submitting more than one query per assignment
  CONSTRAINT unique_query_per_assignment UNIQUE (roll_no, assignment_no)
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queries_updated_at
  BEFORE UPDATE ON queries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_queries_email ON queries (email);
CREATE INDEX IF NOT EXISTS idx_queries_roll_no ON queries (roll_no);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries (status);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Students: each student can only read their own record
CREATE POLICY "Students can view their own record" ON students
  FOR SELECT USING (
    auth.jwt() ->> 'email' = id || '@isb.nu.edu.pk'
  );

-- Queries: students can only read their own queries
CREATE POLICY "Students can view their own queries" ON queries
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Queries: students can only insert their own queries
CREATE POLICY "Students can insert their own queries" ON queries
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Push subscriptions: students can manage their own subscriptions
CREATE POLICY "Students can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.jwt() ->> 'email' = email);
