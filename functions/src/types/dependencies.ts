import { IServerMemberRepository } from '../core/domain/repositories/IServerMemberRepository'
import { ICodeforcesService } from '../core/domain/services/ICodeforcesService'
import { CodeforcesService } from '../core/infrastructure/repositories/codeforces/CodeforcesService'
import { ServerMemberRepository } from '../core/infrastructure/repositories/firestore/ServerMemberRepository'

export const serverMemberRepository: IServerMemberRepository =
  new ServerMemberRepository()
export const codeforcesService: ICodeforcesService = new CodeforcesService()
