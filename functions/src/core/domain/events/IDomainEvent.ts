export interface IDomainEvent {
  getEventType: () => string
  toJSONString: () => string
}
