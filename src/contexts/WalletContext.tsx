"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { WalletAccount, Transaction } from "../types/wallet"
import { stellarApi } from "../services/stellarApi"
import { useAuth } from "./AuthContext"

interface WalletContextType {
  wallet: WalletAccount | null
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  createWallet: () => Promise<void>
  sendLumens: (destinationPublic: string, amount: string) => Promise<void>
  createTrustline: (limit: string) => Promise<void>
  convertXLMToBLUD: (xlmAmount: string) => Promise<void>
  refreshWallet: () => Promise<void>
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<WalletAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create unique wallet key per user (email + role combination)
  const getWalletKey = () => {
    if (!user) return null
    return `wallet_${user.email}_${user.role}`
  }

  // Load wallet from localStorage on mount
  useEffect(() => {
    const walletKey = getWalletKey()
    if (walletKey) {
      const savedWallet = localStorage.getItem(walletKey)
      const savedTransactions = localStorage.getItem(`${walletKey}_transactions`)

      if (savedWallet) {
        setWallet(JSON.parse(savedWallet))
      }
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
    }
  }, [user])

  const saveWallet = (walletData: WalletAccount) => {
    const walletKey = getWalletKey()
    if (walletKey) {
      localStorage.setItem(walletKey, JSON.stringify(walletData))
      setWallet(walletData)
    }
  }

  const saveTransactions = (txs: Transaction[]) => {
    const walletKey = getWalletKey()
    if (walletKey) {
      localStorage.setItem(`${walletKey}_transactions`, JSON.stringify(txs))
      setTransactions(txs)
    }
  }

  const clearError = () => setError(null)

  const createWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await stellarApi.createAccount()

      const newWallet: WalletAccount = {
        publicKey: response.publicKey,
        secretKey: response.secretKey,
        balance: {
          xlm: "10000", // Default testnet funding
          blud: "0",
        },
        trustlines: [],
      }

      saveWallet(newWallet)

      // Automatically create BLUD trustline
      try {
        await createTrustline("10000000")
      } catch (trustlineError) {
        console.warn("Trustline creation failed, but wallet was created:", trustlineError)
      }
    } catch (error: any) {
      console.error("Error creating wallet:", error)
      setError(error.message || "Failed to create wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendLumens = async (destinationPublic: string, amount: string) => {
    if (!wallet) {
      setError("No wallet available")
      return
    }

    const currentBalance = Number.parseFloat(wallet.balance.xlm)
    const sendAmount = Number.parseFloat(amount)
    const fee = 0.0001

    if (currentBalance < sendAmount + fee) {
      setError(
        `Insufficient XLM balance. You have ${currentBalance} XLM but need ${sendAmount + fee} XLM (including fee)`,
      )
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await stellarApi.sendLumens({
        sourceSecret: wallet.secretKey,
        destinationPublic,
        amount,
      })

      // Add transaction to history
      const newTransaction: Transaction = {
        id: response.result.id,
        hash: response.result.hash,
        sourceAccount: wallet.publicKey,
        destinationAccount: destinationPublic,
        amount,
        assetCode: "XLM",
        type: "payment",
        status: "completed",
        createdAt: response.result.created_at,
      }

      const updatedTransactions = [newTransaction, ...transactions]
      saveTransactions(updatedTransactions)

      // Update wallet balance
      const updatedWallet = {
        ...wallet,
        balance: {
          ...wallet.balance,
          xlm: (currentBalance - sendAmount - fee).toString(),
        },
      }
      saveWallet(updatedWallet)
    } catch (error: any) {
      console.error("Error sending lumens:", error)
      setError(error.message || "Failed to send transaction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const createTrustline = async (limit: string) => {
    if (!wallet) {
      setError("No wallet available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await stellarApi.createTrustline({
        accountSecret: wallet.secretKey,
        limit,
      })

      // Add trustline to wallet
      const newTrustline = {
        assetCode: "BLUD",
        assetIssuer: "ISSUER_PUBLIC_KEY", // This should come from your config
        limit,
        balance: "0",
      }

      const updatedWallet = {
        ...wallet,
        trustlines: [...wallet.trustlines.filter((t) => t.assetCode !== "BLUD"), newTrustline],
      }
      saveWallet(updatedWallet)

      // Add transaction to history
      const newTransaction: Transaction = {
        id: response.result.id,
        hash: response.result.hash,
        sourceAccount: wallet.publicKey,
        amount: "0",
        assetCode: "BLUD",
        type: "trustline",
        status: "completed",
        createdAt: response.result.created_at,
      }

      const updatedTransactions = [newTransaction, ...transactions]
      saveTransactions(updatedTransactions)
    } catch (error: any) {
      console.error("Error creating trustline:", error)
      setError(error.message || "Failed to create trustline. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const convertXLMToBLUD = async (xlmAmount: string) => {
    if (!wallet) {
      setError("No wallet available")
      return
    }

    const xlmBalance = Number.parseFloat(wallet.balance.xlm)
    const convertAmount = Number.parseFloat(xlmAmount)

    if (xlmBalance < convertAmount) {
      setError(`Insufficient XLM balance. You have ${xlmBalance} XLM but need ${convertAmount} XLM`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Convert XLM to BLUD using the currency creation API
      // This assumes 1 XLM = 100 BLUD conversion rate
      const bludAmount = (convertAmount * 100).toString()

      const response = await stellarApi.createCurrency({
        issuerSecret: wallet.secretKey, // In real app, this would be the issuer's secret
        distributorPublicKey: wallet.publicKey,
        assetCode: "BLUD",
        amount: bludAmount,
      })

      // Update wallet balances
      const updatedWallet = {
        ...wallet,
        balance: {
          xlm: (xlmBalance - convertAmount).toString(),
          blud: (Number.parseFloat(wallet.balance.blud) + Number.parseFloat(bludAmount)).toString(),
        },
      }
      saveWallet(updatedWallet)

      // Add transaction to history
      const newTransaction: Transaction = {
        id: response.result.id,
        hash: response.result.hash,
        sourceAccount: wallet.publicKey,
        amount: bludAmount,
        assetCode: "BLUD",
        type: "service",
        status: "completed",
        createdAt: response.result.created_at,
        memo: `Converted ${xlmAmount} XLM to ${bludAmount} BLUD`,
      }

      const updatedTransactions = [newTransaction, ...transactions]
      saveTransactions(updatedTransactions)
    } catch (error: any) {
      console.error("Error converting XLM to BLUD:", error)
      setError(error.message || "Failed to convert XLM to BLUD. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshWallet = async () => {
    // In a real app, you'd fetch the latest balance from Stellar
    const walletKey = getWalletKey()
    if (walletKey) {
      const savedWallet = localStorage.getItem(walletKey)
      const savedTransactions = localStorage.getItem(`${walletKey}_transactions`)

      if (savedWallet) {
        setWallet(JSON.parse(savedWallet))
      }
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        isLoading,
        error,
        createWallet,
        sendLumens,
        createTrustline,
        convertXLMToBLUD,
        refreshWallet,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}