import crypto from "crypto";

export function generateApiKey() {
  return `sndo_${crypto.randomBytes(32).toString("hex")}`;
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
