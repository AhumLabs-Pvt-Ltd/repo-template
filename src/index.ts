import { createServer, type Server } from "node:http";
import { pathToFileURL } from "node:url";
import { loadConfig, loadEnvFile, type Config } from "./config.js";
import { log } from "./log.js";

/** Which bring-your-own-key providers are configured. Reports presence only, never values. */
export function providerStatus(config: Config): Record<string, boolean> {
  return { anthropic: Boolean(config.anthropicApiKey), openai: Boolean(config.openaiApiKey) };
}

/** Minimal local HTTP server with a health check. Replace with your tool's own entry point. */
export function createApp(config: Config): Server {
  return createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, providers: providerStatus(config) }));
      return;
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  loadEnvFile();
  const config = loadConfig();
  createApp(config).listen(config.port, "127.0.0.1", () => {
    log(`Listening on http://127.0.0.1:${config.port}/health`);
  });
}
