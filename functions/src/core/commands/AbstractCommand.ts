import { InteractionCallbackData, InteractionObject } from '../../types/discord'

export abstract class AbstractCommand {
  public abstract getName: () => string
  public abstract getDescription: () => string
  public abstract getOptions: () => any[]
  public abstract execute: (
    interaction: InteractionObject
  ) => Promise<InteractionCallbackData>
}
