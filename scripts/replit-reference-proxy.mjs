import { createServer } from "node:http";

const TARGET = process.env.REPLIT_REF_URL || "https://juntas-fuertes--yepezmancheno.replit.app";
const PORT = Number(process.env.REPLIT_REF_PORT || 5173);

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const server = createServer(async (req, res) => {
  const targetUrl = new URL(req.url || "/", TARGET);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value && key !== "host" && key !== "connection") {
      headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  }

  const method = req.method || "GET";
  const body = ["GET", "HEAD"].includes(method) ? undefined : await readBody(req);

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "follow",
    });
    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Replit reference proxy failed: ${error.message}\nTarget: ${TARGET}`);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Replit reference proxy on http://localhost:${PORT} -> ${TARGET}`);
});
