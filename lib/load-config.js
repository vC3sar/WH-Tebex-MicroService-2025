const fs = require("fs");
const path = require("path");

function loadConfig() {
  const requestedPath = process.env.WH_CONFIG_PATH || "./config.json";
  const primaryPath = path.resolve(process.cwd(), requestedPath);
  const fallbackPath = path.resolve(process.cwd(), "./config.example.json");
  const debugConfigLoad = process.env.WH_DEBUG_CONFIG === "1";

  if (fs.existsSync(primaryPath)) {
    if (debugConfigLoad) {
      console.log(`[config-loader] using primary config: ${primaryPath}`);
    }
    return { config: require(primaryPath), source: primaryPath };
  }

  if (fs.existsSync(fallbackPath)) {
    if (debugConfigLoad) {
      console.log(`[config-loader] primary missing: ${primaryPath}`);
      console.log(`[config-loader] using fallback config: ${fallbackPath}`);
    }
    return { config: require(fallbackPath), source: fallbackPath };
  }

  if (debugConfigLoad) {
    console.log(`[config-loader] missing primary and fallback`);
    console.log(`[config-loader] primary expected at: ${primaryPath}`);
    console.log(`[config-loader] fallback expected at: ${fallbackPath}`);
  }
  throw new Error("No config file found. Expected config.json or config.example.json.");
}

module.exports = { loadConfig };
