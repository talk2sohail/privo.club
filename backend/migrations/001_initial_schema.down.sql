-- Drop tables in reverse order of creation to satisfy foreign key constraints
DROP TABLE IF EXISTS "MediaItem";
DROP TABLE IF EXISTS "EventFeedItem";
DROP TABLE IF EXISTS "RSVP";
DROP TABLE IF EXISTS "Invite";
DROP TABLE IF EXISTS "CircleMember";
DROP TABLE IF EXISTS "Circle";
DROP TABLE IF EXISTS "VerificationToken";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "User";
