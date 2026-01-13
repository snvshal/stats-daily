import { ApiKey } from "@/models/api-key.model";
import { hashApiKey } from "../api-key";
import { TApiKey } from "../types";

export async function authenticate(
  req: Request,
  requiredScope: string,
): Promise<TApiKey | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const rawKey = auth.slice(7);
  const keyHash = hashApiKey(rawKey);

  const key = await ApiKey.findOne({
    keyHash,
    revoked: false,
    scopes: { $in: [requiredScope] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

  return key;
}
