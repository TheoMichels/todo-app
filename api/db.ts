import { Redis } from "@upstash/redis";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const redis = getRedisClient();
  if (!redis) {
    return res.status(500).json({ error: "Configuration Upstash manquante" });
  }

  // Use a query parameter ?collection=todos to distinguish collections
  const collection = (req.query.collection as string) || "default";
  const REDIS_KEY = `todo-app:${collection}`;

  try {
    if (req.method === "GET") {
      const data = await redis.get(REDIS_KEY);
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      let items = req.body;
      if (typeof items === "string") {
        items = JSON.parse(items);
      }
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Array expected" });
      }

      await redis.set(REDIS_KEY, items);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: "Internal Error", details: err?.message });
  }
}
