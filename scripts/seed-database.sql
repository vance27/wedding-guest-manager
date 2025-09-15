-- Initial seed data for wedding guest manager
-- Run this after setting up your database

-- Create some sample tables
INSERT INTO "tables" (id, name, capacity, description) VALUES
  ('table_1', 'Head Table', 8, 'Wedding party and immediate family'),
  ('table_2', 'Family Table A', 10, 'Bride''s extended family'),
  ('table_3', 'Family Table B', 10, 'Groom''s extended family'),
  ('table_4', 'Friends Table', 8, 'College friends'),
  ('table_5', 'Work Colleagues', 8, 'Professional connections');

-- Create sample guests
INSERT INTO "guests" (id, "firstName", "lastName", email, "rsvpStatus", "tableId") VALUES
  ('guest_1', 'John', 'Smith', 'john.smith@email.com', 'ACCEPTED', 'table_1'),
  ('guest_2', 'Jane', 'Smith', 'jane.smith@email.com', 'ACCEPTED', 'table_1'),
  ('guest_3', 'Bob', 'Johnson', 'bob.johnson@email.com', 'PENDING', 'table_2'),
  ('guest_4', 'Alice', 'Williams', 'alice.williams@email.com', 'ACCEPTED', 'table_2'),
  ('guest_5', 'Charlie', 'Brown', 'charlie.brown@email.com', 'DECLINED', NULL),
  ('guest_6', 'Diana', 'Davis', 'diana.davis@email.com', 'ACCEPTED', 'table_4');

-- Create sample relationships
INSERT INTO "relationships" ("guestFromId", "guestToId", "relationshipType", strength) VALUES
  ('guest_1', 'guest_2', 'SPOUSE', 5),
  ('guest_3', 'guest_4', 'FRIEND', 4),
  ('guest_1', 'guest_3', 'FAMILY', 3),
  ('guest_2', 'guest_6', 'FRIEND', 4);
