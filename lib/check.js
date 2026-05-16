const colors = require('colors');

function cc(debug, defPort, emojititle, emojireact, emojicurrency, token, shopchannelID, language, gifurl, url, url_infooter) {
	const langs = {
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

	function showAvailableLanguages() {
		console.log('Available languages:', langs);
		console.log('ERROR: Set language in config.json');
	}

	const requiredConfigs = [
		{ value: token, message: 'Not already set token bot id' },
		{ value: shopchannelID, message: 'Not already set shopchannelID' },
		{ value: url, message: 'Not already set url' },
		{ value: debug, message: 'Not already set debug' },
		{ value: defPort, message: 'Not already set defPort' },
		{ value: emojititle, message: 'Not already set emojititle' },
		{ value: emojireact, message: 'Not already set emojireact' },
		{ value: emojicurrency, message: 'Not already set emojicurrency' },
		{ value: gifurl, message: 'Not already set gifurl' },
		{ value: language, message: 'Not already set language', function: showAvailableLanguages },
		{ value: url_infooter, message: 'Not already set url_infooter' }
	];

	const isMissing = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

	for (const config of requiredConfigs) {
		if (isMissing(config.value)) {
			console.log(colors.red(`INFO: Process Stopped, ${config.message}`));
			if (typeof config.function === 'function') config.function();
			process.exit(1);
		}
	}

	console.log('1.- All config is set'.green);
}

module.exports.cc = cc;
