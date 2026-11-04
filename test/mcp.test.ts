import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { expect, it } from "vitest";
import { createMcpServer } from "../src/mcp/server.js";

it("exposes a ping tool", async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createMcpServer().connect(serverTransport);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(clientTransport);

  const { tools } = await client.listTools();
  expect(tools.map((t) => t.name)).toEqual(["ping"]);

  const result = await client.callTool({ name: "ping", arguments: {} });
  expect(result.content).toEqual([{ type: "text", text: "pong" }]);
  await client.close();
});
