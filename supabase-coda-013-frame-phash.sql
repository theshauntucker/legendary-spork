-- supabase-coda-013-frame-phash.sql
-- P-PRE-2: Perceptual hash duplicate detection
--
-- Adds a frame_phash column (text[]) that stores up to 3 dHashes (16-char
-- hex, 64 bits each) computed client-side from the first 3 extracted frames.
--
-- The analyze route uses it as a fuzzy fallback to the existing exact-match
-- frame_fingerprint column: two videos are "near duplicates" when the min
-- Hamming distance across all frame-hash pairs is <= 8 bits. frame_fingerprint
-- stays in place during rollout so the fast exact match still catches the
-- common re-upload case without requiring server-side dHash compute.

begin;

alter table public.videos
  add column if not exists frame_phash text[];

-- Partial index for the fuzzy dup lookup: we only care about non-null hashes.
create index if not exists videos_frame_phash_not_null_idx
  on public.videos ((frame_phash is not null))
  where frame_phash is not null;

-- Helper for ops: count how many videos have hashes stored.
comment on column public.videos.frame_phash is
  'Array of up to 3 dHash hex strings (16 chars each, 64-bit) from first 3 frames. Populated by /api/analyze. Used for cross-user near-duplicate detection with Hamming distance <= 8.';

commit;
