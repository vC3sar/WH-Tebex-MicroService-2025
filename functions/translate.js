const fs = require("fs");
const { autoTranslate } = require("./../functions/translate_service.js");
const colors = require("colors");

async function translateJSON(json, targetLanguage) {
  if (Array.isArray(json)) {
    const translatedArray = [];

    for (const item of json) {
      translatedArray.push(await translateJSON(item, targetLanguage));
    }

    return translatedArray;
  }

  if (json === null || typeof json !== "object") {
    const translation = await autoTranslate(String(json), {
      to: targetLanguage,
    });

    return translation.text;
  }

  const translatedJSON = {};

  for (const [key, value] of Object.entries(json)) {
    translatedJSON[key] =
      value !== null && typeof value === "object"
        ? await translateJSON(value, targetLanguage)
        : (await autoTranslate(String(value), { to: targetLanguage })).text;
  }

  return translatedJSON;
}

module.exports.autoTranslate = async function (jsonFile, targetLanguage) {
  try {
    const jsonContent = await fs.promises.readFile(jsonFile, "utf8");
    const originalJSON = JSON.parse(jsonContent);
    const translatedJSON = await translateJSON(originalJSON, targetLanguage);
    const outputFile = `./langs/${targetLanguage}.json`;

    await fs.promises.mkdir("./langs", { recursive: true });
    await fs.promises.writeFile(
      outputFile,
      JSON.stringify(translatedJSON, null, 2)
    );

    console.log("Language translated with success:", outputFile);
    console.log(colors.bgRed("Please, Restart the bot to apply changes."));
  } catch (error) {
    console.error("Error:", error);
  }
};
