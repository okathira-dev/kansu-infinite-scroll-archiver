import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, "../debug-fixtures/infinite-scroll.html");

const port = Number(process.env.FIXTURE_PORT ?? 41731);
const fixtureRoute = "/kansu-e2e/infinite-scroll";

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
  if (requestUrl.pathname === fixtureRoute) {
    const html = await readFile(fixturePath, "utf8");
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not Found");
});

server.listen(port, "127.0.0.1", () => {
  const fixtureUrl = `http://127.0.0.1:${port}${fixtureRoute}`;
  console.log(`[kansu] fixture server: ${fixtureUrl}`);
});
