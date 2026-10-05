const readline = require('readline');
const fs = require('fs');
const colors = require('colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const configPath = './config.json';
let config = {};

// Cargar configuración existente o de ejemplo
try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else if (fs.existsSync('./config.example.json')) {
    config = JSON.parse(fs.readFileSync('./config.example.json', 'utf8'));
  }
} catch (e) {
  console.log("⚠️ No se pudo leer la configuración actual, empezando de cero.".red);
}

// Valores por defecto
const defaults = {
  showServer: false,
  debug: false,
  defPort: "25577",
  token: "",
  shopchannelID: "",
  language: "es",
  embed: {
    url: "https://tienda.tu-servidor.com",
    url_infooter: true,
    gifurl: "",
    imageurl: "",
    emojititle: "<:Tienda:989637753237032992>",
    emojireact: "<:CHECK:859580885573042176>",
    emojicurrency: "<:si1:985516183811940432>",
    color: "#0099ff",
    emojiproductArrow: "<:linea:1176722645836902420> ",
    useMCskin: true
  },
  api: {
    comment: "Is only decorative, you can leave it empty",
    favicon_url: ""
  },
  tebexCheck: {
    prefix: "!",
    apiKey: "TEBEX_PRIVATE_KEY",
    requiredRole: ""
  }
};

// Fusionar defaults con la config actual para no perder datos
config = { ...defaults, ...config };
config.embed = { ...defaults.embed, ...(config.embed || {}) };
config.api = { ...defaults.api, ...(config.api || {}) };
config.tebexCheck = { ...defaults.tebexCheck, ...(config.tebexCheck || {}) };

const questions = [
  { key: 'token', text: '1. Token de tu Bot de Discord', default: config.token },
  { key: 'shopchannelID', text: '2. ID del Canal de Discord (Donde llegarán las compras)', default: config.shopchannelID },
  { key: 'embedUrl', text: '3. Enlace (URL) de tu Tienda Tebex', default: config.embed.url, isEmbedUrl: true },
  { key: 'defPort', text: '4. Puerto para el servidor web', default: config.defPort },
  { key: 'language', text: '5. Idioma (es/en)', default: config.language },
  { key: 'showServer', text: '6. ¿Mostrar logs de rutas en consola? (true/false)', default: config.showServer.toString(), isBool: true },
  { key: 'debug', text: '7. ¿Activar modo depuración / debug? (true/false)', default: config.debug.toString(), isBool: true },
  { key: 'prefix', text: '8. Prefijo para el comando Tebex Check (ej: !)', default: config.tebexCheck.prefix, parent: 'tebexCheck' },
  { key: 'apiKey', text: '9. Clave Secreta de Tebex (Tebex Private Key)', default: config.tebexCheck.apiKey, parent: 'tebexCheck' },
  { key: 'requiredRole', text: '10. Rol de Discord requerido para usar el check (ID del rol, déjalo vacío si no requiere)', default: config.tebexCheck.requiredRole, parent: 'tebexCheck' }
];

let currentIndex = 0;

console.clear();
console.log("==================================================".cyan);
console.log("   🚀 Asistente de Configuración Fácil - Tebex 🚀  ".green.bold);
console.log("==================================================".cyan);
console.log("Deja en blanco y presiona ENTER para mantener el valor entre corchetes [ ].".italic.gray);
console.log("");

function askQuestion() {
  if (currentIndex >= questions.length) {
    saveConfig();
    return;
  }
  
  const q = questions[currentIndex];
  const defaultValueDisplay = q.default === "" ? "Vacío" : q.default;
  const promptText = `${q.text.cyan}\nValor actual [${defaultValueDisplay.toString().yellow}]: `;
  
  rl.question(promptText, (answer) => {
    let finalAnswer = answer.trim() || q.default;
    
    if (q.isBool) {
      finalAnswer = finalAnswer.toString().toLowerCase() === 'true';
    }
    
    if (q.isEmbedUrl) {
      config.embed.url = finalAnswer;
    } else if (q.parent) {
      config[q.parent][q.key] = finalAnswer;
    } else {
      config[q.key] = finalAnswer;
    }
    
    currentIndex++;
    console.log(""); // Espacio
    askQuestion();
  });
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log("==================================================".cyan);
  console.log("✅ ¡Configuración guardada exitosamente en config.json!".green.bold);
  console.log("");
  console.log("▶️  Para iniciar el servidor ahora, usa el comando: ".white + "npm start".cyan.bold);
  console.log("==================================================".cyan);
  rl.close();
}

askQuestion();
