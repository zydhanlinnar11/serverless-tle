import { ServerMember } from '../entities/ServerMember'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'

export interface IServerMemberRepository {
  find: (
    serverId: ServerId,
    memberId: ServerMemberId
  ) => Promise<ServerMember | null>
  update: (
    serverMember: ServerMember,
    applicationId: string,
    interactionToken: string
  ) => Promise<void>
}
