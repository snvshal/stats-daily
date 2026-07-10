import crypto from "crypto";

export function hashToken(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
