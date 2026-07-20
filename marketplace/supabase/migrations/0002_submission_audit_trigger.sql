-- Auto-log the 'new' audit event when a seller submits (sellers cannot
-- write to status_events directly; the trigger runs as definer).
create or replace function log_submission_received() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into status_events (entity_type, entity_id, from_status, to_status, actor, note)
  values ('submission', new.id, null, 'new', 'seller', 'Submission received');
  return new;
end;
$$;

create trigger submissions_log_received
  after insert on submissions
  for each row execute function log_submission_received();

-- Admin server actions write explicit transition events.
create policy "admins write audit trail" on status_events
  for insert with check (is_admin());
