import { AbstractCommand } from './core/commands/AbstractCommand'
import FutureContestCommand from './core/commands/FutureContestCommand'
import { InteractionCallbackData, InteractionObject } from './types/discord'

const commands: AbstractCommand[] = [new FutureContestCommand()]

export const handleInteraction: (
  interaction: InteractionObject
) => Promise<void> = async (interaction) => {
  let interactionResponse: InteractionCallbackData = {
    content: 'Command not found!'
  }

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    if (command.getName() !== interaction.data?.name) continue
    interactionResponse = await command.execute(interaction)
    break
  }

  const url = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`
  console.info(`updating message...`)
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(interactionResponse),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.info(await response.json())
}
