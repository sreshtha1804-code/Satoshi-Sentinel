// Built-in demo examples. These are loaded into the Analyze console and
// run through the exact same local signal engine as any pasted input —
// nothing here is a pre-baked or faked result. The examples exist to make
// the engine's behavior easy to see, not to demonstrate an AI output.

export const DEMO_EXAMPLES = [
  {
    id: 'fake-giveaway',
    label: 'Fake Bitcoin giveaway',
    type: 'message',
    content:
      "🎉 BITCOIN GIVEAWAY 🎉 To celebrate 10 years, we're giving away 5,000 BTC to our community! " +
      'Send any amount from 0.01 to 5 BTC to the address below and receive double back within 30 minutes — guaranteed. ' +
      'This offer expires in 24 hours, so act now before it\'s gone! ' +
      'Send bitcoin to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh to claim your reward.',
  },
  {
    id: 'suspicious-nostr',
    label: 'Suspicious Nostr message',
    type: 'nostr',
    content: JSON.stringify(
      {
        id: 'not-a-real-hex-id',
        pubkey: 'a1b2c3',
        created_at: 4102444800,
        kind: 1,
        tags: [['r', 'http://nostr-wallet-verify.support-secure.info/claim']],
        content:
          'Official Nostr team here — your relay access will be suspended immediately unless you verify your account. ' +
          'Visit http://nostr-wallet-verify.support-secure.info/claim and confirm your recovery phrase to keep access.',
      },
      null,
      2
    ),
  },
  {
    id: 'seed-phrase-phishing',
    label: 'Seed phrase phishing message',
    type: 'message',
    content:
      'Hi, this is the Ledger support team. We detected unusual login activity on your wallet. ' +
      'To prevent your account from being locked in the next 24 hours, please reply with your 24-word recovery phrase ' +
      'so we can verify your identity and restore secure access. You can also message our support agent directly on Telegram: t.me/ledger_support_help',
  },
  {
    id: 'normal-btc-discussion',
    label: 'Normal Bitcoin transaction discussion',
    type: 'message',
    content:
      "Hey, just sent my share for dinner over on-chain since Lightning was acting up for me. " +
      'Sent it to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq — should land in a couple confirmations. ' +
      'Let me know when you see it, no rush.',
  },
]

export function getDemoExampleById(id) {
  return DEMO_EXAMPLES.find((d) => d.id === id) || null
}
