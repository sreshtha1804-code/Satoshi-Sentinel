// Client-side mirror of backend/app/services/security.py. This runs
// before ANY analysis — local or backend — so key material is refused
// even in pure offline demo mode, not just when the backend happens to be
// reachable. See the backend module for the full rationale; the two are
// kept in sync deliberately.

const WIF_PATTERN = /^[5KLc9][1-9A-HJ-NP-Za-km-z]{50,52}$/
const HEX64_WITH_KEY_CONTEXT = /\b(private\s*key|priv\s*key|wif)\b[^\n]{0,20}\b([0-9a-fA-F]{64})\b/i
const WORD_TOKEN = /^[a-z]{3,8}$/

function looksLikeWifKey(text) {
  return text
    .trim()
    .split(/\s+/)
    .some((token) => WIF_PATTERN.test(token))
}

function looksLikeLabeledPrivateKey(text) {
  return HEX64_WITH_KEY_CONTEXT.test(text)
}

function looksLikeSeedPhrase(text) {
  // Check line-by-line so a seed phrase on its own line inside a longer,
  // punctuated message is still caught — but never recurse on a line that
  // is identical to what we were just given (a single-line input with no
  // newline must be handled as a terminal case, not fed back into itself).
  const lines = text.includes('\n') ? text.split(/\r?\n/) : [text]
  for (const line of lines) {
    if (/[.,!?;:"']/.test(line)) continue
    const tokens = line.trim().split(/\s+/).filter(Boolean)
    if (tokens.length !== 12 && tokens.length !== 24) continue
    if (tokens.every((t) => WORD_TOKEN.test(t) && t === t.toLowerCase())) return true
  }
  return false
}

/**
 * Check submitted content for real key material. Returns
 * { isBlocked, reason }. Never logs or echoes the matched text itself.
 */
export function checkContent(text) {
  if (!text) return { isBlocked: false, reason: null }

  if (looksLikeWifKey(text)) {
    return {
      isBlocked: true,
      reason: 'Input appears to contain a private key (WIF format). Sentinel never processes or stores private keys.',
    }
  }
  if (looksLikeLabeledPrivateKey(text)) {
    return {
      isBlocked: true,
      reason: 'Input appears to contain a labeled private key. Sentinel never processes or stores private keys.',
    }
  }
  if (looksLikeSeedPhrase(text)) {
    return {
      isBlocked: true,
      reason: 'Input appears to contain a 12- or 24-word seed phrase. Sentinel never processes or stores recovery phrases.',
    }
  }
  return { isBlocked: false, reason: null }
}
