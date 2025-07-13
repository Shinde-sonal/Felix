// Buy.tsx (FIXED)
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { ErrorAlert } from "../../components/ui/ErrorAlert"
import { Search, ShoppingCart, Star, Wallet as WalletIconLucide, AlertTriangle, Clock } from "lucide-react"
import { useWallet } from "../contexts/WalletContext"
import { stellarApi } from "../services/stellarApi"
import type { Service } from "../types/wallet"

export const Buy: React.FC = () => {
  const { wallet, error, clearError, refreshWallet } = useWallet()
  const [availableMarketplaceServices, setAvailableMarketplaceServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [fetchServicesError, setFetchServicesError] = useState<string | null>(null);

  const filteredServices = availableMarketplaceServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const clearPurchaseError = () => setPurchaseError(null)
  const clearFetchServicesError = () => setFetchServicesError(null);

  const fetchAvailableMarketplaceServices = useCallback(async () => {
    setIsServicesLoading(true);
    setFetchServicesError(null);
    try {
      const response = await stellarApi.getSellServices();
      const mappedServices: Service[] = response.data.map(apiService => ({
        id: apiService.id,
        sellerPublicKey: apiService.seller_public_key,
        name: apiService.name,
        description: apiService.description,
        bludPrice: apiService.blud_price,
        status: apiService.status as Service['status'],
        createdAt: apiService.created_at,
      }));
      setAvailableMarketplaceServices(mappedServices);
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      setFetchServicesError(err.message || "Failed to load available services. Please try again.");
    } finally {
      setIsServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableMarketplaceServices();
  }, [fetchAvailableMarketplaceServices]);

  const handlePurchase = async (service: Service) => {
    if (!wallet) {
      setPurchaseError("Please create a wallet first.")
      return
    }

    const hasBludTrustline = wallet.trustlines.some(
      (t) => t.assetCode === "BLUD" && t.assetIssuer === wallet.publicKey
    );
    if (!hasBludTrustline) {
        setPurchaseError("You need a BLUD trustline to purchase services. Please establish one in your Wallet page.");
        return;
    }

    const bludBalance = Number.parseFloat(wallet.balance.blud)
    const servicePrice = Number.parseFloat(service.bludPrice)

    if (bludBalance < servicePrice) {
      setPurchaseError(
        `Insufficient BLUD balance. You have ${bludBalance} BLUD but need ${servicePrice} BLUD. ` +
          `BLUD tokens can be issued by an admin or earned by selling services.`,
      )
      return
    }

    setIsLoading(true)
    setPurchaseError(null)

    try {
      const response = await stellarApi.buyService({
        buyerSecret: wallet.secretKey,
        serviceId: service.id,
      })

      console.log("Purchase successful:", response)

      setAvailableMarketplaceServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, status: "sold" as const } : s))
      )

      await refreshWallet()
    } catch (err: any) {
      console.error("Purchase failed:", err)
      setPurchaseError(err.message || "Failed to purchase service. Please try again.")
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
          <h1 className="text-3xl font-bold">Buy Services</h1>
          <p className="text-gray-600">Discover and purchase professional blockchain services</p>
        </div>
        {wallet && (
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <WalletIconLucide className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">BLUD Balance</p>
                <p className="font-bold text-purple-600">{wallet.balance.blud}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ErrorAlert error={error || purchaseError || fetchServicesError} onClose={error ? clearError : (purchaseError ? clearPurchaseError : clearFetchServicesError)} />

      {!wallet && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Wallet Required</p>
                <p className="text-sm">
                  You need to create a wallet to purchase services. Go to your Wallet page to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isServicesLoading ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-spin" />
                <p className="text-gray-500 text-lg">Loading services...</p>
              </CardContent>
            </Card>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found</p>
                <p className="text-gray-400">Try adjusting your search</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredServices.map((service) => {
            // These calculations are safe because they are inside the map and check for `wallet`
            const bludBalance = wallet ? Number.parseFloat(wallet.balance.blud) : 0;
            const servicePrice = Number.parseFloat(service.bludPrice);
            const canAfford = bludBalance >= servicePrice;
            const isSeller = wallet ? service.sellerPublicKey === wallet.publicKey : false;

            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Service</p>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge
                      variant={service.status === "available" ? "default" : "secondary"}
                      className={getStatusColor(service.status)}
                    >
                      {service.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{service.bludPrice} BLUD</p>
                      <p className="text-sm text-gray-500">Seller: {service.sellerPublicKey.substring(0, 8)}...</p>
                    </div>
                  </div>

                  {wallet && !canAfford && service.status === "available" && !isSeller && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Insufficient BLUD. Need {service.bludPrice} BLUD, have {wallet.balance.blud} BLUD.
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(service)}
                    // Simplified disabled logic
                    disabled={
                      !wallet || // If no wallet, disable
                      service.status !== "available" || // If not available, disable
                      isLoading || // If loading, disable
                      !canAfford || // If cannot afford, disable
                      isSeller // If current user is the seller, disable
                    }
                  >
                    {!wallet ? (
                      "Create Wallet First"
                    ) : isSeller ? (
                        "Your Service"
                    ) : service.status !== "available" ? (
                      "Not Available"
                    ) : !canAfford ? (
                      "Insufficient BLUD"
                    ) : isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase Service
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{availableMarketplaceServices.length}</div>
            <p className="text-sm text-gray-600">Available Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {availableMarketplaceServices.filter((s) => s.status === "available").length}
            </div>
            <p className="text-sm text-gray-600">Active Listings</p>
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
            <div className="text-2xl font-bold text-orange-600">{wallet ? wallet.balance.blud : "0"}</div>
            <p className="text-sm text-gray-600">Your BLUD Balance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}