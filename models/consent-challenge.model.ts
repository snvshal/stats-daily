import { Schema, model, models } from "mongoose";
import type { TConsentChallenge } from "@/lib/types";

const ConsentChallengeSchema = new Schema<TConsentChallenge>(
  {
    token: { type: String, required: true, unique: true },
    code: { type: String },
    userId: { type: String, required: true },
    clientId: { type: String, required: true },
    redirectUri: { type: String, required: true },
    codeChallenge: { type: String, required: true },
    codeChallengeMethod: { type: String, required: true },
    scope: { type: [String], default: [] },
    state: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const ConsentChallenge =
  models.ConsentChallenge ||
  model<TConsentChallenge>("ConsentChallenge", ConsentChallengeSchema);
