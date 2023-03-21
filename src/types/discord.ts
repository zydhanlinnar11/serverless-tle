export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5
}

export enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3
}

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11
}

export type User = {
  id: string
  username: string
  discriminator: string
  bot?: boolean
  system?: boolean
  mfa_enabled?: boolean
  banner?: string
  accent_color?: number
  locale?: string
  verified?: boolean
  email?: string
  flags?: number
  premium_type?: number
  public_flags?: number
}

export type Member = {
  user?: User
  nick?: string
  avatar?: string
  roles: string[]
  joined_at: string
  premium_since?: string
  deaf: boolean
  mute: boolean
  flags: number
  pending?: boolean
  permissions?: string
  communication_disabled_until?: string
}

export type ResolvedData = {
  users?: {
    [key: string]: User
  }
  members?: {
    [key: string]: Omit<Member, 'user' | 'deaf' | 'mute'>
  }
  roles?: {
    [key: string]: User
  }
}

export type ApplicationCommandInteractionDataOption = {
  name: string
  type: ApplicationCommandOptionType
  value: string | number | boolean
  options?: ApplicationCommandInteractionDataOption[]
  focused?: boolean
}

export type InteractionData = {
  id: string
  name: string
  type: ApplicationCommandType
  resolvedData?: ResolvedData
  options?: ApplicationCommandInteractionDataOption[]
  guild_id?: string
  target_id?: string
}

export type Message = {
  id: string
  channel_id: string
}

export type InteractionObject = {
  id: string
  application_id: string
  guild_id?: string
  channel_id?: string
  token: string
  version: number
  message?: Message
  app_permissions?: string
  guild_locale?: string
} & ({ member: Member } | { user: User }) &
  (
    | {
        data: InteractionData
        type:
          | InteractionType.APPLICATION_COMMAND
          | InteractionType.MESSAGE_COMPONENT
          | InteractionType.MODAL_SUBMIT
        locale: string
      }
    | {
        data: null
        type: InteractionType.PING
        locale: null
      }
    | {
        data: null
        type: InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE
        locale: string
      }
  )

export enum InteractionCallbackType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9
}

export type InteractionCallbackData = {
  tts?: boolean
  content?: string
  embeds?: {}[]
  allowed_mentions?: {}[]
  flags?: number
  components?: {}[]
  attachments?: {}[]
}

export type InteractionResponse = {
  type: InteractionCallbackType
  data: InteractionCallbackData
}
