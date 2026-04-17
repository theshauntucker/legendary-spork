-- supabase-coda-012-backfill-error-status.sql
-- P-PRE-1: Error-status sweeper backfill
--
-- Some videos were incorrectly marked status='error' by the process route's
-- outer try/catch even though their analysis row saved successfully. This
-- sweep flips them back to 'analyzed' wherever a matching analyses row with
-- a valid total_score exists, and links analysis_id if missing.
--
-- Idempotent: only touches rows where status='error' AND an analysis exists.

begin;

-- 1) Link analysis_id for any misrouted error rows that do have analyses
update public.videos v
   set analysis_id = a.id,
       updated_at  = now()
  from public.analyses a
 where v.id = a.video_id
   and v.status = 'error'
   and v.analysis_id is null
   and a.total_score is not null
   and a.total_score > 0;

-- 2) Flip status back to analyzed
update public.videos v
   set status     = 'analyzed',
       updated_at = now()
  from public.analyses a
 where v.id = a.video_id
   and v.status = 'error'
   and a.total_score is not null
   and a.total_score > 0;

-- 3) Report — how many rows touched (for log visibility)
do $$
declare
  recovered integer;
begin
  select count(*)
    into recovered
    from public.videos v
    join public.analyses a on a.video_id = v.id
   where v.status = 'analyzed'
     and v.updated_at > now() - interval '5 seconds';
  raise notice 'P-PRE-1 backfill recovered % video rows to analyzed', recovered;
end $$;

commit;
