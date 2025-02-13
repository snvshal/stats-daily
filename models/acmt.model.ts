import { TAchievement } from "@/lib/types";
import { Schema, Types, model, models } from "mongoose";

const AchievementSchema = new Schema<TAchievement>(
  {
    userId: { type: String, required: true },
    achievements: [
      {
        _id: { type: Types.ObjectId, auto: true },
        text: { type: String, required: true },
      },
    ],
    note: { type: String },
  },
  { timestamps: true },
);

export const Achievement =
  models.Achievement || model<TAchievement>("Achievement", AchievementSchema);
