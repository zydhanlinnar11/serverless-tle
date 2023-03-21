import nacl from 'tweetnacl'
import { Buffer } from 'buffer'

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
        status: 500
      }
    )

  const signature = req.headers.get('X-Signature-Ed25519')
  const timestamp = req.headers.get('X-Signature-Timestamp')
  const body = await req.json()

  if (!signature || !timestamp || !body)
    return new Response(
      JSON.stringify({ message: 'missing request signature' }),
      { status: 401 }
    )

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + JSON.stringify(body)),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  )

  if (!isVerified)
    return new Response(
      JSON.stringify({ message: 'invalid request signature' }),
      { status: 401 }
    )

  if (body.type === 1)
    return new Response(JSON.stringify({ type: 1 }), { status: 200 })
}
