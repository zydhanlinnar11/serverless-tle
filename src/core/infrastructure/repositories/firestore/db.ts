import { Firestore } from '@google-cloud/firestore'

export const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
  credentials: JSON.parse(process.env.FIRESTORE_CREDENTIALS ?? '{}')
})
