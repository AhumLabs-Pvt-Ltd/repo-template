import { existsSync } from "node:fs";
import { inspect } from "node:util";

const REDACTED = "[redacted]";

/**
 * Holds an API key so it cannot be printed by accident. String conversion, JSON and
 * console.log/util.inspect all show "[redacted]". Call reveal() only at the point where
 * the key is handed to the provider's SDK.
 */
export class Secret {
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  reveal(): string {
    return this.#value;
  }

  toString(): string {
    return REDACTED;
  }

  toJSON(): string {
    return REDACTED;
  }

  [inspect.custom](): string {
    return REDACTED;
  }
}

export interface EnvVarSpec {
  name: string;
  required: boolean;
  description: string;
}

/**
 * Every environment variable the tool reads. `pnpm run doctor` checks this list, so add new
 * variables here as well as to .env.example.
 */
export const ENV_VARS: EnvVarSpec[] = [
  {
    name: "ANTHROPIC_API_KEY",
    required: false,
    description: "Your own Anthropic API key. Enables Claude-backed features.",
  },
  {
    name: "OPENAI_API_KEY",
    required: false,
    description: "Your own OpenAI API key. Enables OpenAI-backed features.",
  },
  {
    name: "PORT",
    required: false,
    description: "Port for the local HTTP server. Defaults to 3000.",
  },
];

export const DEFAULT_PORT = 3000;

export interface Config {
  anthropicApiKey?: Secret;
  openaiApiKey?: Secret;
  port: number;
}

/**
 * Copies values from a local .env file into process.env if the file exists. Values already
 * set in the environment win. Nothing is printed.
 */
export function loadEnvFile(path = ".env"): void {
  if (existsSync(path)) process.loadEnvFile(path);
}

function optionalSecret(value: string | undefined): Secret | undefined {
  const trimmed = value?.trim();
  return trimmed ? new Secret(trimmed) : undefined;
}

/** Builds the config from environment variables only. Keys are never read from files in the repo. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const rawPort = env.PORT?.trim();
  const port = rawPort ? Number(rawPort) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be a whole number between 1 and 65535, got "${rawPort}".`);
  }
  return {
    anthropicApiKey: optionalSecret(env.ANTHROPIC_API_KEY),
    openaiApiKey: optionalSecret(env.OPENAI_API_KEY),
    port,
  };
}
