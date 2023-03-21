import { CodeforcesProblem } from '../services/ICodeforcesService'
import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'
import { IDomainEvent } from './IDomainEvent'

export class CodeforcesHandleChangeRequested implements IDomainEvent {
  static EVENT_TYPE = 'codeforces-handle-change-requested'

  constructor(
    public readonly serverId: ServerId,
    public readonly serverMemberId: ServerMemberId,
    public readonly oldHandle: CodeforcesHandle | null,
    public readonly newHandle: CodeforcesHandle,
    public readonly problem: CodeforcesProblem
  ) {}

  toJSONString: () => string = () =>
    JSON.stringify({
      type: CodeforcesHandleChangeRequested.EVENT_TYPE,
      server_id: this.serverId.toString(),
      server_member_id: this.serverMemberId.toString(),
      old_handle: this.oldHandle?.toString() ?? null,
      new_handle: this.newHandle?.toString() ?? null,
      problem: this.problem
    })

  getEventType = () => CodeforcesHandleChangeRequested.EVENT_TYPE
}
