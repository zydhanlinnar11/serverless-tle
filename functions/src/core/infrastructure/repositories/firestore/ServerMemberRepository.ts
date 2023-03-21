import { ServerMember } from '../../../domain/entities/ServerMember'
import { IServerMemberRepository } from '../../../domain/repositories/IServerMemberRepository'
import { ServerId } from '../../../domain/valueobjects/ServerId'
import { ServerMemberId } from '../../../domain/valueobjects/ServerMemberId'
import { firestore } from './db'
import { FieldValue } from '@google-cloud/firestore'

export class ServerMemberRepository implements IServerMemberRepository {
  static SERVER_MEMBER_COLLECTION = 'server_members'
  static DOMAIN_EVENT_COLLECTION = 'domain_events'

  private getDocRef = (serverId: ServerId, memberId: ServerMemberId) =>
    firestore
      .collection(ServerMemberRepository.SERVER_MEMBER_COLLECTION)
      .doc(`${serverId.toString()}-${memberId.toString()}`)

  find: (
    serverId: ServerId,
    memberId: ServerMemberId
  ) => Promise<ServerMember | null> = async (serverId, memberId) => {
    const serverMemberRef = this.getDocRef(serverId, memberId)
    console.info(
      `Retrieving server member ${serverId.toString()}-${memberId.toString()} from firestore!`
    )
    const doc = await serverMemberRef.get()
    const data = doc.data()

    if (!doc.exists || !data) {
      console.info(
        `Server member retrieved ${serverId.toString()}-${memberId.toString()} not found!`
      )
      return null
    }
    console.info(
      `Server member retrieved ${serverId.toString()}-${memberId.toString()} from firestore!`
    )

    return new ServerMember(
      memberId,
      serverId,
      data.codeforces?.handle ?? null,
      data.codeforces?.handle_verified ?? false
    )
  }

  update: (
    serverMember: ServerMember,
    applicationId: string,
    interactionToken: string
  ) => Promise<void> = async (
    serverMember,
    applicationId,
    interactionToken
  ) => {
    await firestore.runTransaction(async (transaction) => {
      const serverMemberRef = this.getDocRef(
        serverMember.getServerId(),
        serverMember.getId()
      )

      transaction.set(
        serverMemberRef,
        {
          codeforces: {
            handle: serverMember.getHandle(),
            handle_verified: serverMember.isHandleVerified()
          }
        },
        { merge: true }
      )
      const events = serverMember.getUnpublishedEvents()
      events.forEach((event) => {
        const eventRef = firestore
          .collection(ServerMemberRepository.DOMAIN_EVENT_COLLECTION)
          .doc()
        const eventData = JSON.parse(event.toJSONString())
        transaction.set(eventRef, {
          ...eventData,
          interaction_token: interactionToken,
          application_id: applicationId,
          timestamp: FieldValue.serverTimestamp()
        })
      })
      serverMember.clearUnpublishedEvents()
    })
  }
}
