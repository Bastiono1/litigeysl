// Lit une page scannée de BL avec Claude (vision) et renvoie un objet JSON.
import { checkAuth, readJson } from "./_auth.js";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement." });
  if (!checkAuth(req, res)) return;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY n'est pas configurée sur Vercel." });
  let body;
  try { body = await readJson(req); } catch { return res.status(400).json({ error: "Requête illisible." }); }
  const { image, prompt } = body || {};
  if (!image || !prompt) return res.status(400).json({ error: "Image ou consigne manquante." });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1500,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
        { type: "text", text: prompt }
      ] }]
    })
  });
  if (r.status === 429) return res.status(429).json({ error: "Trop de demandes à Claude d'un coup, réessaie dans une minute." });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    return res.status(502).json({ error: `Claude a répondu ${r.status}.`, detail: t.slice(0, 400) });
  }
  const j = await r.json();
  const text = (j.content || []).filter(c => c.type === "text").map(c => c.text).join("");
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  try { return res.status(200).json(JSON.parse(text.slice(a, b + 1))); }
  catch { return res.status(502).json({ error: "Réponse de Claude illisible.", detail: text.slice(0, 400) }); }
}
