import { Badge } from "../../../components/ui/badge"
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Link } from "react-router-dom"
import { Users, Coins, Settings, Activity, AlertTriangle, Database, Shield } from "lucide-react"

export const AdminDashboard: React.FC = () => {
  const adminStats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "BLUD Issued",
      value: "50,000",
      change: "+8%",
      icon: Coins,
      color: "text-green-600",
    },
    {
      title: "Active Sessions",
      value: "89",
      change: "+5%",
      icon: Activity,
      color: "text-purple-600",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Stable",
      icon: Shield,
      color: "text-emerald-600",
    },
  ]

  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Issue BLUD Tokens",
      description: "Manage BLUD token issuance",
      icon: Coins,
      href: "/issue-blud",
      color: "bg-green-500",
    },
    {
      title: "System Settings",
      description: "Configure system parameters",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-purple-500",
    },
    {
      title: "Database Management",
      description: "Monitor and manage database",
      icon: Database,
      href: "/admin/database",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and administrative controls</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={action.href}>Access</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>System Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Scheduled Maintenance</p>
                <p className="text-sm text-gray-600">System maintenance scheduled for tonight at 2:00 AM</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Backup Completed</p>
                <p className="text-sm text-gray-600">Daily backup completed successfully</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Success</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered: john.doe@example.com</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">BLUD tokens issued: 1,000 BLUD</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System configuration updated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
