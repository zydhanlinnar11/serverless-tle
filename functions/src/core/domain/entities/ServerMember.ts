import { CodeforcesHandleChangeRequested } from '../events/CodeforcesHandleChangeRequested'
import { CodeforcesHandleVerified } from '../events/CodeforcesHandleVerified'
import { IDomainEvent } from '../events/IDomainEvent'
import { ICodeforcesService } from '../services/ICodeforcesService'
import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'

export class ServerMember {
  private domainEvents: IDomainEvent[] = []

  constructor(
    private readonly id: ServerMemberId,
    private readonly serverId: ServerId,
    private handle: CodeforcesHandle | null = null,
    private handleVerified: boolean = false
  ) {}

  public getId = () => this.id
  public getServerId = () => this.serverId
  public getHandle = () => this.handle
  public isHandleVerified = () => this.handleVerified
  public getUnpublishedEvents = () => this.domainEvents

  public clearUnpublishedEvents = () => {
    this.domainEvents = []
  }

  public requestHandleChange = async (
    newHandle: CodeforcesHandle,
    codeforcesService: ICodeforcesService
  ) => {
    if (this.handle?.equals(newHandle)) return
    const event = new CodeforcesHandleChangeRequested(
      this.getServerId(),
      this.getId(),
      this.getHandle(),
      newHandle,
      await codeforcesService.getRandomCodeforcesProblem()
    )
    this.domainEvents.push(event)
  }

  public setHandleAndMarkAsVerified = (handle: CodeforcesHandle) => {
    this.handle = handle
    this.handleVerified = true
    const event = new CodeforcesHandleVerified(
      this.getServerId(),
      this.getId(),
      handle
    )
    this.domainEvents.push(event)
  }
}
