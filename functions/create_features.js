module.exports.createFeatures = async function () {
  const fs = require("fs");
  const path = require("path");
  const colors = require("colors");

  const configPath = path.join(process.cwd(), "config.json");
  const jsonData = fs.readFileSync(configPath, "utf8");
  const data = JSON.parse(jsonData);
  data.embed.useMCskin = true;
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf8");
  console.log(
    colors.yellow(
      "New features added. Please visit https://github.com/vCesar1mx/WH-Tebex-MicroService/ for more information"
    )
  );
};
