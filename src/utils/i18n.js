// Módulo de internacionalización (i18n) para cargar y resolver traducciones
const fs = require('fs')
const path = require('path')

const translations = {}
let loaded = false

/**
 * Carga los archivos de traducción desde public/lang/ (es.json, en.json)
 */
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

/**
 * Determina el idioma desde query string (lang) o header Accept-Language
 * @param {object} req - Objeto de solicitud Express
 * @returns {string} Código de idioma ('es' | 'en')
 */
function getLang(req) {
  const query = (req.query && req.query.lang) || ''
  const header = (req.headers && req.headers['accept-language']) || ''
  const lang = query || header.slice(0, 2)
  if (lang === 'en') return 'en'
  return 'es'
}

/**
 * Obtiene el valor traducido para una clave dada en el idioma especificado
 * @param {string} lang - Código de idioma
 * @param {string} key - Clave de traducción (ej. "server.auth.loginSuccess")
 * @returns {string} Texto traducido o la clave si no se encuentra
 */
function t(lang, key) {
  if (!loaded) loadTranslations()
  const dict = translations[lang] || translations.es
  const value = dict[key]
  if (value === undefined) return key
  return value
}

module.exports = { loadTranslations, getLang, t }
