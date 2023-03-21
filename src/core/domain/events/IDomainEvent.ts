export interface IDomainEvent {
  getEventType: () => string
}
