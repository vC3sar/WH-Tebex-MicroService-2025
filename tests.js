const { autoTranslate } = require('./translatelocal.js');

(async () => {
  try {
    const res = await autoTranslate("Hola mundo", { from: "es", to: "en" });
    console.log(res);
    // { text: 'Hello world', from: 'es', to: 'en' }
  } catch (err) {
    console.error("Error traduciendo:", err);
  }
})();
