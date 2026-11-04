// Placeholder MCP server. Replace the "ping" tool with your tool's real capabilities.
// Run it with "pnpm mcp"; it speaks MCP over stdio.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { loadEnvFile } from "../config.js";
import { log } from "../log.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "ahum-repo-template", version: "0.1.0" });

  server.registerTool(
    "ping",
    {
      description: "Health check. Returns the message you send, or 'pong'.",
      inputSchema: { message: z.string().max(200).optional() },
    },
    async ({ message }) => ({
      content: [{ type: "text", text: message ?? "pong" }],
    }),
  );

  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  loadEnvFile();
  await createMcpServer().connect(new StdioServerTransport());
  log("MCP server running on stdio");
}
