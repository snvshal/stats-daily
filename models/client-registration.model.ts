import { Schema, model, models } from "mongoose";
import type { TClientRegistration } from "@/lib/types";

const ClientRegistrationSchema = new Schema<TClientRegistration>(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    clientSecret: { type: String },
    clientName: { type: String },
    redirectUris: { type: [String], required: true },
    grantTypes: { type: [String], default: ["authorization_code"] },
    responseTypes: { type: [String], default: ["code"] },
    tokenEndpointAuthMethod: { type: String, default: "none" },
    scope: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const ClientRegistration =
  models.ClientRegistration ||
  model<TClientRegistration>("ClientRegistration", ClientRegistrationSchema);
