-- Buyer enquiries default to a callback — the form still leads with the phone
-- number and "we call rather than email tennis". But some buyers would rather
-- be emailed, and a book-a-look confirmation has nowhere to land without one.
-- So email is captured when offered and left null otherwise; never required.
alter table enquiries add column email text;
