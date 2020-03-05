export interface Event {
  eventId: string
  createdAt: string
  name: string
  dueDate: string
  status: boolean
  attachmentUrl?: string
}
