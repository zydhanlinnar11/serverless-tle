import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'
import { ServerId } from '../valueobjects/ServerId'
import { ServerMemberId } from '../valueobjects/ServerMemberId'

export class ServerMember {
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

  public setHandle = (handle: CodeforcesHandle) => {
    if (this.handle?.equals(handle)) return
    this.handle = handle
    this.handleVerified = false
  }

  public verifyHandle = () => {
    this.handleVerified = true
  }
}
