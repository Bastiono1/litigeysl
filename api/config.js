// Réglages partagés entre collègues (équipe, annuaire des agences, signatures…)
// stockés dans Upstash Redis (Vercel → Storage → Upstash for Redis).
import { checkAuth, readJson } from "./_auth.js";

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "poste-litiges:config";

async function redis(cmd) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(cmd) });
  if (!r.ok) throw new Error("Redis " + r.status);
  return (await r.json()).result;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (!URL_ || !TOKEN) return res.status(501).json({ error: "Pas de base partagée configurée." });
  try {
    if (req.method === "GET") {
      const v = await redis(["GET", KEY]);
      return res.status(200).json(v ? JSON.parse(v) : {});
    }
    if (req.method === "PUT") {
      // fusion champ par champ : chaque collègue n'écrase que ce qu'il a modifié
      const patch = await readJson(req);
      const cur = JSON.parse((await redis(["GET", KEY])) || "{}");
      for (const [k, v] of Object.entries(patch || {})) {
        cur[k] = v && typeof v === "object" && !Array.isArray(v) && cur[k] && typeof cur[k] === "object" && !Array.isArray(cur[k]) ? { ...cur[k], ...v } : v;
        if (v && typeof v === "object" && !Array.isArray(v)) for (const [kk, vv] of Object.entries(v)) if (vv === null) delete cur[k][kk];
      }
      await redis(["SET", KEY, JSON.stringify(cur)]);
      return res.status(200).json(cur);
    }
    res.status(405).json({ error: "Méthode non gérée." });
  } catch (e) { res.status(502).json({ error: "Base partagée injoignable : " + e.message }); }
}
