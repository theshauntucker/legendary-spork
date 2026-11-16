import { X509Certificate, createVerify } from "node:crypto";

/**
 * Apple-signed JWS verification, shared by the App Store Server
 * Notification route and the client fulfillment route.
 *
 * StoreKit 2 hands the app a signed transaction (jwsRepresentation)
 * instead of the legacy app receipt, so the client path now sends that
 * JWS and the server verifies it here with the same checks the
 * notification route has always applied.
 */

export const EXPECTED_BUNDLE_ID = "com.routinex.app";

// ─── JWS verification ───────────────────────────────────────────────────────

export interface JwsHeader {
  alg?: string;
  x5c?: string[];
}

export interface SignedTransactionInfo {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  purchaseDate?: number;
  expiresDate?: number;
  appAccountToken?: string;
  type?: string;
  quantity?: number;
}

function b64urlToBuffer(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

export function decodeJwsSegment<T>(jws: string, index: number): T | null {
  try {
    const parts = jws.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(b64urlToBuffer(parts[index]).toString("utf-8")) as T;
  } catch {
    return null;
  }
}

/**
 * Verify a JWS produced by Apple and return its decoded payload.
 * Returns null when anything about the signature or chain is wrong —
 * the caller must treat null as "reject", never as "probably fine".
 */
export function verifyAppleJws<T>(jws: string): T | null {
  const parts = jws.split(".");
  if (parts.length !== 3) {
    console.error("[iap-notification] JWS malformed (expected 3 segments)");
    return null;
  }

  const header = decodeJwsSegment<JwsHeader>(jws, 0);
  const x5c = header?.x5c;
  if (!x5c || x5c.length < 2) {
    console.error("[iap-notification] JWS header missing x5c chain");
    return null;
  }
  if (header?.alg !== "ES256") {
    console.error(`[iap-notification] unexpected JWS alg: ${header?.alg}`);
    return null;
  }

  let certs: X509Certificate[];
  try {
    certs = x5c.map((c) => new X509Certificate(Buffer.from(c, "base64")));
  } catch (err) {
    console.error("[iap-notification] could not parse x5c certificates:", err);
    return null;
  }

  // Chain consistency: cert[i] must be signed by cert[i+1].
  for (let i = 0; i < certs.length - 1; i++) {
    if (!certs[i].verify(certs[i + 1].publicKey)) {
      console.error(`[iap-notification] x5c chain broken at index ${i}`);
      return null;
    }
  }

  // The chain must terminate in a self-signed Apple root.
  const root = certs[certs.length - 1];
  if (!root.verify(root.publicKey)) {
    console.error("[iap-notification] x5c root is not self-signed");
    return null;
  }
  if (!/Apple/i.test(root.subject)) {
    console.error("[iap-notification] x5c root is not an Apple certificate:", root.subject);
    return null;
  }

  const pinnedFingerprint = process.env.APPLE_ROOT_CA_SHA256?.toLowerCase().replace(/:/g, "");
  if (pinnedFingerprint) {
    const actual = root.fingerprint256.toLowerCase().replace(/:/g, "");
    if (actual !== pinnedFingerprint) {
      console.error(
        `[iap-notification] Apple root fingerprint mismatch. expected=${pinnedFingerprint} actual=${actual}`
      );
      return null;
    }
  } else {
    console.warn(
      "[iap-notification] APPLE_ROOT_CA_SHA256 not set — root is validated by self-signature and Apple subject only. Set it to pin the root."
    );
  }

  // Certificates must be currently valid.
  const now = Date.now();
  for (const cert of certs) {
    if (Date.parse(cert.validFrom) > now || Date.parse(cert.validTo) < now) {
      console.error("[iap-notification] certificate outside validity window:", cert.subject);
      return null;
    }
  }

  // Verify the signature over "header.payload" with the leaf's key.
  // ES256 JWS signatures are raw r||s; Node expects that with dsaEncoding
  // set to "ieee-p1363".
  try {
    const signingInput = `${parts[0]}.${parts[1]}`;
    const signature = b64urlToBuffer(parts[2]);
    const verifier = createVerify("SHA256");
    verifier.update(signingInput);
    verifier.end();
    const ok = verifier.verify(
      {
        // X509Certificate.publicKey is already a public KeyObject. Wrapping it in
        // createPublicKey() threw ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE and rejected
        // every genuine Apple notification, so iOS buyers got no credits.
        key: certs[0].publicKey,
        dsaEncoding: "ieee-p1363",
      },
      signature
    );
    if (!ok) {
      console.error("[iap-notification] JWS signature did not verify");
      return null;
    }
  } catch (err) {
    console.error("[iap-notification] JWS signature verification threw:", err);
    return null;
  }

  return decodeJwsSegment<T>(jws, 1);
}
