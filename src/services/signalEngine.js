// Satoshi Sentinel — local signal extraction engine.
//
// Everything in this file runs entirely in the browser, on the exact text
// the user pasted. Nothing here makes a network request, calls an AI
// model, or checks anything against the blockchain. It produces a
// normalized analysis object built only from local, deterministic
// heuristics — the same input always produces the same output.
//
// This is evidence, not a verdict: findings describe what pattern was
// observed and why that pattern is commonly associated with risk. A later
// phase can layer blockchain lookups and AI interpretation on top of this
// without changing this shape.

import { makeFinding } from '../utils/detectors/findings.js'
import { computeLocalScore } from '../utils/detectors/scoring.js'
import { analyzeMessageText } from '../utils/detectors/messageDetectors.js'
import {
  classifyAddress,
  extractBitcoinAddresses,
  buildAddressFindings,
} from '../utils/detectors/bitcoinAddress.js'
import { parseUrl, extractUrls, buildUrlFindings } from '../utils/detectors/urlAnalyzer.js'
import { parseNostrInput, buildNostrFindings, extractNostrPubkeys } from '../utils/detectors/nostrParser.js'

function emptyExtracted() {
  return { bitcoin_addresses: [], urls: [], nostr_pubkeys: [] }
}

function analyzeMessage(content) {
  if (!content) {
    return { signals: [], findings: [], extracted: emptyExtracted() }
  }
  const result = analyzeMessageText(content)
  return result
}

function analyzeAddress(content) {
  if (!content) return { signals: [], findings: [], extracted: emptyExtracted() }

  // The primary address is whatever the whole trimmed input is; we also
  // scan for any additional address-shaped tokens in case extra text was
  // pasted alongside it.
  const primary = classifyAddress(content)
  const scanned = extractBitcoinAddresses(content)
  const all = scanned.length > 0 ? scanned : [primary]

  const findings = buildAddressFindings(all, { context: 'submitted address' })
  const signals = all.map((a) => (a.isValidFormat ? 'bitcoin_address_valid_format' : 'bitcoin_address_malformed'))

  return {
    signals: Array.from(new Set(signals)),
    findings,
    extracted: {
      bitcoin_addresses: all.map((a) => a.address),
      urls: [],
      nostr_pubkeys: [],
    },
  }
}

function analyzeUrl(content) {
  if (!content) return { signals: [], findings: [], extracted: emptyExtracted() }

  const primary = parseUrl(content)
  const scanned = extractUrls(content)
  const all = scanned.length > 0 ? scanned : primary ? [primary] : []

  if (all.length === 0) {
    return {
      signals: ['url_unparseable'],
      findings: [
        makeFinding({
          type: 'url_unparseable',
          severity: 'medium',
          title: 'Input could not be parsed as a URL',
          description: 'The submitted content does not structurally resemble a URL Sentinel can parse.',
          evidence: content.slice(0, 120),
        }),
      ],
      extracted: emptyExtracted(),
    }
  }

  const findings = all.flatMap((u) => buildUrlFindings(u, { context: 'submitted URL' }))
  if (findings.length === 0) {
    findings.push(
      makeFinding({
        type: 'url_no_flags',
        severity: 'low',
        title: 'No structural red flags detected',
        description: 'The URL structure does not match any of the local heuristic patterns Sentinel currently checks (shorteners, lookalike domains, raw IP hosts, punycode, insecure protocol). This does not confirm the destination is safe.',
        evidence: all[0].hostname,
      })
    )
  }

  const signals = Array.from(new Set(findings.map((f) => f.type)))

  return {
    signals,
    findings,
    extracted: {
      bitcoin_addresses: [],
      urls: all.map((u) => u.original),
      nostr_pubkeys: [],
    },
  }
}

function analyzeNostr(content) {
  if (!content) return { signals: [], findings: [], extracted: emptyExtracted() }

  const parsed = parseNostrInput(content)
  const findings = buildNostrFindings(parsed)
  const signals = Array.from(new Set(findings.map((f) => f.type)))

  const extracted = emptyExtracted()

  if (parsed.isEvent) {
    if (parsed.pubkey) extracted.nostr_pubkeys.push(parsed.pubkey)
    extracted.bitcoin_addresses.push(...parsed.addressesInContent.map((a) => a.address))

    // Content and 'r' tags can reference the same URL — dedupe by hostname+path
    // before either extracting or building findings from it.
    const seenUrlKey = new Set()
    const dedupedUrls = []
    for (const u of [...parsed.urlsInContent, ...parsed.urlsInTags]) {
      const key = u.hostname + u.pathname
      if (seenUrlKey.has(key)) continue
      seenUrlKey.add(key)
      dedupedUrls.push(u)
    }
    extracted.urls.push(...dedupedUrls.map((u) => u.original))

    if (parsed.addressesInContent.length > 0) {
      findings.push(...buildAddressFindings(parsed.addressesInContent, { context: 'event content' }))
      signals.push('bitcoin_address_in_event')
    }
    if (dedupedUrls.length > 0) {
      findings.push(...dedupedUrls.flatMap((u) => buildUrlFindings(u, { context: 'event content or tags' })))
      signals.push('url_in_event')
    }
  } else if (parsed.identifierType === 'npub' && parsed.pubkeyHex) {
    extracted.nostr_pubkeys.push(parsed.raw)
  } else {
    // Even a non-JSON, non-bech32 blob might still contain embedded
    // npubs, addresses, or URLs worth surfacing.
    const pubkeys = extractNostrPubkeys(content)
    const addresses = extractBitcoinAddresses(content)
    const urls = extractUrls(content)
    extracted.nostr_pubkeys.push(...pubkeys.map((p) => p.npub))
    extracted.bitcoin_addresses.push(...addresses.map((a) => a.address))
    extracted.urls.push(...urls.map((u) => u.original))
  }

  return { signals: Array.from(new Set(signals)), findings, extracted }
}

const ANALYZERS = {
  message: analyzeMessage,
  address: analyzeAddress,
  url: analyzeUrl,
  nostr: analyzeNostr,
}

/**
 * Run the full local signal extraction pipeline on a piece of content.
 *
 * @param {{ type: 'message'|'address'|'nostr'|'url', content: string }} input
 * @returns {{
 *   input_type: string,
 *   signals: string[],
 *   extracted: { bitcoin_addresses: string[], urls: string[], nostr_pubkeys: string[] },
 *   local_score: number,
 *   findings: Array<{type:string,severity:string,title:string,description:string,evidence:string}>,
 *   meta: { analyzed_at: string, raw_input_preview: string }
 * }}
 */
export function analyzeInput({ type, content }) {
  const trimmed = (content || '').trim()
  const analyzer = ANALYZERS[type] || (() => ({ signals: [], findings: [], extracted: emptyExtracted() }))
  const { signals, findings, extracted } = analyzer(trimmed)
  const local_score = computeLocalScore(findings)

  return {
    input_type: type,
    signals,
    extracted,
    local_score,
    findings,
    meta: {
      analyzed_at: new Date().toISOString(),
      raw_input_preview: trimmed.slice(0, 400),
    },
  }
}
