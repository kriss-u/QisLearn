import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4100);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(port, () => {
  console.log(`llm-service listening on http://localhost:${port}`);
});
