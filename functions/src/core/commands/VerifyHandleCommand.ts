import {
  codeforcesService,
  serverMemberRepository
} from '../../types/dependencies'
import { InteractionCallbackData, InteractionObject } from '../../types/discord'
import { ServerMember } from '../domain/entities/ServerMember'
import { IServerMemberRepository } from '../domain/repositories/IServerMemberRepository'
import { ICodeforcesService } from '../domain/services/ICodeforcesService'
import { ServerId } from '../domain/valueobjects/ServerId'
import { ServerMemberId } from '../domain/valueobjects/ServerMemberId'
import { AbstractCommand } from './AbstractCommand'
import IdentifyHandleCommand from './IdentifyHandleCommand'

export default class VerifyHandleCommand extends AbstractCommand {
  private serverMemberRepository: IServerMemberRepository
  private codeforcesService: ICodeforcesService
  static COMMAND_NAME = 'verify-handle'
  static COMMAND_DESCRIPTION = 'Verify Codeforces handle.'
  static COMMAND_OPTIONS = []

  constructor() {
    super()
    this.serverMemberRepository = serverMemberRepository
    this.codeforcesService = codeforcesService
  }

  public getName: () => string = () => VerifyHandleCommand.COMMAND_NAME
  public getDescription: () => string = () =>
    VerifyHandleCommand.COMMAND_DESCRIPTION
  public getOptions: () => any[] = () => VerifyHandleCommand.COMMAND_OPTIONS

  public execute: (
    interaction: InteractionObject
  ) => Promise<InteractionCallbackData> = async (interaction) => {
    const guildId = interaction.guild_id
    if (!guildId || !('member' in interaction))
      return { content: 'Please execute this command inside a Discord server!' }
    const userId = interaction.member.user?.id
    if (!userId)
      return {
        content:
          'Unable to get your discord information, please try again later!'
      }

    const serverId = new ServerId(guildId)
    const serverMemberId = new ServerMemberId(userId)
    try {
      const serverMember =
        (await this.serverMemberRepository.find(serverId, serverMemberId)) ??
        new ServerMember(serverMemberId, serverId)
      const codeforcesHandleChangeRequest =
        await this.serverMemberRepository.findLatestCodeforcesHandleChangeRequest(
          serverMember
        )

      if (!codeforcesHandleChangeRequest)
        return {
          content: `Please identify your handle first using /${IdentifyHandleCommand.COMMAND_NAME} command!`
        }

      const {
        newHandle: handle,
        timestamp,
        problem
      } = codeforcesHandleChangeRequest
      const submissionsAfterRequest = (
        await this.codeforcesService.getUserSubmissions(handle)
      ).filter(
        ({ creationTimeSeconds }) =>
          creationTimeSeconds > timestamp.getTime() / 1000
      )
      console.info(submissionsAfterRequest)
      const isThereCompileErrorSubmissionForProblem =
        submissionsAfterRequest.findIndex(
          ({ problem: { contestId, index }, verdict }) =>
            contestId === problem.contestId &&
            index === problem.index &&
            verdict === 'COMPILATION_ERROR'
        ) !== -1
      console.info(
        submissionsAfterRequest.findIndex(
          ({ problem: { contestId, index }, verdict }) =>
            contestId === problem.contestId &&
            index === problem.index &&
            verdict === 'COMPILATION_ERROR'
        )
      )

      if (!isThereCompileErrorSubmissionForProblem)
        return {
          content: `Please submit a compile error submission first to ${this.codeforcesService.getProblemUrl(
            problem
          )}`
        }

      serverMember.setHandleAndMarkAsVerified(handle)
      await this.serverMemberRepository.update(serverMember)

      return {
        content: `Your handle successfully set and verified to ${handle.toString()}`
      }
    } catch (e) {
      console.error(e)
      return { content: 'Unable to verify codeforces handle!' }
    }
  }
}
