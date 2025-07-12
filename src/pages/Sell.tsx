"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { ErrorAlert } from "../../components/ui/ErrorAlert"
import { Plus, DollarSign, Eye, Edit, Trash2, Wallet, AlertTriangle } from "lucide-react"
import { useWallet } from "../contexts/WalletContext"
import { stellarApi } from "../services/stellarApi"
import type { Service } from "../types/wallet"

const mockMyServices: Service[] = [
  {
    id: "1",
    sellerPublicKey: "GDSV2X2RM4HEXBHYWNLSEXWJEPKJDPJTGPNKQS2TESHLCX6N3VTM5O5E",
    name: "Custom Stellar Integration",
    description: "Professional Stellar blockchain integration for web applications",
    bludPrice: "499",
    status: "available",
    createdAt: "2024-01-15T10:30:00Z",
  },
]

export const Sell: React.FC = () => {
  const { wallet, error, clearError } = useWallet()
  const [myServices, setMyServices] = useState<Service[]>(mockMyServices)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bludPrice: "",
  })

  const clearCreateError = () => setCreateError(null)

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      setCreateError("Please create a wallet first")
      return
    }

    setIsLoading(true)
    setCreateError(null)

    try {
      const response = await stellarApi.sellService({
        sellerSecret: wallet.secretKey,
        serviceName: formData.name,
        description: formData.description,
        bludAmount: formData.bludPrice,
      })

      const newService: Service = {
        id: response.result.id,
        sellerPublicKey: response.result.seller_public_key,
        name: response.result.name,
        description: response.result.description,
        bludPrice: response.result.blud_price,
        status: response.result.status as "available",
        createdAt: response.result.created_at,
      }

      setMyServices([newService, ...myServices])
      setFormData({ name: "", description: "", bludPrice: "" })
      setShowCreateForm(false)
    } catch (error: any) {
      console.error("Failed to create service:", error)
      setCreateError(error.message || "Failed to list service. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sell Services</h1>
          <p className="text-gray-600">Manage your service listings and track performance</p>
        </div>
        <div className="flex gap-2">
          {wallet && (
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">BLUD Balance</p>
                  <p className="font-bold text-purple-600">{wallet.balance.blud}</p>
                </div>
              </div>
            </Card>
          )}
          <Button onClick={() => setShowCreateForm(true)} disabled={!wallet}>
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
        </div>
      </div>

      <ErrorAlert error={error || createError} onClose={error ? clearError : clearCreateError} />

      {!wallet && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Wallet Required</p>
                <p className="text-sm">
                  You need to create a wallet to sell services and receive payments. Go to your Wallet page to get
                  started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{myServices.length}</div>
            <p className="text-sm text-gray-600">Total Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {myServices.filter((s) => s.status === "available").length}
            </div>
            <p className="text-sm text-gray-600">Active Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {myServices.reduce((sum, s) => sum + Number.parseFloat(s.bludPrice), 0)}
            </div>
            <p className="text-sm text-gray-600">Total Value (BLUD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {myServices.filter((s) => s.status === "sold").length}
            </div>
            <p className="text-sm text-gray-600">Sold Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Service Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Service</CardTitle>
            <CardDescription>Add a new service to your marketplace listing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter service name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (BLUD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.bludPrice}
                    onChange={(e) => setFormData({ ...formData, bludPrice: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service in detail"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Service"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Services */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Services</h2>
        {myServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No services yet</p>
              <p className="text-gray-400">Create your first service to start selling</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{service.bludPrice} BLUD</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(service.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
