const colors = require('colors');

const supportedLanguages = {
  af: 'Afrikaans', sq: 'Albanian', ar: 'Arabic', hy: 'Armenian', az: 'Azerbaijani', eu: 'Basque',
  be: 'Belarusian', bn: 'Bengali', bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan', ceb: 'Cebuano',
  ny: 'Chichewa', 'zh-cn': 'Chinese Simplified', 'zh-tw': 'Chinese Traditional', co: 'Corsican', hr: 'Croatian',
  cs: 'Czech', da: 'Danish', nl: 'Dutch', en: 'English', eo: 'Esperanto', et: 'Estonian', tl: 'Filipino', fi: 'Finnish',
  fr: 'French', fy: 'Frisian', gl: 'Galician', ka: 'Georgian', de: 'German', el: 'Greek', gu: 'Gujarati', ht: 'Haitian Creole',
  ha: 'Hausa', haw: 'Hawaiian', iw: 'Hebrew', hi: 'Hindi', hmn: 'Hmong', hu: 'Hungarian', is: 'Icelandic', ig: 'Igbo',
  id: 'Indonesian', ga: 'Irish', it: 'Italian', ja: 'Japanese', jw: 'Javanese', kn: 'Kannada', kk: 'Kazakh', km: 'Khmer',
  ko: 'Korean', ku: 'Kurdish (Kurmanji)', ky: 'Kyrgyz', lo: 'Lao', la: 'Latin', lv: 'Latvian', lt: 'Lithuanian',
  lb: 'Luxembourgish', mk: 'Macedonian', mg: 'Malagasy', ms: 'Malay', ml: 'Malayalam', mt: 'Maltese', mi: 'Maori',
  mr: 'Marathi', mn: 'Mongolian', my: 'Myanmar (Burmese)',
  ne: 'Nepali', no: 'Norwegian', ps: 'Pashto', fa: 'Persian', pl: 'Polish', pt: 'Portuguese', pa: 'Punjabi', ro: 'Romanian',
  ru: 'Russian', sm: 'Samoan', gd: 'Scots Gaelic', sr: 'Serbian', st: 'Sesotho', sn: 'Shona', sd: 'Sindhi',
  si: 'Sinhala', sk: 'Slovak', sl: 'Slovenian', so: 'Somali', es: 'Spanish', su: 'Sundanese', sw: 'Swahili', sv: 'Swedish',
  tg: 'Tajik', ta: 'Tamil', te: 'Telugu', th: 'Thai', tr: 'Turkish', uk: 'Ukrainian', ur: 'Urdu', uz: 'Uzbek',
  vi: 'Vietnamese', cy: 'Welsh', xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', zu: 'Zulu'
};

function isMissing(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function validateRuntimeConfig(config) {
  const requiredFields = [
    ['token', config.token],
    ['shopchannelID', config.shopchannelID],
    ['url', config.url],
    ['defPort', config.defPort],
    ['emojititle', config.emojititle],
    ['emojireact', config.emojireact],
    ['emojicurrency', config.emojicurrency],
    ['gifurl', config.gifurl],
    ['language', config.language],
    ['url_infooter', config.url_infooter]
  ];

  const missingFields = requiredFields
    .filter(([, value]) => isMissing(value))
    .map(([name]) => name);

  if (missingFields.length > 0) {
    const languageNote = missingFields.includes('language')
      ? ` Supported languages: ${Object.keys(supportedLanguages).join(', ')}.`
      : '';
    throw new Error(`Missing required config values: ${missingFields.join(', ')}.${languageNote}`);
  }
}

function printStartupSummary({ language, defPort, discordJsVersion, debug, useMCskin, showServer }) {
  const statusColor = debug ? colors.yellow : colors.green;
  console.log(statusColor(`BOOT [ok] config | language=${language} | port=${defPort}`));
  console.log(colors.green(`BOOT [info] discord.js ${discordJsVersion}`));
  console.log(colors.cyan(`BOOT [info] embed skin=${useMCskin ? 'mc' : 'default'} | showServer=${showServer ? 'on' : 'off'}`));
  if (debug) {
    console.log(colors.yellow("BOOT [warn] debug mode enabled"));
  }
}

function printAvailableLanguages() {
  console.log(colors.yellow(`Available languages: ${Object.keys(supportedLanguages).join(', ')}`));
}

module.exports = {
  printAvailableLanguages,
  printStartupSummary,
  supportedLanguages,
  validateRuntimeConfig,
};
