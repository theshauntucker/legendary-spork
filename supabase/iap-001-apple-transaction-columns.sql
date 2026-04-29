-- Migration: add Apple StoreKit transaction columns to payments table.
--
-- Required by:
--   - src/app/api/iap/validate-receipt/route.ts (idempotency key)
--   - src/app/api/iap/server-notification/route.ts (renewal lookups)
--
-- After this migration runs, the payments table can store Apple IAP
-- transactions alongside Stripe transactions, and the unique index
-- prevents double-fulfillment on Apple webhook retries.
--
-- Apply: supabase db push (or run via the Supabase SQL editor in prod).
-- Owner: Shaun, run only after reviewing the changes in this file.

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS apple_transaction_id text,
  ADD COLUMN IF NOT EXISTS apple_original_transaction_id text;

-- Idempotency: at most one payments row per Apple transaction id. Includes
-- a partial-WHERE so the existing constraint on Stripe-only rows isn't
-- affected. Apple txn ids are NULL for Stripe rows.
CREATE UNIQUE INDEX IF NOT EXISTS payments_apple_transaction_id_uniq
  ON payments(apple_transaction_id)
  WHERE apple_transaction_id IS NOT NULL;

-- Renewal lookups: server-notification route maps original_transaction_id
-- → user_id by scanning payments. A non-unique index speeds that up.
CREATE INDEX IF NOT EXISTS payments_apple_original_transaction_id_idx
  ON payments(apple_original_transaction_id)
  WHERE apple_original_transaction_id IS NOT NULL;

-- Sanity comment so future devs know why these columns exist.
COMMENT ON COLUMN payments.apple_transaction_id IS
  'Apple StoreKit transaction id from /api/iap/validate-receipt. NULL for Stripe payments. Unique.';
COMMENT ON COLUMN payments.apple_original_transaction_id IS
  'Apple StoreKit ORIGINAL transaction id (the first purchase in a subscription chain). Used by server-notification route to map renewals back to the user. NULL for Stripe payments.';
