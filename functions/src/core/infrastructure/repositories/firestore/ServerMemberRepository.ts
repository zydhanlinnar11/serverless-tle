import { ServerMember } from '../../../domain/entities/ServerMember'
import { IServerMemberRepository } from '../../../domain/repositories/IServerMemberRepository'
import { ServerId } from '../../../domain/valueobjects/ServerId'
import { ServerMemberId } from '../../../domain/valueobjects/ServerMemberId'
import { firestore } from './db'

export class ServerMemberRepository implements IServerMemberRepository {
  static SERVER_MEMBER_COLLECTION = 'server_members'

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

  update: (serverMember: ServerMember) => Promise<void> = async (
    serverMember
  ) => {
    const serverMemberRef = this.getDocRef(
      serverMember.getServerId(),
      serverMember.getId()
    )
    await serverMemberRef.set(
      {
        codeforces: {
          handle: serverMember.getHandle(),
          handle_verified: serverMember.isHandleVerified()
        }
      },
      { merge: true }
    )
  }
}
