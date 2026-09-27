// Local, dependency-free implementation of the Bech32 / Bech32m encodings
// defined in BIP-173 and BIP-350. Used to structurally validate SegWit and
// Taproot Bitcoin addresses, and Nostr NIP-19 identifiers (npub/note),
// entirely offline. This performs checksum math only — it never contacts
// a network and never confirms anything against the blockchain.

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const BECH32_CONST = 1
const BECH32M_CONST = 0x2bc830a3

function polymod(values) {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const top = chk >>> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) {
      if ((top >>> i) & 1) chk ^= GEN[i]
    }
  }
  return chk >>> 0
}

function hrpExpand(hrp) {
  const out = []
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) >>> 5)
  out.push(0)
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) & 31)
  return out
}

function verifyChecksum(hrp, data) {
  const combined = polymod(hrpExpand(hrp).concat(data))
  if (combined === BECH32_CONST) return 'bech32'
  if (combined === BECH32M_CONST) return 'bech32m'
  return null
}

/**
 * Decode a bech32 or bech32m string. Returns null if the string is not
 * well-formed or the checksum does not verify — this is a pure, local
 * structural check.
 */
export function bech32Decode(input) {
  if (typeof input !== 'string' || input.length < 8 || input.length > 90) return null
  if (input !== input.toLowerCase() && input !== input.toUpperCase()) return null
  const str = input.toLowerCase()
  const pos = str.lastIndexOf('1')
  if (pos < 1 || pos + 7 > str.length) return null
  const hrp = str.slice(0, pos)
  const dataPart = str.slice(pos + 1)
  const data = []
  for (const ch of dataPart) {
    const idx = CHARSET.indexOf(ch)
    if (idx === -1) return null
    data.push(idx)
  }
  const encoding = verifyChecksum(hrp, data)
  if (!encoding) return null
  return { hrp, data: data.slice(0, -6), encoding }
}

/**
 * Convert an array of `fromBits`-bit groups into `toBits`-bit groups
 * (used to turn the bech32 5-bit data part into 8-bit witness-program
 * bytes). Returns null on invalid padding.
 */
export function convertBits(data, fromBits, toBits, pad) {
  let acc = 0
  let bits = 0
  const out = []
  const maxv = (1 << toBits) - 1
  for (const value of data) {
    if (value < 0 || value >>> fromBits !== 0) return null
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      out.push((acc >>> bits) & maxv)
    }
  }
  if (pad) {
    if (bits > 0) out.push((acc << (toBits - bits)) & maxv)
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null
  }
  return out
}
