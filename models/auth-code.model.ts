import { Schema, model, models } from "mongoose";
import type { TAuthCode } from "@/lib/types";

const AuthCodeSchema = new Schema<TAuthCode>(
  {
    code: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    clientId: { type: String, required: true },
    redirectUri: { type: String, required: true },
    codeChallenge: { type: String, required: true },
    codeChallengeMethod: { type: String, required: true },
    scope: { type: [String], default: [] },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const AuthCode =
  models.AuthCode || model<TAuthCode>("AuthCode", AuthCodeSchema);
