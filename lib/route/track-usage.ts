import { ApiUsage } from "@/models/api-usage.model";

function dayBucket() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function trackApiUsage({
  apiKeyId,
  userId,
  resource,
}: {
  apiKeyId: string;
  userId: string;
  resource: string;
}) {
  await ApiUsage.updateOne(
    {
      apiKeyId,
      userId,
      resource,
      date: dayBucket(),
    },
    { $inc: { count: 1 } },
    { upsert: true },
  );
}
