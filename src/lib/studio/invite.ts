/**
 * Short, human-readable invite codes for studio joins.
 *
 * Format: `<slug>-<4-char random>` — e.g. `elite-4f2k`.
 * The slug is derived from the studio name (lowercase, alphanumeric, max
 * 12 chars); the random tail is drawn from an unambiguous alphabet
 * (no 0/O/1/I/l). Collision probability at 4 chars from a 30-char alphabet
 * is ~1/810k per studio prefix, and the DB column is UNIQUE, so in the
 * rare collision case the caller re-generates.
 */

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/i/l

function slugify(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12) || "studio";
}

function randomTail(length = 4): string {
  let out = "";
  const bytes = new Uint8Array(length);
  // crypto.getRandomValues is available in Node 20+ (and in Edge runtimes).
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateInviteCode(studioName: string): string {
  return `${slugify(studioName)}-${randomTail(4)}`;
}

/**
 * Longer one-shot code for email invites (distinct from the studio's
 * permanent shareable invite_code). Expires in studio_invites after 14
 * days per the migration default.
 */
export function generateInviteLinkCode(): string {
  return `${randomTail(4)}-${randomTail(4)}-${randomTail(4)}`;
}
