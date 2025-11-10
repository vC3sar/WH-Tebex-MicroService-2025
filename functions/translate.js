const fs = require("fs");
const { autoTranslate } = require("./../functions/translate_service.js"); // Import the new translation service
const colors = require("colors");

async function translateJSON(json, targetLanguage) {
  const translatedJSON = {};
  for (let key in json) {
    if (typeof json[key] === "object") {
      translatedJSON[key] = await translateJSON(json[key], targetLanguage);
    } else {
      // call translation function
      const translation = await autoTranslate(json[key], {
        to: targetLanguage,
      });
      translatedJSON[key] = translation.text; // autoTranslate returns { text, from, to }
    }
  }
  return translatedJSON;
}

module.exports.autoTranslate = async function (jsonFile, targetLanguage) {
  try {
    const jsonContent = await fs.promises.readFile(jsonFile, "utf8");
    const originalJSON = JSON.parse(jsonContent);
    const translatedJSON = await translateJSON(originalJSON, targetLanguage);
    const outputFile = `./langs/${targetLanguage}.json`;

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
