// pages/Wallet.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { ErrorAlert } from "../../components/ui/ErrorAlert"
import { useWallet } from "../contexts/WalletContext"
import { useAuth } from "../contexts/AuthContext"
import {
  WalletIcon,
  Send,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

export const Wallet: React.FC = () => {
  const { user, hasRole } = useAuth()
  const {
    wallet,
    transactions,
    isLoading,
    error,
    createWallet,
    sendLumens,
    refreshWallet,
    clearError,
    establishBludTrustline,
  } = useWallet()

  const [showSecretKey, setShowSecretKey] = useState(false)
  const [sendForm, setSendForm] = useState({
    destinationPublic: "",
    amount: "",
  })
  const [showSendForm, setShowSendForm] = useState(false)
  const [bludIssuerPublicKeyInput, setBludIssuerPublicKeyInput] = useState<string>("")
  const [trustlineError, setTrustlineError] = useState<string | null>(null) // Separate error for trustline form

  const handleCreateWallet = async () => {
    await createWallet()
  }

  const handleSendLumens = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendLumens(sendForm.destinationPublic, sendForm.amount)
    if (!error) {
      setSendForm({ destinationPublic: "", amount: "" })
      setShowSendForm(false)
    }
  }

  const handleEstablishBludTrustline = async () => {
    setTrustlineError(null); // Clear previous trustline errors

    if (!bludIssuerPublicKeyInput.trim()) {
        setTrustlineError("Please enter the BLUD Issuer Public Key.");
        return;
    }
    // Basic validation for Stellar Public Key format (starts with G, 56 characters)
    if (!bludIssuerPublicKeyInput.startsWith("G") || bludIssuerPublicKeyInput.length !== 56) {
        setTrustlineError("Invalid Stellar Public Key format for issuer. It should start with 'G' and be 56 characters long.");
        return;
    }


    const defaultBludLimit = "1000000000"; // A very large number
    // Pass "BLUD" as asset code and the input issuer public key
    await establishBludTrustline("BLUD", bludIssuerPublicKeyInput.trim(), defaultBludLimit);
    // If successful, clear input
    if (!error && !isLoading) { // Check global error and loading from context
      setBludIssuerPublicKeyInput("");
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here instead of alert
  }

  const getTransactionIcon = (type: string, sourceAccount: string) => {
    if (!wallet) return null
    const isOutgoing = sourceAccount === wallet.publicKey
    if (type === "trustline") {
      return <Info className="h-4 w-4 text-blue-500" />
    } else if (type === "payment") {
      return isOutgoing ? (
        <ArrowUpRight className="h-4 w-4 text-red-500" />
      ) : (
        <ArrowDownLeft className="h-4 w-4 text-green-500" />
      )
    }
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-gray-600">Manage your personal Stellar wallet and BLUD tokens</p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Role: <span className="font-medium capitalize">{user.role.replace("-", " ")}</span> | User:{" "}
              <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <ErrorAlert error={error} onClose={clearError} />

        <Card className="text-center py-12">
          <CardContent>
            <WalletIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No Personal Wallet Found</h2>
            <p className="text-gray-600 mb-6">
              Create your personal Stellar wallet to start managing your assets and making transactions. This wallet
              will be unique to your account ({user?.email}) and role ({user?.role}).
            </p>
            <Button onClick={handleCreateWallet} disabled={isLoading} size="lg">
              {isLoading ? "Creating Personal Wallet..." : "Create Personal Wallet"}
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              <strong>Important:</strong> Each user role has its own separate wallet. Your {user?.role} wallet will be
              independent from any other role wallets you may have. Your wallet will be created on the Stellar testnet.
              To receive BLUD tokens, you will need to establish a BLUD trustline. Keep your secret key safe and never
              share it with anyone.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personal Wallet</h1>
          <p className="text-gray-600">Manage your Stellar wallet and BLUD tokens</p>
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Role: <span className="font-medium capitalize">{user.role.replace("-", " ")}</span> | User:{" "}
              <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshWallet} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={() => setShowSendForm(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send XLM
          </Button>
        </div>
      </div>

      {/* Trustline Error Alert */}
      {trustlineError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{trustlineError}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={() => setTrustlineError(null)} className="absolute top-2 right-2">x</Button>
        </Alert>
      )}

      <ErrorAlert error={error} onClose={clearError} />


      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">XLM</span>
              </div>
              <span>Stellar Lumens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{wallet.balance.xlm}</div>
            <p className="text-sm text-gray-500">XLM</p>
          </CardContent>
        </Card>

        {/* Conditional rendering for BLUD Card based on role */}
        {!hasRole("admin") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">BLUD</span>
                </div>
                <span>BLUD Tokens</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{wallet.balance.blud}</div>
              <p className="text-sm text-gray-500">BLUD</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wallet Details */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Details</CardTitle>
          <CardDescription>Your personal Stellar account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Public Key</Label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">{wallet.publicKey}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(wallet.publicKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Secret Key</Label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
                {showSecretKey ? wallet.secretKey : "•".repeat(56)}
              </code>
              <Button variant="outline" size="sm" onClick={() => setShowSecretKey(!showSecretKey)}>
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {showSecretKey && (
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(wallet.secretKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-red-600 mt-1">⚠️ Never share your secret key with anyone!</p>
          </div>
        </CardContent>
      </Card>

      {/* Conditional rendering for BLUD Trustline creation */}
      {wallet && !wallet.trustlines.some((t) => t.assetCode === "BLUD") && !hasRole("admin") && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-blue-800 mb-4">
              <Info className="h-5 w-5" />
              <div>
                <p className="font-medium">BLUD Trustline Required</p>
                <p className="text-sm">
                  To receive BLUD tokens, you need to establish a trustline. This allows your wallet to hold BLUD.
                </p>
              </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="bludIssuerKey">BLUD Issuer Public Key *</Label>
                    <Input
                        id="bludIssuerKey"
                        placeholder="Enter the BLUD Issuer's Public Key (e.g., from Admin page)"
                        value={bludIssuerPublicKeyInput}
                        onChange={(e) => setBludIssuerPublicKeyInput(e.target.value)}
                        disabled={isLoading}
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This is the public key of the account that issues the BLUD token.
                    </p>
                </div>
                <Button onClick={handleEstablishBludTrustline} disabled={isLoading} className="w-full">
                    {isLoading ? "Creating Trustline..." : "Create BLUD Trustline"}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Form */}
      {showSendForm && (
        <Card>
          <CardHeader>
            <CardTitle>Send Lumens</CardTitle>
            <CardDescription>Send XLM to another Stellar account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendLumens} className="space-y-4">
              <div>
                <Label htmlFor="destination">Destination Public Key</Label>
                <Input
                  id="destination"
                  placeholder="G..."
                  value={sendForm.destinationPublic}
                  onChange={(e) => setSendForm({ ...sendForm, destinationPublic: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (XLM)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0000001"
                  placeholder="0.00"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Available: {wallet.balance.xlm} XLM (Fee: 0.0001 XLM)</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowSendForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Trustlines */}
      {wallet.trustlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trustlines</CardTitle>
            <CardDescription>Assets you can receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wallet.trustlines.map((trustline, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{trustline.assetCode}</p>
                    <p className="text-sm text-gray-500">
                      Balance: {trustline.balance} / {trustline.limit || 'Unlimited'} {/* Display limit or 'Unlimited' */}
                    </p>
                    <p className="text-xs text-gray-400">Issuer: {trustline.assetIssuer.substring(0, 20)}...</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(tx.type, tx.sourceAccount)}
                    <div>
                      <p className="font-medium capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      {tx.memo && <p className="text-xs text-gray-400">{tx.memo}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {tx.amount} {tx.assetCode}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm text-gray-500 capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}