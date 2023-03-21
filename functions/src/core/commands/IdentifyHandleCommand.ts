import {
  codeforcesService,
  serverMemberRepository
} from '../../types/dependencies'
import {
  ApplicationCommandOptionType,
  InteractionCallbackData,
  InteractionObject
} from '../../types/discord'
import { ServerMember } from '../domain/entities/ServerMember'
import { CodeforcesHandleChangeRequested } from '../domain/events/CodeforcesHandleChangeRequested'
import { IServerMemberRepository } from '../domain/repositories/IServerMemberRepository'
import {
  CodeforcesProblem,
  ICodeforcesService
} from '../domain/services/ICodeforcesService'
import { CodeforcesHandle } from '../domain/valueobjects/CodeforcesHandle'
import { ServerId } from '../domain/valueobjects/ServerId'
import { ServerMemberId } from '../domain/valueobjects/ServerMemberId'
import { AbstractCommand } from './AbstractCommand'

export default class IdentifyHandleCommand extends AbstractCommand {
  private serverMemberRepository: IServerMemberRepository
  private codeforcesService: ICodeforcesService
  static COMMAND_NAME = 'identify-handle'
  static COMMAND_DESCRIPTION = 'Identify your codeforces handle.'
  static COMMAND_OPTIONS = [
    {
      description: 'Your Codeforces handle.',
      name: 'handle',
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]

  constructor() {
    super()
    this.serverMemberRepository = serverMemberRepository
    this.codeforcesService = codeforcesService
  }

  public getName: () => string = () => IdentifyHandleCommand.COMMAND_NAME
  public getDescription: () => string = () =>
    IdentifyHandleCommand.COMMAND_DESCRIPTION
  public getOptions: () => any[] = () => IdentifyHandleCommand.COMMAND_OPTIONS

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

    const handle = interaction.data?.options?.find(
      (option) => option.name === 'handle'
    )?.value
    if (typeof handle !== 'string' || handle.trim() === '')
      return { content: 'Please enter correct Codeforces handle!' }

    const serverId = new ServerId(guildId)
    const serverMemberId = new ServerMemberId(userId)
    try {
      const serverMember =
        (await this.serverMemberRepository.find(serverId, serverMemberId)) ??
        new ServerMember(serverMemberId, serverId)
      const codeforcesHandle = new CodeforcesHandle(handle)
      await serverMember.requestHandleChange(
        codeforcesHandle,
        this.codeforcesService
      )

      let problem: CodeforcesProblem | null = null
      const events = serverMember.getUnpublishedEvents()
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        if (!(event instanceof CodeforcesHandleChangeRequested)) continue
        problem = event.problem
        break
      }
      await this.serverMemberRepository.update(
        serverMember,
        interaction.application_id,
        interaction.token
      )

      if (problem === null)
        return {
          content:
            'Unable to get problem for verification. Please try again later!'
        }

      return {
        content: `Submit a compile error to https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`
      }
    } catch (e) {
      console.error(e)
      return { content: 'Unable to identify codeforces handle!' }
    }
  }
}
