// Local Nostr event parsing. Reads NIP-01 event JSON structurally and
// extracts references (pubkeys, e/p tags, URLs, embedded Bitcoin
// addresses). It does not connect to any relay and does not
// cryptographically verify the event signature — that requires secp256k1
// Schnorr verification, which is out of scope for this phase and is
// called out explicitly rather than silently skipped.

import { bech32Decode, convertBits } from './bech32.js'
import { makeFinding } from './findings.js'
import { extractUrls } from './urlAnalyzer.js'
import { extractBitcoinAddresses } from './bitcoinAddress.js'

const HEX64 = /^[0-9a-f]{64}$/i
const NPUB_PATTERN = /\bnpub1[a-z0-9]{20,90}\b/gi
const NOTE_PATTERN = /\bnote1[a-z0-9]{20,90}\b/gi
const NIP19_COMPLEX_PATTERN = /\b(nevent1|nprofile1|naddr1)[a-z0-9]{20,200}\b/gi

const KNOWN_KINDS = {
  0: 'Metadata (profile)',
  1: 'Text note',
  3: 'Contact list',
  4: 'Encrypted direct message',
  5: 'Event deletion',
  6: 'Repost',
  7: 'Reaction',
  9734: 'Zap request',
  9735: 'Zap receipt',
  10002: 'Relay list',
  30023: 'Long-form content',
}

function decodeBech32ToHex(token, expectedHrp) {
  const decoded = bech32Decode(token)
  if (!decoded || decoded.hrp !== expectedHrp) return null
  const bytes = convertBits(decoded.data, 5, 8, false)
  if (!bytes) return null
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Extract and validate npub identifiers from free text, returning their
 * decoded hex pubkey alongside the original bech32 string.
 */
export function extractNostrPubkeys(text) {
  if (!text) return []
  const tokens = text.match(NPUB_PATTERN) || []
  const seen = new Set()
  const results = []
  for (const t of tokens) {
    if (seen.has(t)) continue
    seen.add(t)
    const hex = decodeBech32ToHex(t, 'npub')
    results.push({ npub: t, hex, checksumVerified: Boolean(hex) })
  }
  return results
}

/**
 * Parse a raw string as a Nostr event. Tries JSON first (a full NIP-01
 * event object); if that fails, checks whether the whole input is itself
 * a bech32 NIP-19 identifier (npub/note/etc).
 */
export function parseNostrInput(raw) {
  const trimmed = (raw || '').trim()

  let parsedJson = null
  try {
    parsedJson = JSON.parse(trimmed)
  } catch {
    parsedJson = null
  }

  if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
    return analyzeEventObject(parsedJson, trimmed)
  }

  // Not JSON — see if it's a bare NIP-19 identifier instead.
  if (/^npub1/i.test(trimmed)) {
    const hex = decodeBech32ToHex(trimmed, 'npub')
    return {
      isEvent: false,
      identifierType: 'npub',
      pubkeyHex: hex,
      checksumVerified: Boolean(hex),
      raw: trimmed,
    }
  }
  if (/^note1/i.test(trimmed)) {
    const hex = decodeBech32ToHex(trimmed, 'note')
    return {
      isEvent: false,
      identifierType: 'note',
      eventIdHex: hex,
      checksumVerified: Boolean(hex),
      raw: trimmed,
    }
  }
  if (/^(nevent1|nprofile1|naddr1)/i.test(trimmed)) {
    return {
      isEvent: false,
      identifierType: 'complex-nip19',
      checksumVerified: null,
      raw: trimmed,
    }
  }

  return { isEvent: false, identifierType: 'unrecognized', raw: trimmed }
}

function analyzeEventObject(evt, rawText) {
  const tags = Array.isArray(evt.tags) ? evt.tags : []
  const pTags = tags.filter((t) => Array.isArray(t) && t[0] === 'p').map((t) => t[1])
  const eTags = tags.filter((t) => Array.isArray(t) && t[0] === 'e').map((t) => t[1])
  const rTags = tags.filter((t) => Array.isArray(t) && t[0] === 'r').map((t) => t[1])

  const content = typeof evt.content === 'string' ? evt.content : ''
  const urlsInContent = extractUrls(content)
  const urlsInTags = rTags.map(parseAsUrlSafe).filter(Boolean)
  const addressesInContent = extractBitcoinAddresses(content)

  return {
    isEvent: true,
    id: typeof evt.id === 'string' ? evt.id : null,
    idValidHex: typeof evt.id === 'string' && HEX64.test(evt.id),
    pubkey: typeof evt.pubkey === 'string' ? evt.pubkey : null,
    pubkeyValidHex: typeof evt.pubkey === 'string' && HEX64.test(evt.pubkey),
    kind: typeof evt.kind === 'number' ? evt.kind : null,
    kindLabel: typeof evt.kind === 'number' ? KNOWN_KINDS[evt.kind] || 'Unrecognized kind' : null,
    createdAt: typeof evt.created_at === 'number' ? evt.created_at : null,
    hasSig: typeof evt.sig === 'string' && evt.sig.length > 0,
    content,
    tags,
    pTags,
    eTags,
    urlsInContent,
    urlsInTags,
    addressesInContent,
    rawText,
  }
}

function parseAsUrlSafe(value) {
  try {
    // reuse extractUrls' single-string parsing behaviour via a 1-item scan
    const found = extractUrls(String(value))
    return found[0] || null
  } catch {
    return null
  }
}

/**
 * Build findings for a parsed Nostr input (event object or bare NIP-19
 * identifier).
 */
export function buildNostrFindings(parsed) {
  const findings = []

  if (!parsed.isEvent) {
    if (parsed.identifierType === 'npub') {
      findings.push(
        makeFinding({
          type: 'nostr_identifier_parsed',
          severity: 'low',
          title: parsed.checksumVerified ? 'Valid npub identifier' : 'npub failed checksum verification',
          description: parsed.checksumVerified
            ? 'The input is a single npub public-key identifier with a valid bech32 checksum.'
            : 'The input looks like an npub identifier, but its bech32 checksum does not verify — it may be mistyped or corrupted.',
          evidence: parsed.raw,
        })
      )
    } else if (parsed.identifierType === 'unrecognized') {
      findings.push(
        makeFinding({
          type: 'nostr_unrecognized_input',
          severity: 'medium',
          title: 'Input is not a recognized Nostr event or identifier',
          description: 'The submitted content is neither valid NIP-01 event JSON nor a recognized NIP-19 identifier (npub/note/nevent/nprofile/naddr).',
          evidence: parsed.raw.slice(0, 120),
        })
      )
    }
    return findings
  }

  if (!parsed.hasSig) {
    findings.push(
      makeFinding({
        type: 'nostr_missing_signature',
        severity: 'medium',
        title: 'Event has no signature field',
        description: 'A valid Nostr event should carry a "sig" field. Its absence means this event cannot be authenticated at all, structurally or cryptographically.',
        evidence: 'sig field missing or empty',
      })
    )
  } else {
    findings.push(
      makeFinding({
        type: 'nostr_signature_not_verified',
        severity: 'low',
        title: 'Signature present but not cryptographically verified',
        description: 'A "sig" field is present, but this phase only checks for its presence — it does not perform secp256k1 Schnorr signature verification.',
        evidence: 'sig field present (not shown)',
      })
    )
  }

  if (!parsed.pubkeyValidHex) {
    findings.push(
      makeFinding({
        type: 'nostr_malformed_pubkey',
        severity: 'medium',
        title: 'Pubkey is not a valid 64-character hex string',
        description: 'A Nostr event pubkey should be 64 lowercase hex characters. This one does not match that structure.',
        evidence: String(parsed.pubkey ?? 'missing'),
      })
    )
  }

  if (parsed.kind !== null && !KNOWN_KINDS[parsed.kind]) {
    findings.push(
      makeFinding({
        type: 'nostr_unrecognized_kind',
        severity: 'low',
        title: 'Uncommon or unrecognized event kind',
        description: `Kind ${parsed.kind} is not among the commonly recognized Nostr event kinds checked in this phase. This is informational, not necessarily a risk signal.`,
        evidence: `kind: ${parsed.kind}`,
      })
    )
  }

  if (parsed.createdAt !== null) {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const oneDay = 86400
    if (parsed.createdAt > nowSeconds + oneDay) {
      findings.push(
        makeFinding({
          type: 'nostr_future_timestamp',
          severity: 'medium',
          title: 'Event timestamp is in the future',
          description: 'The created_at timestamp is more than a day ahead of the current time, which is unusual for a genuinely created event.',
          evidence: `created_at: ${parsed.createdAt}`,
        })
      )
    }
  }

  return findings
}
