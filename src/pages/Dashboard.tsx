"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import { Ticket, ShoppingCart, DollarSign, Users, Settings, Coins, TrendingUp, Activity } from "lucide-react"

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth()

  const quickActions = [
    {
      title: "Create Ticket",
      description: "Submit a new support ticket",
      icon: Ticket,
      href: "/tickets/create",
      color: "bg-blue-500",
    },
    {
      title: "Buy Services",
      description: "Browse and purchase services",
      icon: ShoppingCart,
      href: "/buy",
      color: "bg-green-500",
    },
    {
      title: "Sell Services",
      description: "List your services for sale",
      icon: DollarSign,
      href: "/sell",
      color: "bg-purple-500",
    },
  ]

  const adminActions = [
    {
      title: "User Management",
      description: "Manage system users",
      icon: Users,
      href: "/admin/users",
      color: "bg-red-500",
    },
    {
      title: "Issue BLUD",
      description: "Manage BLUD token issuance",
      icon: Coins,
      href: "/issue-blud",
      color: "bg-yellow-500",
    },
    {
      title: "Admin Settings",
      description: "System configuration",
      icon: Settings,
      href: "/admin",
      color: "bg-gray-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 text-lg">Here's what's happening with your Felix account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,350</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,230</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BLUD Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">BLUD tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={action.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      {hasRole("admin") && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminActions.map((action) => (
              <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <Link to={action.href}>Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Desk Manager Section */}
      {hasRole("desk-manager") && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Desk Management</h2>
          <Card>
            <CardHeader>
              <CardTitle>Desk Manager Dashboard</CardTitle>
              <CardDescription>Access your specialized desk management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/desk-manager">Open Desk Manager</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}