import { TApiKey } from "@/lib/types";
import { Schema, model, models } from "mongoose";

const ApiKeySchema = new Schema<TApiKey>(
  {
    userId: { type: String, required: true, index: true },
    keyHash: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    scopes: { type: [String], default: [] },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ApiKey = models.ApiKey || model<TApiKey>("ApiKey", ApiKeySchema);
