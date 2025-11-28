CREATE DATABASE tutorialms_auth;
CREATE DATABASE tutorialms_users;
CREATE DATABASE tutorialms_notes;
CREATE DATABASE tutorialms_tags;

GRANT ALL PRIVILEGES ON DATABASE tutorialms_auth TO mspostgres;
GRANT ALL PRIVILEGES ON DATABASE tutorialms_users TO mspostgres;
GRANT ALL PRIVILEGES ON DATABASE tutorialms_notes TO mspostgres;
GRANT ALL PRIVILEGES ON DATABASE tutorialms_tags TO mspostgres;
