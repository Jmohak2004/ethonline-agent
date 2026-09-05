-- AgentFi PostgreSQL initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for full-text search on agent names

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agentfi TO agentfi;
