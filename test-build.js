const assert = require("assert");
const http = require("http");
const { spawn } = require("child_process");

function debug(message) {
  const now = new Date().toISOString();
  console.log(`[test-build][${now}] ${message}`);
}

function wait(ms) {
  debug(`waiting ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  debug(`HTTP GET ${url}`);
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        debug(`HTTP response status=${res.statusCode}`);
        let body = "";
        res.on("data", (chunk) => {
          debug(`HTTP response chunk received (${chunk.length} bytes)`);
          body += chunk;
        });
        res.on("end", () => {
          debug("HTTP response end, parsing JSON body");
          try {
            debug(`HTTP response body raw=${body}`);
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(body),
            });
          } catch (err) {
            debug(`HTTP JSON parse failed: ${err.message}`);
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        debug(`HTTP request error: ${err.message}`);
        reject(err);
      });
  });
}

async function waitForHealthz(url, retries = 60, delayMs = 500) {
  debug(`waitForHealthz start retries=${retries} delayMs=${delayMs}`);
  let lastErr;
  for (let i = 0; i < retries; i += 1) {
    debug(`healthz attempt ${i + 1}/${retries}`);
    try {
      const res = await getJson(url);
      if (res.statusCode === 200 && res.body && res.body.ok === true) {
        debug("healthz responded OK");
        return res;
      }
      lastErr = new Error(`Unexpected healthz response: ${JSON.stringify(res)}`);
      debug(`healthz unexpected response: ${lastErr.message}`);
    } catch (err) {
      lastErr = err;
      debug(`healthz attempt failed: ${err.message}`);
    }
    await wait(delayMs);
  }
  debug("healthz retries exhausted");
  throw lastErr || new Error("Healthz check failed");
}

async function run() {
  debug("run() start");
  const port = "25601";
  debug(`using port=${port}`);
  const child = spawn(process.execPath, ["index.js"], {
    env: {
      ...process.env,
      WH_TEST_MODE: "1",
      WH_DEBUG_CONFIG: "1",
      WH_CONFIG_PATH: "./__config_missing_for_test__.json",
      PORT: port,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  debug(`spawned child pid=${child.pid}`);

  let output = "";
  child.stdout.on("data", (chunk) => {
    debug(`child stdout chunk (${chunk.length} bytes)`);
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    debug(`child stderr chunk (${chunk.length} bytes)`);
    output += chunk.toString();
  });
  child.on("exit", (code, signal) => {
    debug(`child exit code=${code} signal=${signal}`);
  });
  child.on("error", (err) => {
    debug(`child process error: ${err.message}`);
  });

  try {
    debug("checking /healthz");
    const health = await waitForHealthz(`http://127.0.0.1:${port}/healthz`);
    debug(`healthz payload=${JSON.stringify(health.body)}`);
    debug("running assertions");
    assert.strictEqual(health.body.language, "es", "Expected language from config.example.json");
    assert.ok(
      output.includes("[config-loader] using fallback config"),
      "Expected debug logs to include fallback config usage"
    );
    debug("all assertions passed");
    console.log("test-build passed: full app booted without config.json and healthz responded");
  } catch (err) {
    debug(`run failed: ${err.message}`);
    console.error("test-build debug output:\n" + output);
    throw err;
  } finally {
    debug("stopping child process with SIGTERM");
    child.kill("SIGTERM");
  }
}

run().catch((err) => {
  debug(`fatal error: ${err.message}`);
  console.error(err.stack || err.message);
  process.exit(1);
});
