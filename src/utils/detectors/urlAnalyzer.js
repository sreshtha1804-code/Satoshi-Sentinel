// Local URL structure analysis. Parses the URL and flags patterns commonly
// associated with phishing or link obfuscation. This never fetches the
// URL, never checks reputation databases, and never confirms the site's
// actual content — it only looks at the string's structure.

import { makeFinding } from './findings.js'

const URL_SCAN_PATTERN = /\b((?:https?:\/\/|www\.)[^\s<>"')]+)/gi

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
  'cutt.ly', 'rebrand.ly', 'shorturl.at', 'rb.gy', 'tiny.cc', 'lnkd.in',
  's.id', 'v.gd', 'soo.gd',
])

const WATCHED_BRANDS = [
  'coinbase', 'binance', 'kraken', 'metamask', 'ledger', 'trezor',
  'blockchain', 'paypal', 'bitfinex', 'crypto.com', 'kucoin', 'gemini',
  'nostr', 'blockstream',
]

const SUSPICIOUS_WORDS = ['verify', 'support', 'secure', 'login', 'wallet-recovery', 'recover', 'unlock', 'help', 'confirm', 'update', 'security']

function normalizeCandidate(raw) {
  let value = raw.trim().replace(/[.,;:!?]+$/, '')
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`
  return value
}

/**
 * Parse a single URL-like string and evaluate it for structural
 * red flags. Returns null if the string cannot be parsed as a URL at all.
 */
export function parseUrl(rawUrl) {
  const normalized = normalizeCandidate(rawUrl)
  let url
  try {
    url = new URL(normalized)
  } catch {
    return null
  }

  const hostname = url.hostname.toLowerCase()
  const labels = hostname.split('.').filter(Boolean)
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  const isShortener = KNOWN_SHORTENERS.has(hostname)
  const isPunycode = labels.some((l) => l.startsWith('xn--'))
  const insecure = url.protocol === 'http:'
  const subdomainDepth = Math.max(0, labels.length - 2)

  const registrableDomain = labels.length >= 2 ? labels.slice(-2).join('.') : hostname
  let brandLookalike = null
  for (const brand of WATCHED_BRANDS) {
    const brandInHost = hostname.includes(brand)
    const brandIsRegistrable = registrableDomain.startsWith(`${brand}.`)
    if (brandInHost && !brandIsRegistrable) {
      brandLookalike = brand
      break
    }
  }

  const hasSuspiciousWord = SUSPICIOUS_WORDS.some((w) => hostname.includes(w))

  return {
    original: rawUrl.trim(),
    normalized,
    hostname,
    protocol: url.protocol.replace(':', ''),
    pathname: url.pathname,
    isIpHost,
    isShortener,
    isPunycode,
    insecure,
    subdomainDepth,
    brandLookalike,
    hasSuspiciousWord,
  }
}

/**
 * Find and parse every URL-like token in a block of text.
 */
export function extractUrls(text) {
  if (!text) return []
  const matches = text.match(URL_SCAN_PATTERN) || []
  const seen = new Set()
  const results = []
  for (const m of matches) {
    const parsed = parseUrl(m)
    if (!parsed || seen.has(parsed.hostname + parsed.pathname)) continue
    seen.add(parsed.hostname + parsed.pathname)
    results.push(parsed)
  }
  return results
}

/**
 * Turn one parsed URL into zero or more findings describing what was
 * structurally observed about it.
 */
export function buildUrlFindings(parsed, { context = 'submitted content' } = {}) {
  const findings = []
  if (!parsed) return findings

  if (parsed.brandLookalike) {
    findings.push(
      makeFinding({
        type: 'url_brand_lookalike',
        severity: 'high',
        title: 'Domain references a known brand outside its own domain',
        description: `The hostname contains "${parsed.brandLookalike}" but the registrable domain is not ${parsed.brandLookalike}'s own domain. This pattern is commonly used to make a link look official.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.isShortener) {
    findings.push(
      makeFinding({
        type: 'url_shortener',
        severity: 'medium',
        title: 'Shortened URL',
        description: `The link in the ${context} uses a URL-shortening service, which hides the actual destination until visited.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.isIpHost) {
    findings.push(
      makeFinding({
        type: 'url_ip_host',
        severity: 'high',
        title: 'Raw IP address used instead of a domain',
        description: `The link points directly at an IP address rather than a named domain, which is unusual for a legitimate service and common in phishing infrastructure.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.isPunycode) {
    findings.push(
      makeFinding({
        type: 'url_punycode',
        severity: 'medium',
        title: 'Punycode-encoded domain',
        description: `The hostname uses punycode (xn--) encoding, which can be used to visually spoof a legitimate domain with look-alike characters.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.subdomainDepth >= 3) {
    findings.push(
      makeFinding({
        type: 'url_deep_subdomain',
        severity: 'low',
        title: 'Unusually deep subdomain structure',
        description: `The hostname has ${parsed.subdomainDepth} subdomain levels, which is sometimes used to bury a suspicious registrable domain out of casual view.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.hasSuspiciousWord && !parsed.brandLookalike) {
    findings.push(
      makeFinding({
        type: 'url_suspicious_wording',
        severity: 'low',
        title: 'Domain uses account-action wording',
        description: `The hostname itself contains a word like "verify", "secure", or "recover" — a pattern more common on phishing pages than on the legitimate sites they imitate.`,
        evidence: parsed.hostname,
      })
    )
  }

  if (parsed.insecure) {
    findings.push(
      makeFinding({
        type: 'url_insecure_protocol',
        severity: 'low',
        title: 'Unencrypted HTTP link',
        description: `The link uses plain HTTP rather than HTTPS, so any data submitted to it would not be encrypted in transit.`,
        evidence: parsed.hostname,
      })
    )
  }

  return findings
}
