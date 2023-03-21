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
    public readonly newHandle: CodeforcesHandle
  ) {}

  getEventType = () => CodeforcesHandleChangeRequested.EVENT_TYPE
}
