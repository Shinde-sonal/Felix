"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { useAuth } from "../contexts/AuthContext"
import { Badge } from "../../components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"

export const Profile: React.FC = () => {
  const { user } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "desk-manager":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="/placeholder.svg" alt={user?.name} />
              <AvatarFallback className="text-2xl">{getInitials(user?.name || "U")}</AvatarFallback>
            </Avatar>
            <CardTitle>{user?.name}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
            <Badge className={`mt-2 ${getRoleBadgeColor(user?.role || "")}`}>
              {user?.role?.replace("-", " ").toUpperCase()}
            </Badge>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Input id="name" value={user?.name || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <Input id="email" value={user?.email || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Input id="username" value={user?.username || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <Input id="role" value={user?.role || ""} readOnly />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button disabled className="w-full md:w-auto">
                Edit Profile (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups/Permissions */}
      {user?.groups && user.groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Groups & Permissions</CardTitle>
            <CardDescription>Your assigned groups and access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.groups.map((group, index) => (
                <Badge key={index} variant="outline">
                  {group.replace("/", "")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Recent activity and session information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Last Login</p>
                <p className="text-sm text-gray-600">Today at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
