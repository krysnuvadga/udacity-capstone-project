/**
 * Fields in a request to update a single Event item.
 */
export interface UpdateEventRequest {
    name: string
    dueDate: string
    status: boolean
  }