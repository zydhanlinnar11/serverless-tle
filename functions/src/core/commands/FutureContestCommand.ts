import { InteractionCallbackData, InteractionObject } from '../../types/discord'
import { AbstractCommand } from './AbstractCommand'

type ClistContest = {
  duration: number
  end: string
  event: string
  host: string
  href: string
  id: number
  parsed_at: string
  problems: null
  resource: string
  resource_id: number
  start: string
}

type ClistResponse = {
  objects: ClistContest[]
}

export default class FutureContestCommand implements AbstractCommand {
  static COMMAND_NAME = 'future-contest'
  static COMMAND_DESCRIPTION = 'Get future contests.'
  static COMMAND_OPTIONS = []

  static CLIST_API_URL = 'https://clist.by/api/v2/contest'
  static HOST_REGEX = 'codeforces.com|atcoder.jp'
  static DATE_LOCALE = 'id-ID'
  static DATE_TZ = 'Asia/Jakarta'

  public getName: () => string = () => FutureContestCommand.COMMAND_NAME
  public getDescription: () => string = () =>
    FutureContestCommand.COMMAND_DESCRIPTION
  public getOptions: () => any[] = () => FutureContestCommand.COMMAND_OPTIONS

  public execute: (
    interaction: InteractionObject
  ) => Promise<InteractionCallbackData> = async () => {
    const params = new URLSearchParams()
    params.append('format', 'json')
    params.append('limit', '5')
    params.append('offset', '0')
    params.append('host__regex', FutureContestCommand.HOST_REGEX)
    params.append('order_by', 'start')
    params.append('start__gt', new Date().toISOString())

    try {
      const url = `${FutureContestCommand.CLIST_API_URL}?${params.toString()}`

      const response = await fetch(url, {
        headers: { Authorization: `ApiKey ${process.env.CLIST_API_TOKEN}` }
      })
      if (!response.ok) throw new Error(await response.text())
      const data: ClistResponse = await response.json()
      const embed = {
        type: 'rich',
        title: 'Future Contests',
        fields: data.objects.map(({ event, href, start }) => ({
          name: event,
          value: `[Link 🡕](${href}) | ${new Date(start).toLocaleString(
            FutureContestCommand.DATE_LOCALE,
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'short',
              timeZone: FutureContestCommand.DATE_TZ
            }
          )}`
        }))
      }

      return { embeds: [embed] }
    } catch (e) {
      console.error(e)
      return {
        content:
          'Sorry, i am currently unable to bring you future contest:( Please try again later!!!'
      }
    }
  }
}
