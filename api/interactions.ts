import nacl from 'tweetnacl'
import { Buffer } from 'buffer'
import {
  InteractionCallbackType,
  InteractionObject,
  InteractionResponse,
  InteractionType
} from '@/types/discord'
import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection } from 'firebase/firestore'

const firebaseApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIRESTORE_PROJECT_ID
})

const db = getFirestore(firebaseApp)

export const config = {
  runtime: 'edge',
  regions: ['ap-southeast-1']
}

export const getApplicationEnvironment = () =>
  process.env.NODE_ENV ?? 'production'
export const isDevelopment = () => getApplicationEnvironment() === 'development'

export default async (req: Request) => {
  if (req.method !== 'POST')
    return new Response(JSON.stringify({ message: 'method not allowed!' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405
    })

  const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
  if (!PUBLIC_KEY)
    return new Response(
      JSON.stringify({
        message: isDevelopment()
          ? 'discord interaction public key is not set!'
          : 'internal server error'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )

  const signature = req.headers.get('X-Signature-Ed25519')
  const timestamp = req.headers.get('X-Signature-Timestamp')
  const body: InteractionObject = await req.json()

  if (!signature || !timestamp || !body)
    return new Response(
      JSON.stringify({ message: 'missing request signature' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      }
    )

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + JSON.stringify(body)),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  )

  if (!isVerified)
    return new Response(
      JSON.stringify({ message: 'invalid request signature' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      }
    )

  if (body.type === InteractionType.PING)
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { 'Content-Type': 'application/json' }
    })

  const interactionResponse: InteractionResponse = {
    type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {}
  }
  await addDoc(collection(db, 'interactions'), body)
  return new Response(JSON.stringify(interactionResponse), {
    headers: { 'Content-Type': 'application/json' }
  })
}
