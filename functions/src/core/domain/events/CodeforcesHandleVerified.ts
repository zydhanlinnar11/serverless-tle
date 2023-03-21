import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'
import { IDomainEvent } from './IDomainEvent'

export class CodeforcesHandleVerified implements IDomainEvent {
  static EVENT_TYPE = 'codeforces-handle-verified'
  public readonly verifiedAt: Date

  constructor(
    public readonly serverId: ServerId,
    public readonly serverMemberId: ServerMemberId,
    public readonly handle: CodeforcesHandle
  ) {
    this.verifiedAt = new Date()
  }

  toJSONString: () => string = () =>
    JSON.stringify({
      type: CodeforcesHandleVerified.EVENT_TYPE,
      server_id: this.serverId.toString(),
      server_member_id: this.serverMemberId.toString(),
      verified_at: this.verifiedAt.toISOString()
    })

  getEventType = () => CodeforcesHandleVerified.EVENT_TYPE
}
