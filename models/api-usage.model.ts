import { TApiUsage } from "@/lib/types";
import { Schema, model, models } from "mongoose";

const ApiUsageSchema = new Schema<TApiUsage>(
  {
    apiKeyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ApiUsageSchema.index({ apiKeyId: 1, resource: 1, date: 1 }, { unique: true });

export const ApiUsage =
  models.ApiUsage || model<TApiUsage>("ApiUsage", ApiUsageSchema);
