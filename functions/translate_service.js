'use strict'

// function for dynamically loading got from ESM
async function getGot() {
  return (await import('got')).default;
}
// 108 languages supported by Google Translate
// https://cloud.google.com/translate/docs/languages
const languages = {
  auto: "Automatic",
  af: "Afrikaans",
  sq: "Albanian",
  am: "Amharic",
  ar: "Arabic",
  hy: "Armenian",
  az: "Azerbaijani",
  eu: "Basque",
  be: "Belarusian",
  bn: "Bengali",
  bs: "Bosnian",
  bg: "Bulgarian",
  ca: "Catalan",
  ceb: "Cebuano",
  ny: "Chichewa",
  zh: "Chinese",
  co: "Corsican",
  hr: "Croatian",
  cs: "Czech",
  da: "Danish",
  nl: "Dutch",
  en: "English",
  eo: "Esperanto",
  et: "Estonian",
  tl: "Filipino",
  fi: "Finnish",
  fr: "French",
  fy: "Frisian",
  gl: "Galician",
  ka: "Georgian",
  de: "German",
  el: "Greek",
  gu: "Gujarati",
  ht: "Haitian Creole",
  ha: "Hausa",
  haw: "Hawaiian",
  he: "Hebrew",
  hi: "Hindi",
  hmn: "Hmong",
  hu: "Hungarian",
  is: "Icelandic",
  ig: "Igbo",
  id: "Indonesian",
  ga: "Irish",
  it: "Italian",
  ja: "Japanese",
  jw: "Javanese",
  kn: "Kannada",
  kk: "Kazakh",
  km: "Khmer",
  ko: "Korean",
  ku: "Kurdish (Kurmanji)",
  ky: "Kyrgyz",
  lo: "Lao",
  la: "Latin",
  lv: "Latvian",
  lt: "Lithuanian",
  lb: "Luxembourgish",
  mk: "Macedonian",
  mg: "Malagasy",
  ms: "Malay",
  ml: "Malayalam",
  mt: "Maltese",
  mi: "Maori",
  mr: "Marathi",
  mn: "Mongolian",
  my: "Myanmar (Burmese)",
  ne: "Nepali",
  no: "Norwegian",
  ps: "Pashto",
  fa: "Persian",
  pl: "Polish",
  pt: "Portuguese",
  pa: "Punjabi",
  ro: "Romanian",
  ru: "Russian",
  sm: "Samoan",
  gd: "Scots Gaelic",
  sr: "Serbian",
  st: "Sesotho",
  sn: "Shona",
  sd: "Sindhi",
  si: "Sinhala",
  sk: "Slovak",
  sl: "Slovenian",
  so: "Somali",
  es: "Spanish",
  su: "Sundanese",
  sw: "Swahili",
  sv: "Swedish",
  tg: "Tajik",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  uz: "Uzbek",
  vi: "Vietnamese",
  cy: "Welsh",
  xh: "Xhosa",
  yi: "Yiddish",
  yo: "Yoruba",
  zu: "Zulu"
};


function isSupported(lang) {
  return languages.hasOwnProperty(lang)
}

async function autoTranslate(text, opts = {}) {
  const got = await getGot(); // save got instance

  const from = opts.from || "auto"
  const to = opts.to || "en"

  if (!isSupported(from) && from !== "auto") {
    throw new Error(`The source language '${from}' isn't supported`)
  }
  if (!isSupported(to)) {
    throw new Error(`The target language '${to}' isn't supported`)
  }

  const url = "https://translate.googleapis.com/translate_a/single"
  const searchParams = new URLSearchParams([
    ["client", "gtx"],
    ["sl", from],
    ["tl", to],
    ["dt", "t"],
    ["q", text]
  ])

  try {
    const { body } = await got(url, { searchParams, responseType: "json" })

    const translated = body[0].map(item => item[0]).join("")
    const detectedSource = body[2] || from

    return { text: translated, from: detectedSource, to }
  } catch (err) {
    throw new Error("Error in translate: " + err.message)
  }
}

module.exports = { autoTranslate, languages }
