import * as fs from "fs";
import * as yaml from "js-yaml";

// In-memory cache for storing opened threads
export const InMemoryCache = new Map();

// Load the config file
const configPath = process.argv[2] || process.env.CONFIG_PATH || "config.yml";

export let Config;
try {
  Config = yaml.load(fs.readFileSync(configPath, "utf8"));
  if (!Config) {
    throw new Error("Config file is empty or invalid");
  }
} catch (error) {
  console.error(`Failed to load config file (${configPath}): ${error.message}`);
  process.exit(1);
}
