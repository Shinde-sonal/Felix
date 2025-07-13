// pages/IssueBLUD.tsx
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
import { ErrorAlert } from "../../components/ui/ErrorAlert"
import { useWallet } from "../contexts/WalletContext"
import { stellarApi } from "../services/stellarApi" // stellarApi is still used for createCurrency
import { Coins, Send, History, AlertTriangle, CheckCircle, Clock, TrendingUp, PlusCircle, Copy } from "lucide-react" // Added Copy for clipboard

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
  const { wallet, error, clearError, refreshWallet, sendBlud, isLoading } = useWallet() // Get sendBlud from context

  // State for the "Send Currency" form
  const [sendFormData, setSendFormData] = useState({
    amount: "",
    recipient: "",
    memo: "",
  })
  // isSending and isLoading from useWallet are now combined.
  // We'll primarily use the `isLoading` from `useWallet`
  const [sendError, setSendError] = useState<string | null>(null) // Local error for send form

  // State for the "Create Asset" form
  const [createAssetCode, setCreateAssetCode] = useState<string>("")
  const [isCreatingAsset, setIsCreatingAsset] = useState(false) // Local loading for create asset form
  const [createAssetError, setCreateAssetError] = useState<string | null>(null) // Local error for create asset form
  const [assetCreationSuccess, setAssetCreationSuccess] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions) // Local state for mock transactions


  const clearSendError = () => setSendError(null)
  const clearCreateAssetError = () => setCreateAssetError(null)
  const clearAssetCreationSuccess = () => setAssetCreationSuccess(null);


  // Handler for creating the asset (currency/create)
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setCreateAssetError("Admin wallet not found. Please create your admin wallet first.");
      return;
    }
    if (!wallet.secretKey) {
        setCreateAssetError("Admin wallet secret key is missing. Cannot create asset.");
        return;
    }


    if (!createAssetCode || createAssetCode.trim() === "") {
        setCreateAssetError("Asset Code cannot be empty.");
        return;
    }
    if (createAssetCode.trim().length > 12) {
        setCreateAssetError("Asset Code cannot be longer than 12 characters.");
        return;
    }
    // Basic alphanumeric check, Stellar asset codes are usually uppercase
    if (!/^[a-zA-Z0-9]+$/.test(createAssetCode.trim())) {
        setCreateAssetError("Asset Code must be alphanumeric.");
        return;
    }


    setIsCreatingAsset(true);
    setCreateAssetError(null);
    setAssetCreationSuccess(null);

    try {
        const response = await stellarApi.createCurrency({
            issuerSecret: wallet.secretKey,
            assetCode: createAssetCode.toUpperCase().trim(), // Ensure asset code is uppercase and trimmed
        });
        console.log("response", response)
        setAssetCreationSuccess(`Asset '${createAssetCode.toUpperCase().trim()}' created successfully!`);
        setCreateAssetCode(""); // Clear the input
        await refreshWallet(); // Refresh wallet to show potential new asset lines if backend does that
    } catch (err: any) {
        console.error("Error creating asset:", err);
        setCreateAssetError(err.message || "Failed to create asset. Check if asset already exists or issuer is funded.");
    } finally {
        setIsCreatingAsset(false);
    }
  };


  // Handler for sending/distributing currency (currency/send)
  const handleSendCurrency = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) {
      setSendError("Admin wallet not found. Please create your admin wallet first.")
      return
    }
    if (!sendBlud) { // Check if sendBlud is available (i.e., user is admin)
        setSendError("BLUD sending functionality is not available for your role.");
        return;
    }

    // Client-side form validation (only format/presence, no balance checks)
    if (!sendFormData.amount || parseFloat(sendFormData.amount) <= 0) {
        setSendError("Please enter a valid positive amount to send.");
        return;
    }
    if (!sendFormData.recipient || sendFormData.recipient.trim() === "") {
        setSendError("Please enter a recipient public key.");
        return;
    }
    if (!sendFormData.recipient.startsWith("G") || sendFormData.recipient.length !== 56) {
        setSendError("Invalid Stellar Public Key format for recipient. It should start with 'G' and be 56 characters long.");
        return;
    }


    // `isLoading` from useWallet covers the loading state for sendBlud
    setSendError(null); // Clear previous send errors

    try {
      // Call the sendBlud function from the WalletContext
      await sendBlud(sendFormData.recipient.trim(), sendFormData.amount.trim(), sendFormData.memo.trim());

      // If no error from sendBlud (handled by useWallet's error state), then proceed:
      if (!error && !isLoading) { // Check global error and loading from useWallet
          const newTransaction: Transaction = {
            id: new Date().getTime().toString(), // Simple unique ID
            amount: Number.parseFloat(sendFormData.amount),
            recipient: sendFormData.recipient,
            status: "completed", // Assume completed if no error from API
            timestamp: new Date().toISOString(),
            txHash: "N/A (check blockchain)", // txHash needs to come from stellarApi response if available
          };

          // Mock transactions were being used, but `sendBlud` in context will update context's transactions
          // It's better to rely on `useWallet().transactions` if it gets updated by `sendBlud`.
          // If `sendBlud` only updates the *admin's* transactions in localStorage, then this local state is fine.
          // For now, I'll assume this component's `transactions` state is for local display.
          setTransactions((prev) => [newTransaction, ...prev]);

          setSendFormData({ amount: "", recipient: "", memo: "" }); // Clear send form fields
          // refreshWallet() is already called by sendBlud
      }
    } catch (err: any) {
        // This catch block would only be hit if `sendBlud` itself throws an error before reaching stellarApi.sendCurrency,
        // as stellarApi errors are usually caught within sendBlud and set the context error.
        console.error("Unexpected error in handleSendCurrency:", err);
        setSendError("An unexpected error occurred during sending.");
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

  // Function to copy to clipboard (added for public key display)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4"> {/* Added p-4 padding */}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <Coins className="h-8 w-8 text-yellow-500" />
          <span>Admin Asset Management</span>
        </h1>
        <p className="text-gray-600">Create and manage custom assets on the Stellar blockchain</p>
      </div>

      <ErrorAlert error={error || sendError || createAssetError} onClose={() => { clearError(); clearSendError(); clearCreateAssetError(); }} />
      {assetCreationSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{assetCreationSuccess}</AlertDescription>
            <Button variant="ghost" size="sm" onClick={clearAssetCreationSuccess} className="absolute top-2 right-2">x</Button>
        </Alert>
      )}


      {!wallet && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Admin Wallet Required</p>
                <p className="text-sm">
                  You need to create your admin wallet to manage assets. Go to your Wallet page to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued (BLUD)</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">BLUD tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending (BLUD)</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">BLUD tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions (BLUD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total BLUD transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin BLUD Balance</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{wallet?.balance.blud || "0"}</div>
            <p className="text-xs text-muted-foreground">Your BLUD balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form to Create New Asset */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Asset</CardTitle>
            <CardDescription>Define a new custom asset on the Stellar network (e.g., USD, EUR)</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Creating an asset is a one-time operation. The asset code must be 1-12 alphanumeric characters.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleCreateAsset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input
                  id="assetCode"
                  placeholder="e.g., MYTOKEN"
                  value={createAssetCode}
                  onChange={(e) => setCreateAssetCode(e.target.value)}
                  required
                  maxLength={12}
                  disabled={!wallet || isCreatingAsset}
                />
                <p className="text-xs text-gray-500">The code for your new asset (e.g., BLUD, USD, EUR). Max 12 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={!wallet || isCreatingAsset}>
                {isCreatingAsset ? (
                  "Creating Asset..."
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Asset
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form to Send/Distribute Existing Currency */}
        <Card>
          <CardHeader>
            <CardTitle>Send/Distribute Existing Asset</CardTitle>
            <CardDescription>Distribute your existing BLUD tokens to a recipient</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ensure the recipient has established a trustline for BLUD before sending.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSendCurrency} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sendAmount">Amount *</Label>
                <Input
                  id="sendAmount"
                  type="number"
                  placeholder="Enter amount to send"
                  value={sendFormData.amount}
                  onChange={(e) => setSendFormData({ ...sendFormData, amount: e.target.value })}
                  required
                  disabled={!wallet || isLoading}
                />
                <p className="text-xs text-gray-500">Number of BLUD tokens to send</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sendRecipient">Recipient Address *</Label>
                <Input
                  id="sendRecipient"
                  placeholder="Stellar public key (G...)"
                  value={sendFormData.recipient}
                  onChange={(e) => setSendFormData({ ...sendFormData, recipient: e.target.value })}
                  required
                  disabled={!wallet || isLoading}
                />
                <p className="text-xs text-gray-500">Stellar public key starting with 'G'</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sendMemo">Memo (Optional)</Label>
                <Textarea
                  id="sendMemo"
                  placeholder="Transaction memo"
                  value={sendFormData.memo}
                  onChange={(e) => setSendFormData({ ...sendFormData, memo: e.target.value })}
                  rows={3}
                  disabled={!wallet || isLoading}
                />
                <p className="text-xs text-gray-500">Optional memo for the transaction</p>
              </div>

              <Button type="submit" className="w-full" disabled={!wallet || isLoading}>
                {isLoading ? ( // Use global isLoading for this button
                  "Sending Tokens..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send BLUD Tokens
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Recent BLUD Send Transactions</span>
          </CardTitle>
          <CardDescription>Latest BLUD token distribution transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No send transactions yet</p>
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
              <p className="font-medium">Default Asset Code</p>
              <p className="text-sm text-gray-600">BLUD</p>
            </div>
            <div>
              <p className="font-medium">Issuer Account</p>
              <p className="text-sm text-gray-600">
                {wallet?.publicKey.substring(0, 20)}... (Your Admin Wallet){" "}
                <Button variant="ghost" size="sm" onClick={() => wallet?.publicKey && copyToClipboard(wallet.publicKey)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}