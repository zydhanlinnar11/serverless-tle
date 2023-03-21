import { AbstractCommand } from '@/core/commands/AbstractCommand'
import FutureContestCommand from '@/core/commands/FutureContestCommand'
import {
  InteractionCallbackType,
  InteractionObject,
  InteractionResponse
} from '@/types/discord'

const commands: AbstractCommand[] = [new FutureContestCommand()]

export const handleInteraction: (
  interaction: InteractionObject
) => Promise<Response> = async (interaction) => {
  let interactionResponse: InteractionResponse = {
    type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: 'Command not found!'
    }
  }

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    if (command.getName() !== interaction.data?.name) continue
    interactionResponse = await command.execute(interaction)
    break
  }

  return new Response(JSON.stringify(interactionResponse), {
    headers: { 'Content-Type': 'application/json' }
  })
}
