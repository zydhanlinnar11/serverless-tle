import { ServerMember } from '../entities/ServerMember'
import { CodeforcesProblem } from '../services/ICodeforcesService'
import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'

export type CodeforcesHandleChangeRequest = {
  readonly newHandle: CodeforcesHandle
  readonly problem: Pick<CodeforcesProblem, 'contestId' | 'index'>
  readonly timestamp: Date
}

export interface IServerMemberRepository {
  find: (
    serverId: ServerId,
    memberId: ServerMemberId
  ) => Promise<ServerMember | null>
  update: (serverMember: ServerMember) => Promise<void>
  findLatestCodeforcesHandleChangeRequest: (
    serverMember: ServerMember
  ) => Promise<CodeforcesHandleChangeRequest | null>
}
