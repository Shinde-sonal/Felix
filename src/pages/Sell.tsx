// Sell.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { ErrorAlert } from "../../components/ui/ErrorAlert"
import { Plus, DollarSign, Eye, Edit, Trash2, Wallet as WalletIconLucide, AlertTriangle, Clock } from "lucide-react"
import { useWallet } from "../contexts/WalletContext"
import { stellarApi } from "../services/stellarApi"
import type { Service } from "../types/wallet"

// Still keep the asset code as a constant, as it's unlikely to change
const BLUD_ASSET_CODE = "BLUD";

export const Sell: React.FC = () => {
  const { wallet, error, clearError, refreshWallet } = useWallet()
  const [mySoldServices, setMySoldServices] = useState<Service[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const [createError, setCreateError] = useState<string | null>(null)
  const [fetchServicesError, setFetchServicesError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bludPrice: "",
    issuerPublicKey: "", // NEW: Add issuerPublicKey to form data
  })

  // This check is for the general UI warning - does the wallet have *any* BLUD trustline?
  // We'll do a more specific check at the time of service creation.
  const hasGeneralBludTrustline = wallet?.trustlines.some(
    (t) => t.assetCode === BLUD_ASSET_CODE
  );

  const clearCreateError = () => setCreateError(null)
  const clearFetchServicesError = () => setFetchServicesError(null)

  const fetchMySoldServices = useCallback(async () => {
    setIsServicesLoading(true);
    setFetchServicesError(null);
    try {
      const response = await stellarApi.getSellServices();
      const mappedServices: Service[] = response.data.map((apiService: any) => ({
        id: apiService.id,
        sellerPublicKey: apiService.seller_public_key,
        name: apiService.name,
        description: apiService.description,
        bludPrice: String(apiService.blud_price),
        status: apiService.status as Service['status'],
        createdAt: apiService.created_at,
      }));

      const ownedServices = mappedServices.filter(service => service.sellerPublicKey === wallet?.publicKey);
      setMySoldServices(ownedServices);
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      setFetchServicesError(err.message || "Failed to load your services. Please try again.");
    } finally {
      setIsServicesLoading(false);
    }
  }, [wallet?.publicKey]);

  useEffect(() => {
    if (wallet?.publicKey) {
      fetchMySoldServices();
    } else {
        setMySoldServices([]);
        setIsServicesLoading(false);
    }
  }, [wallet?.publicKey, fetchMySoldServices]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet || !wallet.secretKey) {
      setCreateError("Wallet not found or secret key missing. Please ensure your wallet is loaded.")
      return
    }

    // Form Validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.bludPrice.trim() || !formData.issuerPublicKey.trim()) {
        setCreateError("Please fill in all service details, including the BLUD Issuer Public Key.");
        return;
    }
    const bludPriceNum = Number(formData.bludPrice);
    if (isNaN(bludPriceNum) || bludPriceNum <= 0) {
        setCreateError("BLUD price must be a positive number.");
        return;
    }

    // Specific BLUD trustline check with the provided issuer public key
    const hasSpecificBludTrustline = wallet?.trustlines.some(
        (t) => t.assetCode === BLUD_ASSET_CODE && t.assetIssuer === formData.issuerPublicKey
    );

    if (!hasSpecificBludTrustline) {
        setCreateError(`You need a ${BLUD_ASSET_CODE} trustline with the exact issuer (${formData.issuerPublicKey}) to sell services. Please establish one in your Wallet page.`);
        return;
    }

    setIsLoading(true)
    setCreateError(null)

    try {
      const response = await stellarApi.sellService({
        sellerSecret: wallet.secretKey,
        serviceName: formData.name,
        description: formData.description,
        bludAmount: formData.bludPrice,
        assetCode: BLUD_ASSET_CODE,
        issuerPublicKey: formData.issuerPublicKey, // Use the user-provided issuer key
      })

      const newService: Service = {
        id: response.result.id,
        sellerPublicKey: response.result.seller_public_key,
        name: response.result.name,
        description: response.result.description,
        bludPrice: String(response.result.blud_price),
        status: response.result.status as Service['status'],
        createdAt: response.result.created_at,
      }

      setMySoldServices((prevServices) => [newService, ...prevServices])
      setFormData({ name: "", description: "", bludPrice: "", issuerPublicKey: "" }) // Clear all form fields
      setShowCreateForm(false)
      await refreshWallet()
    } catch (err: any) {
      console.error("Failed to create service:", err)
      setCreateError(err.message || "Failed to list service. Please check your inputs and BLUD trustline.")
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

  const totalServices = mySoldServices.length;
  const activeServices = mySoldServices.filter((s) => s.status === "available").length;
  const totalBludValue = mySoldServices.reduce((sum, s) => sum + Number.parseFloat(s.bludPrice), 0);
  const soldServices = mySoldServices.filter((s) => s.status === "sold").length;


  return (
    <div className="space-y-6 p-4">
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
                <WalletIconLucide className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">BLUD Balance</p>
                  <p className="font-bold text-purple-600">{wallet.balance.blud}</p>
                </div>
              </div>
            </Card>
          )}
          {/* Button disabled if no wallet or no general BLUD trustline */}
          <Button onClick={() => setShowCreateForm(true)} disabled={!wallet || !hasGeneralBludTrustline}>
            <Plus className="h-4 w-4 mr-2" />
            Create Service
          </Button>
        </div>
      </div>

      <ErrorAlert error={error || createError || fetchServicesError} onClose={error ? clearError : (createError ? clearCreateError : clearFetchServicesError)} />


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

      {wallet && !hasGeneralBludTrustline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">BLUD Trustline Required</p>
                <p className="text-sm">
                  To receive BLUD payments, your wallet needs a BLUD trustline. Please establish one
                  in your Wallet page. (You'll specify the issuer when creating a service.)
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
            <div className="text-2xl font-bold text-blue-600">{totalServices}</div>
            <p className="text-sm text-gray-600">Total Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {activeServices}
            </div>
            <p className="text-sm text-gray-600">Active Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalBludValue}
            </div>
            <p className="text-sm text-gray-600">Total Value (BLUD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {soldServices}
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

              {/* NEW: Input for BLUD Issuer Public Key */}
              <div className="space-y-2">
                <Label htmlFor="issuerPublicKey">BLUD Issuer Public Key *</Label>
                <Input
                  id="issuerPublicKey"
                  value={formData.issuerPublicKey}
                  onChange={(e) => setFormData({ ...formData, issuerPublicKey: e.target.value })}
                  placeholder="Enter BLUD Issuer Public Key (e.g., GABCD...)"
                  required
                />
                <p className="text-sm text-gray-500">This is the public key of the account that issues the BLUD asset.</p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} disabled={isLoading}>
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
        {isServicesLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-spin" />
              <p className="text-gray-500 text-lg">Loading services...</p>
            </CardContent>
          </Card>
        ) : mySoldServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No services yet</p>
              <p className="text-gray-400">Create your first service to start selling</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mySoldServices.map((service) => (
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
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          Seller: <span className="font-mono">{service.sellerPublicKey}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
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