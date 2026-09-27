// Local heuristic analysis of free-form message text. Every detector here
// is a plain pattern match against the text the user pasted — nothing is
// sent anywhere, and nothing here claims certainty. Findings describe what
// was observed and why that pattern is commonly associated with risk;
// they do not assert that the message is fraudulent.

import { makeFinding } from './findings.js'
import { extractUrls, buildUrlFindings } from './urlAnalyzer.js'
import { extractBitcoinAddresses, buildAddressFindings } from './bitcoinAddress.js'
import { extractNostrPubkeys } from './nostrParser.js'

function firstMatchSnippet(text, pattern, maxLen = 90) {
  const m = text.match(pattern)
  if (!m) return null
  const idx = m.index ?? text.indexOf(m[0])
  const start = Math.max(0, idx - 15)
  const end = Math.min(text.length, idx + m[0].length + 30)
  const snippet = text.slice(start, end).trim()
  return snippet.length > maxLen ? `${snippet.slice(0, maxLen)}…` : snippet
}

// Each entry: id/type, severity, title, description, and the regex used to
// detect it. `global` flag not required — firstMatchSnippet re-matches.
const PATTERN_DETECTORS = [
  {
    type: 'urgency_language',
    severity: 'medium',
    title: 'Urgency or time-pressure language',
    description: 'The message uses language designed to create time pressure, which discourages the careful verification a legitimate request can usually withstand.',
    pattern: /\b(act now|immediately|urgent(ly)?|right away|as soon as possible|24 hours?|expires? (soon|today|in)|final notice|account (will be|has been) (suspend|lock|restrict)|limited time|before it'?s too late|last chance)\b/i,
  },
  {
    type: 'giveaway_reward_claim',
    severity: 'high',
    title: 'Giveaway or reward claim',
    description: 'The message references a giveaway, airdrop, or reward. Unsolicited crypto giveaways are one of the most common scam formats.',
    pattern: /\b(giveaway|airdrop|you'?ve won|you have won|claim your (reward|prize|bonus)|free bitcoin|free btc|double your (btc|bitcoin|crypto|money)|lucky winner)\b/i,
  },
  {
    type: 'seed_phrase_request',
    severity: 'high',
    title: 'Seed phrase request',
    description: 'The message asks for a recovery/seed phrase. No legitimate service, wallet, or support team ever needs this — it is the single most damaging piece of information you can hand over.',
    pattern: /\b(seed phrase|recovery phrase|mnemonic( phrase)?|12[- ]word|24[- ]word)\b/i,
  },
  {
    type: 'private_key_request',
    severity: 'high',
    title: 'Private key request',
    description: 'The message asks for a private key, WIF, or keystore file. Handing this over gives immediate and irreversible control of the associated funds.',
    pattern: /\b(private key|priv(?:ate)? ?key|wif key|keystore file|export (your )?key)\b/i,
  },
  {
    type: 'credential_request',
    severity: 'high',
    title: 'Login credential or code request',
    description: 'The message asks for a password, login details, or a one-time verification code. Legitimate support channels do not need these to help you.',
    pattern: /\b(password|login details|log[- ]?in credentials|2fa code|two[- ]factor code|verification code|one[- ]time (code|passcode)|otp\b)/i,
  },
  {
    type: 'impersonation_indicator',
    severity: 'high',
    title: 'Impersonation of official support',
    description: 'The message presents itself as official support or staff from a known service. Real support teams generally do not initiate contact through DMs asking you to act on your wallet.',
    pattern: /\b(official (support|team)|this is (coinbase|binance|kraken|ledger|metamask|trezor) support|customer (support|service) team|verified (agent|account)|wallet support team)\b/i,
  },
  {
    type: 'unrealistic_returns',
    severity: 'high',
    title: 'Unrealistic investment return claim',
    description: 'The message promises guaranteed or outsized returns. No legitimate investment can guarantee profit, let alone doubling or multiplying funds quickly.',
    pattern: /\b(guaranteed (return|profit)s?|100% profit|risk[- ]free (investment|return)|\d{2,}x returns?|double your (money|investment|btc|bitcoin)|triple your)\b/i,
  },
  {
    type: 'send_funds_request',
    severity: 'high',
    title: 'Direct request to send funds',
    description: 'The message directly asks the reader to send cryptocurrency, most often framed as a "verification" or "processing" step.',
    pattern: /\b(send (bitcoin|btc|crypto|funds|payment) to|please send \d|small (fee|amount|deposit) to (verify|unlock|process)|make a payment to)\b/i,
  },
  {
    type: 'platform_migration_request',
    severity: 'medium',
    title: 'Request to move the conversation off-platform',
    description: 'The message asks to continue on Telegram, Discord, or WhatsApp. Moving to a less-moderated channel is a common step before a scam attempt escalates.',
    pattern: /\b(telegram\.me|t\.me\/|discord\.gg|join (my|our) telegram|message me on (telegram|whatsapp|discord)|add me on (telegram|whatsapp))\b/i,
  },
]

/**
 * Run every pattern detector against the message text and turn each hit
 * into a finding + a short signal id.
 */
function runPatternDetectors(text) {
  const signals = []
  const findings = []
  for (const d of PATTERN_DETECTORS) {
    if (d.pattern.test(text)) {
      signals.push(d.type)
      findings.push(
        makeFinding({
          type: d.type,
          severity: d.severity,
          title: d.title,
          description: d.description,
          evidence: firstMatchSnippet(text, d.pattern) || d.title,
        })
      )
    }
  }
  return { signals, findings }
}

/**
 * Full message analysis: pattern-based signals plus embedded Bitcoin
 * addresses, URLs, and Nostr pubkeys found within the text.
 */
export function analyzeMessageText(text) {
  const content = text || ''
  const { signals, findings } = runPatternDetectors(content)

  const addresses = extractBitcoinAddresses(content)
  const addressFindings = buildAddressFindings(addresses, { context: 'message' })
  if (addresses.length > 0) signals.push('bitcoin_address_in_message')

  const urls = extractUrls(content)
  const urlFindingLists = urls.map((u) => buildUrlFindings(u, { context: 'message' }))
  const urlFindings = urlFindingLists.flat()
  if (urls.length > 0) signals.push('url_in_message')

  const pubkeys = extractNostrPubkeys(content)

  // Escalate: a send-funds/payment request combined with an embedded
  // address is materially more actionable than either signal alone.
  const hasSendRequest = signals.includes('send_funds_request')
  const combinedFindings = [...findings, ...addressFindings, ...urlFindings]
  if (hasSendRequest && addresses.some((a) => a.isValidFormat)) {
    signals.push('funds_request_with_address')
    combinedFindings.push(
      makeFinding({
        type: 'funds_request_with_address',
        severity: 'high',
        title: 'Payment request paired with a ready-to-use address',
        description: 'The message both asks the reader to send funds and supplies a specific, structurally valid address to send them to — the combination that actually enables a transfer, not just the request in isolation.',
        evidence: addresses.find((a) => a.isValidFormat)?.address || '',
      })
    )
  }

  return {
    signals,
    findings: combinedFindings,
    extracted: {
      bitcoin_addresses: addresses.map((a) => a.address),
      urls: urls.map((u) => u.original),
      nostr_pubkeys: pubkeys.map((p) => p.npub),
    },
  }
}
