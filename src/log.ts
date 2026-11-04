// All diagnostic output goes to stderr. stdout is reserved for the MCP stdio transport.
// Never pass API keys here. Config keys are Secret objects and print as "[redacted]".
export function log(...args: unknown[]): void {
  console.error(...args);
}
