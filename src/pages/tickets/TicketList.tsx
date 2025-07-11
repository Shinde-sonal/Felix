"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Link } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import type { Ticket } from "../../types/ticket"

// Mock data
const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Login Issue with Keycloak",
    description: "Unable to authenticate through Keycloak SSO",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "john.doe@example.com",
  },
  {
    id: "2",
    title: "BLUD Token Transfer Failed",
    description: "Transaction failed during token transfer on Stellar network",
    status: "in-progress",
    priority: "medium",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    createdBy: "jane.smith@example.com",
    assignedTo: "support@felix.com",
  },
  {
    id: "3",
    title: "Dashboard Loading Slowly",
    description: "Dashboard takes too long to load user data",
    status: "closed",
    priority: "low",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-14T11:30:00Z",
    createdBy: "mike.wilson@example.com",
  },
]

export const TicketList: React.FC = () => {
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-gray-600">Manage and track your support requests</p>
        </div>
        <Button asChild>
          <Link to="/tickets/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                onClick={() => setStatusFilter("open")}
                size="sm"
              >
                Open
              </Button>
              <Button
                variant={statusFilter === "in-progress" ? "default" : "outline"}
                onClick={() => setStatusFilter("in-progress")}
                size="sm"
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === "closed" ? "default" : "outline"}
                onClick={() => setStatusFilter("closed")}
                size="sm"
              >
                Closed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No tickets found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      <Link to={`/tickets/${ticket.id}`} className="hover:text-blue-600 transition-colors">
                        {ticket.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{ticket.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Created by {ticket.createdBy} • {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <div>#{ticket.id}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
