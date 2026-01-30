// src/lib/crypto.ts
import crypto from "crypto";
import "server-only";

const ALG = "aes-256-gcm";
const KEY_B64 = process.env.CANVAS_TOKEN_KEY; // base64-encoded 32 bytes
if (!KEY_B64) throw new Error("Missing env CANVAS_TOKEN_KEY");

const KEY = Buffer.from(KEY_B64, "base64");
if (KEY.length !== 32)
  throw new Error("CANVAS_TOKEN_KEY must decode to 32 bytes");

function b64(b: Buffer) {
  return b.toString("base64");
}
function unb64(s: string) {
  return Buffer.from(s, "base64");
}

/**
 * Encrypts plaintext token -> "v1:iv:tag:ciphertext"
 */
export function encryptToken(plaintext: string): string {
  const iv = crypto.randomBytes(12); // recommended for GCM
  const cipher = crypto.createCipheriv(ALG, KEY, iv);

  // Optional but good: bind this ciphertext to your app context
  cipher.setAAD(Buffer.from("canvas_pat_v1"));

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();
  return `v1:${b64(iv)}:${b64(tag)}:${b64(ciphertext)}`;
}

/**
 * Decrypts "v1:iv:tag:ciphertext" -> plaintext token
 */
export function decryptToken(payload: string): string {
  const [v, ivB64, tagB64, ctB64] = payload.split(":");
  if (v !== "v1" || !ivB64 || !tagB64 || !ctB64) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = unb64(ivB64);
  const tag = unb64(tagB64);
  const ciphertext = unb64(ctB64);

  const decipher = crypto.createDecipheriv(ALG, KEY, iv);
  decipher.setAAD(Buffer.from("canvas_pat_v1"));
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
