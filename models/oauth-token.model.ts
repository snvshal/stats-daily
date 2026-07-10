import { Schema, model, models } from "mongoose";
import type { TOAuthToken } from "@/lib/types";

const OAuthTokenSchema = new Schema<TOAuthToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ["access", "refresh"], required: true },
    scopes: { type: [String], default: [] },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    clientId: { type: String },
  },
  { timestamps: true },
);

export const OAuthToken =
  models.OAuthToken || model<TOAuthToken>("OAuthToken", OAuthTokenSchema);
