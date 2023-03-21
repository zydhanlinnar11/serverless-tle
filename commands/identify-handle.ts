import {
  SlashCommand,
  SlashCreator,
  CommandContext,
  CommandOptionType
} from 'slash-create'
import { IServerMemberRepository } from '../core/domain/repositories/IServerMemberRepository'
import { ServerId } from '../core/domain/valueobjects/ServerId'
import { ServerMemberId } from '../core/domain/valueobjects/ServerMemberId'
import { ServerMember } from '../core/domain/entities/ServerMember'
import { CodeforcesHandle } from '../core/domain/valueobjects/CodeforcesHandle'
import { serverMemberRepository } from '../types/dependencies'

export default class IdentifyHandleCommand extends SlashCommand {
  private serverMemberRepository: IServerMemberRepository
  // private eventEmitter: EventEmitter

  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'identify-handle',
      description: 'Identify your codeforces handle.',
      options: [
        {
          description: 'Your Codeforces handle.',
          name: 'handle',
          type: CommandOptionType.STRING,
          required: true
        }
      ]
    })

    this.serverMemberRepository = serverMemberRepository
    // this.eventEmitter = container.get<EventEmitter>(TYPES.EventEmitter)
  }

  async run(ctx: CommandContext) {
    if (!ctx.guildID)
      return 'Please execute this command inside a Discord server!'
    const handle = ctx.options.handle
    if (typeof handle !== 'string' || handle.trim() === '')
      return 'Please enter correct Codeforces handle!'

    await ctx.defer()
    const serverId = new ServerId(ctx.guildID)
    const serverMemberId = new ServerMemberId(ctx.user.id)
    console.info('Loading!')
    try {
      const serverMember =
        (await this.serverMemberRepository.find(serverId, serverMemberId)) ??
        new ServerMember(serverMemberId, serverId)
      const codeforcesHandle = new CodeforcesHandle(handle)
      serverMember.requestHandleChange(codeforcesHandle)

      await this.serverMemberRepository.update(serverMember)
    } catch (e) {
      console.error(e)
    }
    // const events = serverMember.getUnpublishedEvents()
    // events.forEach((event) => {
    //   this.eventEmitter.emit(event.getEventType(), event)
    // })
    // serverMember.clearUnpublishedEvents()
  }
}
