// Structural Bitcoin address analysis only. This never contacts a node,
// an indexer, or any external API — it checks the string's shape against
// known encodings (base58 legacy formats, bech32/bech32m SegWit formats)
// and, for bech32, verifies the built-in checksum. It never confirms an
// address has been used, has a balance, or exists on the actual chain.

import { bech32Decode, convertBits } from './bech32.js'
import { makeFinding } from './findings.js'

const BASE58_LEGACY = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/
const BASE58_TESTNET = /^[2mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
const BECH32_CANDIDATE = /^(bc1|tb1|bcrt1)[a-z0-9]{6,87}$/i

// Loose scanner pattern used to find address-shaped tokens inside free text.
const ADDRESS_SCAN_PATTERN =
  /\b(bc1[a-z0-9]{6,87}|tb1[a-z0-9]{6,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|[2mn][a-km-zA-HJ-NP-Z1-9]{25,34})\b/gi

/**
 * Classify a single candidate string as a Bitcoin address. Returns a
 * structural report; `checksumVerified` is only ever true for bech32/
 * bech32m addresses, since that's the only check this module can do
 * without a full base58check (SHA-256) implementation.
 */
export function classifyAddress(raw) {
  const address = (raw || '').trim()

  if (BECH32_CANDIDATE.test(address)) {
    const decoded = bech32Decode(address)
    if (!decoded) {
      return {
        address,
        isValidFormat: false,
        type: 'Unrecognized SegWit-style address',
        network: 'unknown',
        checksumVerified: false,
        notes: 'Starts like a bech32 address but the checksum does not verify.',
      }
    }
    const network = decoded.hrp === 'bc' ? 'mainnet' : decoded.hrp === 'tb' ? 'testnet' : decoded.hrp === 'bcrt' ? 'regtest' : 'unknown'
    const witnessVersion = decoded.data[0]
    const program = convertBits(decoded.data.slice(1), 5, 8, false)
    const programLen = program ? program.length : -1

    let type = 'Unknown SegWit version'
    if (witnessVersion === 0 && programLen === 20) type = 'Native SegWit (P2WPKH)'
    else if (witnessVersion === 0 && programLen === 32) type = 'Native SegWit script (P2WSH)'
    else if (witnessVersion === 1 && programLen === 32) type = 'Taproot (P2TR)'

    const expectedEncoding = witnessVersion === 0 ? 'bech32' : 'bech32m'
    const encodingMatches = decoded.encoding === expectedEncoding

    return {
      address,
      isValidFormat: Boolean(program) && encodingMatches,
      type,
      network,
      checksumVerified: Boolean(program) && encodingMatches,
      notes: encodingMatches
        ? 'Bech32 checksum verified locally against the address string.'
        : `Checksum uses ${decoded.encoding} but witness version ${witnessVersion} expects the other variant.`,
    }
  }

  if (BASE58_LEGACY.test(address)) {
    const type = address[0] === '1' ? 'Legacy (P2PKH)' : 'Script / multisig-compatible (P2SH)'
    return {
      address,
      isValidFormat: true,
      type,
      network: 'mainnet',
      checksumVerified: false,
      notes: 'Matches base58 legacy format and charset. Base58check digit-checksum is not verified in this phase.',
    }
  }

  if (BASE58_TESTNET.test(address)) {
    const type = address[0] === '2' ? 'Script / multisig-compatible (P2SH, testnet)' : 'Legacy (P2PKH, testnet)'
    return {
      address,
      isValidFormat: true,
      type,
      network: 'testnet',
      checksumVerified: false,
      notes: 'Matches base58 testnet format and charset. Base58check digit-checksum is not verified in this phase.',
    }
  }

  return {
    address,
    isValidFormat: false,
    type: 'Unrecognized format',
    network: 'unknown',
    checksumVerified: false,
    notes: 'Does not match any known Bitcoin address encoding.',
  }
}

/**
 * Scan free text for address-shaped tokens and classify each one found.
 * Returns only tokens that at least loosely match a known address shape.
 */
export function extractBitcoinAddresses(text) {
  if (!text) return []
  const matches = text.match(ADDRESS_SCAN_PATTERN) || []
  const seen = new Set()
  const results = []
  for (const m of matches) {
    if (seen.has(m)) continue
    seen.add(m)
    results.push(classifyAddress(m))
  }
  return results
}

/**
 * Build findings for a batch of already-classified addresses. Used both
 * for a dedicated "address" analysis and for addresses embedded in a
 * message.
 */
export function buildAddressFindings(classified, { context = 'submitted content' } = {}) {
  const findings = []
  for (const c of classified) {
    if (c.isValidFormat) {
      findings.push(
        makeFinding({
          type: 'bitcoin_address_detected',
          severity: 'low',
          title: 'Bitcoin address detected',
          description: `A structurally valid ${c.type} address (${c.network}) was found in the ${context}. This is a neutral, factual observation — presence of an address is not itself a risk signal.`,
          evidence: c.address,
        })
      )
    } else {
      findings.push(
        makeFinding({
          type: 'bitcoin_address_malformed',
          severity: 'medium',
          title: 'Address-like string does not match a known format',
          description: `A string resembling a Bitcoin address was found in the ${context}, but ${c.notes.toLowerCase()}`,
          evidence: c.address,
        })
      )
    }
  }
  return findings
}
