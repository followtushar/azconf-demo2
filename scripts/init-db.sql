-- Create test database
CREATE DATABASE timecap_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE timecap TO timecap;
GRANT ALL PRIVILEGES ON DATABASE timecap_test TO timecap;

-- Enable required extensions
\c timecap;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c timecap_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";