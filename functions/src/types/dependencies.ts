import { IServerMemberRepository } from '../core/domain/repositories/IServerMemberRepository'
import { ServerMemberRepository } from '../core/infrastructure/repositories/firestore/ServerMemberRepository'

export const serverMemberRepository: IServerMemberRepository =
  new ServerMemberRepository()
