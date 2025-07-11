"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Search, ShoppingCart, Star } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  price: number
  currency: string
  rating: number
  reviews: number
  seller: string
  category: string
  image: string
}

const mockServices: Service[] = [
  {
    id: "1",
    name: "Stellar Wallet Integration",
    description: "Professional Stellar blockchain wallet integration service for your application",
    price: 299,
    currency: "BLUD",
    rating: 4.8,
    reviews: 24,
    seller: "BlockchainPro",
    category: "Development",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "Smart Contract Audit",
    description: "Comprehensive security audit for your smart contracts with detailed report",
    price: 599,
    currency: "BLUD",
    rating: 4.9,
    reviews: 18,
    seller: "SecureCode",
    category: "Security",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Token Design & Launch",
    description: "Complete token design and launch service on Stellar network",
    price: 899,
    currency: "BLUD",
    rating: 4.7,
    reviews: 31,
    seller: "TokenMaster",
    category: "Consulting",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "DeFi Protocol Development",
    description: "Custom DeFi protocol development with advanced features",
    price: 1299,
    currency: "BLUD",
    rating: 4.9,
    reviews: 12,
    seller: "DeFiExperts",
    category: "Development",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export const Buy: React.FC = () => {
  const [services] = useState<Service[]>(mockServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(services.map((s) => s.category)))]

  const handlePurchase = (service: Service) => {
    console.log("Purchasing service:", service)
    // Implement purchase logic
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Buy Services</h1>
        <p className="text-gray-600">Discover and purchase professional blockchain services</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  onClick={() => setCategoryFilter(category)}
                  size="sm"
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{service.category}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {service.price} {service.currency}
                    </p>
                    <p className="text-sm text-gray-500">by {service.seller}</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handlePurchase(service)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Service
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <p className="text-sm text-gray-600">Available Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
            <p className="text-sm text-gray-600">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">4.8</div>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">85</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
