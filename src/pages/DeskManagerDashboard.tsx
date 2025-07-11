import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Users, Ticket, Clock, CheckCircle, AlertCircle, BarChart3, Calendar } from "lucide-react"

export const DeskManagerDashboard: React.FC = () => {
  const deskStats = [
    {
      title: "Team Members",
      value: "12",
      change: "+2 this month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Open Tickets",
      value: "24",
      change: "-3 from yesterday",
      icon: Ticket,
      color: "text-red-600",
    },
    {
      title: "Resolved Today",
      value: "18",
      change: "+5 from yesterday",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-0.3h improvement",
      icon: Clock,
      color: "text-purple-600",
    },
  ]

  const teamPerformance = [
    { name: "Alice Johnson", tickets: 15, resolved: 13, rating: 4.8 },
    { name: "Bob Smith", tickets: 12, resolved: 11, rating: 4.6 },
    { name: "Carol Davis", tickets: 18, resolved: 16, rating: 4.9 },
    { name: "David Wilson", tickets: 9, resolved: 8, rating: 4.5 },
  ]

  const recentTickets = [
    {
      id: "T-001",
      title: "Login Authentication Issue",
      priority: "high",
      assignee: "Alice Johnson",
      status: "in-progress",
      created: "2 hours ago",
    },
    {
      id: "T-002",
      title: "BLUD Transfer Failed",
      priority: "medium",
      assignee: "Bob Smith",
      status: "open",
      created: "4 hours ago",
    },
    {
      id: "T-003",
      title: "Dashboard Loading Slow",
      priority: "low",
      assignee: "Carol Davis",
      status: "resolved",
      created: "6 hours ago",
    },
  ]

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Desk Manager Dashboard</h1>
        <p className="text-gray-600">Monitor team performance and manage support operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deskStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Team Performance</span>
            </CardTitle>
            <CardDescription>Individual team member statistics for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">
                      {member.resolved}/{member.tickets} tickets resolved
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{member.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round((member.resolved / member.tickets) * 100)}% resolved
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ticket className="h-5 w-5" />
              <span>Recent Tickets</span>
            </CardTitle>
            <CardDescription>Latest support tickets assigned to your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-gray-600">#{ticket.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("-", " ")}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Assigned to {ticket.assignee}</span>
                    <span>{ticket.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Manage Team</CardTitle>
              <CardDescription>View and manage team member assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Team</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>View Reports</CardTitle>
              <CardDescription>Generate performance and analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Reports</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Schedule Review</CardTitle>
              <CardDescription>Schedule team performance reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Schedule</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Desk Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium">High Priority Tickets</p>
                <p className="text-sm text-gray-600">3 high priority tickets need immediate attention</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Action Required</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Team Meeting</p>
                <p className="text-sm text-gray-600">Weekly team standup scheduled for 2:00 PM</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}