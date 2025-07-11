"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Coins, Send, History, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  recipient: string
  status: "pending" | "completed" | "failed"
  timestamp: string
  txHash?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 1000,
    recipient: "GCKFBEIYTKP6RJQBQXPQWHWCMQWQRJQXJQXJQXJQXJQXJQXJQXJQXJQX",
    status: "completed",
    timestamp: "2024-01-15T10:30:00Z",
    txHash: "0x1234567890abcdef",
  },
  {
    id: "2",
    amount: 500,
    recipient: "GDCKFBEIYTKP6RJQBQXPQWHWCMQWQRJQXJQXJQXJQXJQXJQXJQXJQXJQ",
    status: "pending",
    timestamp: "2024-01-15T11:15:00Z",
  },
]

export const IssueBLUD: React.FC = () => {
  const [formData, setFormData] = useState({
    amount: "",
    recipient: "",
    memo: "",
  })
  const [isIssuing, setIsIssuing] = useState(false)
  const [transactions] = useState<Transaction[]>(mockTransactions)

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsIssuing(true)

    try {
      // Simulate Stellar transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Issuing BLUD tokens:", formData)

      // Reset form
      setFormData({ amount: "", recipient: "", memo: "" })

      // Show success message
      alert("BLUD tokens issued successfully!")
    } catch (error) {
      console.error("Error issuing BLUD tokens:", error)
      alert("Failed to issue BLUD tokens. Please try again.")
    } finally {
      setIsIssuing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalIssued = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)

  const pendingAmount = transactions.filter((t) => t.status === "pending").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <Coins className="h-8 w-8 text-yellow-500" />
          <span>Issue BLUD Tokens</span>
        </h1>
        <p className="text-gray-600">Manage BLUD token issuance on the Stellar blockchain</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">BLUD tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">BLUD tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((transactions.filter((t) => t.status === "completed").length / transactions.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Form */}
        <Card>
          <CardHeader>
            <CardTitle>Issue New Tokens</CardTitle>
            <CardDescription>Create and distribute BLUD tokens on the Stellar network</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Token issuance is irreversible. Please verify all details before proceeding.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleIssue} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount to issue"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Number of BLUD tokens to issue</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address *</Label>
                <Input
                  id="recipient"
                  placeholder="Stellar public key (G...)"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Stellar public key starting with 'G'</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">Memo (Optional)</Label>
                <Textarea
                  id="memo"
                  placeholder="Transaction memo"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-gray-500">Optional memo for the transaction</p>
              </div>

              <Button type="submit" className="w-full" disabled={isIssuing}>
                {isIssuing ? (
                  "Issuing Tokens..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Issue BLUD Tokens
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>Latest BLUD token issuance transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{tx.amount.toLocaleString()} BLUD</p>
                        <p className="text-sm text-gray-500">To: {tx.recipient.substring(0, 20)}...</p>
                      </div>
                      <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                    </div>

                    <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>

                    {tx.txHash && (
                      <div className="text-xs">
                        <span className="text-gray-500">TX: </span>
                        <code className="bg-gray-100 px-1 rounded">{tx.txHash.substring(0, 16)}...</code>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Info */}
      <Card>
        <CardHeader>
          <CardTitle>Stellar Network Information</CardTitle>
          <CardDescription>Current blockchain network status and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-medium">Network</p>
              <p className="text-sm text-gray-600">Stellar Testnet</p>
            </div>
            <div>
              <p className="font-medium">Asset Code</p>
              <p className="text-sm text-gray-600">BLUD</p>
            </div>
            <div>
              <p className="font-medium">Issuer Account</p>
              <p className="text-sm text-gray-600">GCKFBEIYTKP6RJ...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}