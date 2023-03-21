import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nacl from 'tweetnacl'
import { handleInteraction } from './InteractionHandler'

admin.initializeApp()
const FUNCTION_REGION = 'asia-southeast1'

export const getApplicationEnvironment = () =>
  process.env.NODE_ENV ?? 'production'
export const isDevelopment = () => getApplicationEnvironment() === 'development'

exports.interactions = functions
  .region(FUNCTION_REGION)
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ message: 'method not allowed!' })
      return
    }

    const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
    if (!PUBLIC_KEY) {
      res.status(500).json({
        message: isDevelopment()
          ? 'discord interaction public key is not set!'
          : 'internal server error'
      })
      return
    }

    const signature = req.get('X-Signature-Ed25519')
    const timestamp = req.get('X-Signature-Timestamp')
    const body = req.rawBody

    if (!signature || !timestamp || !body) {
      res.status(401).json({ message: 'missing request signature' })
      return
    }

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    )

    if (!isVerified) {
      res.status(401).json({ message: 'invalid request signature' })
      return
    }

    const interaction = JSON.parse(body.toString())
    if (interaction.type === 1) {
      res.json({ type: 1 })
      return
    }

    await admin.firestore().collection('interactions').doc().set(interaction)
    res.json({
      type: 5,
      data: {}
    })
    return
  })

exports.handleInteraction = functions
  .region(FUNCTION_REGION)
  .firestore.document('/interactions/{interactionId}')
  .onCreate((snap) => {
    if (snap.data().handled) return
    handleInteraction(snap.data() as any).then(() =>
      snap.ref.update({ handled: true })
    )
  })
