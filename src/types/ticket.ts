export interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  assignedTo?: string
  createdBy: string
}

export interface CreateTicketData {
  title: string
  description: string
  priority: "low" | "medium" | "high"
}
