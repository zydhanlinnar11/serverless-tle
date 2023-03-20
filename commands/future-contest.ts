import { SlashCommand, SlashCreator } from 'slash-create'

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

export default class FutureContestCommand extends SlashCommand {
  static CLIST_API_URL = 'https://clist.by/api/v2/contest'
  static HOST_REGEX = 'codeforces.com|atcoder.jp'

  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'future-contest',
      description: 'Get future contests.',
      options: []
    })
  }

  async run() {
    const params = new URLSearchParams()
    params.append('format', 'json')
    params.append('limit', '5')
    params.append('offset', '0')
    params.append('host__regex', FutureContestCommand.HOST_REGEX)
    try {
      const response = await fetch(`${FutureContestCommand.CLIST_API_URL}?${params.toString()}`)
      const data: ClistResponse = await response.json()
      if (!response.ok) throw new Error(JSON.stringify(data))
      return data.objects.map(({ event }) => event).join('\n')
    } catch (e) {
      return 'Sorry, i am currently unable to bring you future contest:( Please try again later!!!'
    }
  }
}
