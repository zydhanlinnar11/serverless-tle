import { serverMemberRepository } from '../../types/dependencies'
import {
  ApplicationCommandOptionType,
  InteractionCallbackData,
  InteractionObject
} from '../../types/discord'
import { ServerMember } from '../domain/entities/ServerMember'
import { IServerMemberRepository } from '../domain/repositories/IServerMemberRepository'
import { CodeforcesHandle } from '../domain/valueobjects/CodeforcesHandle'
import { ServerId } from '../domain/valueobjects/ServerId'
import { ServerMemberId } from '../domain/valueobjects/ServerMemberId'
import { AbstractCommand } from './AbstractCommand'

export default class IdentifyHandleCommand extends AbstractCommand {
  private serverMemberRepository: IServerMemberRepository
  // private eventEmitter: EventEmitter
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
    // this.eventEmitter = container.get<EventEmitter>(TYPES.EventEmitter)
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
      serverMember.requestHandleChange(codeforcesHandle)

      await this.serverMemberRepository.update(serverMember)
      return { content: 'Searching for problems...' }
    } catch (e) {
      console.error(e)
      return { content: 'Unable to identify codeforces handle!' }
    }
    // const events = serverMember.getUnpublishedEvents()
    // events.forEach((event) => {
    //   this.eventEmitter.emit(event.getEventType(), event)
    // })
    // serverMember.clearUnpublishedEvents()
  }
}
