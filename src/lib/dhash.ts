/**
 * dHash (difference hash) implementation for near-duplicate detection.
 *
 * Algorithm:
 *   1. Downscale image to 9x8 grayscale (72 pixels)
 *   2. For each row, compare adjacent pixels: bit = left > right ? 1 : 0
 *   3. 8 comparisons per row × 8 rows = 64 bits = 16-char hex
 *
 * Two images are "near duplicates" when Hamming distance <= 8 bits.
 *
 * Used to catch users re-uploading the same routine under a different
 * filename or after a re-encode that changes the exact byte fingerprint.
 */

const HASH_W = 9;
const HASH_H = 8;

/**
 * Compute a 64-bit dHash from a canvas. Returns 16 lowercase hex chars.
 * Callers must have already drawn the source image to the canvas at any size;
 * we internally downscale into an offscreen 9x8 grayscale buffer.
 */
export function computeDHashFromCanvas(source: HTMLCanvasElement | OffscreenCanvas): string {
  const small =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(HASH_W, HASH_H)
      : Object.assign(document.createElement("canvas"), { width: HASH_W, height: HASH_H });
  const ctx = (small as HTMLCanvasElement).getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error("Could not acquire 2D context for dHash");

  ctx.drawImage(source as CanvasImageSource, 0, 0, HASH_W, HASH_H);
  const img = ctx.getImageData(0, 0, HASH_W, HASH_H);

  const gray = new Uint8ClampedArray(HASH_W * HASH_H);
  for (let i = 0; i < gray.length; i++) {
    const r = img.data[i * 4];
    const g = img.data[i * 4 + 1];
    const b = img.data[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  let bits = "";
  for (let y = 0; y < HASH_H; y++) {
    for (let x = 0; x < HASH_W - 1; x++) {
      const left = gray[y * HASH_W + x];
      const right = gray[y * HASH_W + x + 1];
      bits += left > right ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Convert a 16-char hex dHash to a 64-bit BigInt for fast Hamming compare. */
export function hashToBigInt(hex: string): bigint {
  if (!/^[0-9a-f]{16}$/i.test(hex)) return 0n;
  return BigInt("0x" + hex);
}

/** Hamming distance between two hex dHashes. */
export function hammingDistance(a: string, b: string): number {
  const ai = hashToBigInt(a);
  const bi = hashToBigInt(b);
  let x = ai ^ bi;
  let count = 0;
  while (x !== 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

/**
 * Compare two arrays of dHashes (typically 3 frames per video).
 * Returns the minimum Hamming distance across ALL frame pairs.
 * A value <= 8 indicates near-duplicate video content.
 */
export function minHammingAcrossFrames(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 64;
  let min = 64;
  for (const ha of a) {
    for (const hb of b) {
      const d = hammingDistance(ha, hb);
      if (d < min) min = d;
      if (min === 0) return 0;
    }
  }
  return min;
}

export const DHASH_DUPLICATE_THRESHOLD = 8;
