-- Basketball Club Manager Database Schema

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user (password: admin)
-- bcrypt hash for 'admin' with cost factor 10
INSERT INTO users (id, username, password_hash, display_name)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin',
    '$2b$10$SmZ9mWfh7zhqDZetGeuv3ebyiFqjRvOKdQwCUWywO2z5MQugnMQUi',
    '관리자'
)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    position VARCHAR(50) DEFAULT 'SF',
    number INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ensure new columns exist even on existing installs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Set existing clubs without owner to admin
UPDATE clubs SET owner_id = '00000000-0000-0000-0000-000000000000' WHERE owner_id IS NULL;

ALTER TABLE members ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS history_records (
    id UUID PRIMARY KEY,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY,
    history_id UUID NOT NULL REFERENCES history_records(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'White',
    average_height NUMERIC(5,2) DEFAULT 0,
    team_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, member_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY,
    history_id UUID NOT NULL REFERENCES history_records(id) ON DELETE CASCADE,
    team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    result VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_club_id ON members(club_id);
CREATE INDEX IF NOT EXISTS idx_history_records_club_id ON history_records(club_id);
CREATE INDEX IF NOT EXISTS idx_teams_history_id ON teams(history_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_id ON team_members(member_id);
CREATE INDEX IF NOT EXISTS idx_matches_history_id ON matches(history_id);
