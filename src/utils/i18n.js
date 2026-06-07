const fs = require('fs')
const path = require('path')

const translations = {}
let loaded = false

function loadTranslations() {
  if (loaded) return
  const langDir = path.join(__dirname, '..', '..', 'public', 'lang')
  try {
    translations.es = JSON.parse(fs.readFileSync(path.join(langDir, 'es.json'), 'utf8'))
    translations.en = JSON.parse(fs.readFileSync(path.join(langDir, 'en.json'), 'utf8'))
    loaded = true
  } catch (err) {
    console.error('i18n: Error loading server translations', err.message)
  }
}

function getLang(req) {
  const query = (req.query && req.query.lang) || ''
  const header = (req.headers && req.headers['accept-language']) || ''
  const lang = query || header.slice(0, 2)
  if (lang === 'en') return 'en'
  return 'es'
}

function t(lang, key) {
  if (!loaded) loadTranslations()
  const dict = translations[lang] || translations.es
  const value = dict[key]
  if (value === undefined) return key
  return value
}

module.exports = { loadTranslations, getLang, t }
