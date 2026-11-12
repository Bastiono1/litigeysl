// Mot de passe partagé : variable APP_PASSWORD sur Vercel. Sans elle, le site est ouvert à tous.
export function checkAuth(req, res) {
  const want = process.env.APP_PASSWORD;
  if (!want) return true;
  if (req.headers["x-app-password"] === want) return true;
  res.status(401).json({ error: "Mot de passe incorrect." });
  return false;
}
export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
