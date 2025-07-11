"use client"

import type React from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { ArrowLeft, Calendar, User, MessageSquare } from "lucide-react"

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // Mock ticket data
  const ticket = {
    id: id || "1",
    title: "Login Issue with Keycloak",
    description:
      "Unable to authenticate through Keycloak SSO. The login page loads but after entering credentials, it redirects back to the login page without any error message.",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "john.doe@example.com",
    assignedTo: null,
  }

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                <span className="text-gray-400">#{ticket.id}</span>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority} priority</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit</Button>
              <Button>Update Status</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Created by</p>
                  <p className="text-gray-600">{ticket.createdBy}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Created on</p>
                  <p className="text-gray-600">
                    {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                    {new Date(ticket.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Assigned to</p>
                  <p className="text-gray-600">{ticket.assignedTo || "Unassigned"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Last updated</p>
                  <p className="text-gray-600">
                    {new Date(ticket.updatedAt).toLocaleDateString()} at{" "}
                    {new Date(ticket.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to add a comment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
