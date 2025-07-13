// contexts/WalletContext.tsx
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { WalletAccount, Transaction, Trustline } from "../types/wallet"
import { stellarApi } from "../services/stellarApi"
import { useAuth } from "./AuthContext"

interface WalletContextType {
  wallet: WalletAccount | null
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  createWallet: () => Promise<void>
  sendLumens: (destinationPublic: string, amount: string) => Promise<void>
  establishBludTrustline: (assetCode: string, issuerPublicKey: string, limit: string) => Promise<void>
  refreshWallet: () => Promise<void>
  clearError: () => void
  // Added for admin-specific BLUD sending
  sendBlud?: (receiverPublicKey: string, amount: string, memo?: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<WalletAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getWalletKey = useCallback(() => {
    if (!user) return null
    return `wallet_${user.email}_${user.role}`
  }, [user])

  const saveWalletLocally = useCallback(
    (walletData: WalletAccount) => {
      const walletKey = getWalletKey()
      if (walletKey) {
        localStorage.setItem(walletKey, JSON.stringify(walletData))
        setWallet(walletData)
      }
    },
    [getWalletKey],
  )

  const saveTransactionsLocally = useCallback(
    (txs: Transaction[]) => {
      const walletKey = getWalletKey()
      if (walletKey) {
        localStorage.setItem(`${walletKey}_transactions`, JSON.stringify(txs))
        setTransactions(txs)
      }
    },
    [getWalletKey],
  )

  const clearError = () => setError(null)

  const refreshWallet = useCallback(async () => {
    const walletKey = getWalletKey()
    if (!walletKey) {
      setWallet(null)
      setTransactions([])
      return
    }

    const savedWallet = localStorage.getItem(walletKey)
    if (!savedWallet) {
      setWallet(null)
      setTransactions([])
      return
    }

    const currentWallet: WalletAccount = JSON.parse(savedWallet)
    setIsLoading(true)
    setError(null)

    try {
      const balanceResponse = await stellarApi.getAccountBalance(currentWallet.publicKey)
      const balances = balanceResponse.result || []

      const xlmBalance = balances.find((b: any) => b.asset_type === "native")?.balance || "0"

      let bludBalance = "0";
      // Removed bludLimit here as it's not directly displayed in Wallet.tsx's balance summary
      const updatedTrustlines: Trustline[] = [];

      balances.forEach((b: any) => {
        if (b.asset_type !== "native" && b.asset_code && b.asset_issuer) {
          const trustline: Trustline = {
            assetCode: b.asset_code,
            assetIssuer: b.asset_issuer,
            balance: b.balance,
            limit: b.limit || "0",
          };
          updatedTrustlines.push(trustline);

          if (b.asset_code === "BLUD") {
            bludBalance = b.balance;
          }
        }
      });

      const updatedWallet: WalletAccount = {
        ...currentWallet,
        balance: {
          xlm: xlmBalance,
          blud: bludBalance,
        },
        trustlines: updatedTrustlines,
      }
      saveWalletLocally(updatedWallet)

      const savedTransactions = localStorage.getItem(`${walletKey}_transactions`)
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
    } catch (err: any) {
      console.error("Error refreshing wallet:", err)
      setError(err.message || "Failed to refresh wallet balance.")
    } finally {
      setIsLoading(false)
    }
  }, [getWalletKey, saveWalletLocally])

  useEffect(() => {
    if (user) {
      refreshWallet()
    } else {
      setWallet(null)
      setTransactions([])
    }
  }, [user, refreshWallet])

  const createWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await stellarApi.createAccount()

      const newWallet: WalletAccount = {
        publicKey: response.publicKey,
        secretKey: response.secretKey,
        balance: {
          xlm: "0",
          blud: "0",
        },
        trustlines: [],
      }

      saveWalletLocally(newWallet)
      await refreshWallet()
    } catch (err: any) {
      console.error("Error creating wallet:", err)
      setError(err.message || "Failed to create wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendLumens = async (destinationPublic: string, amount: string) => {
    if (!wallet) {
      setError("No wallet available")
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
      saveTransactionsLocally(updatedTransactions)
      await refreshWallet()
    } catch (err: any) {
      console.error("Error sending lumens:", err)
      setError(err.message || "Failed to send transaction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const establishBludTrustline = useCallback(async (assetCode: string, issuerPublicKey: string, limit: string) => {
    if (!wallet) {
      setError("No wallet available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await stellarApi.changeTrustline({
        accountSecret: wallet.secretKey,
        assetCode: assetCode,
        issuerPublicKey: issuerPublicKey,
        limit: limit,
      })

      const newTransaction: Transaction = {
        id: response.result?.id || `trustline-${Date.now()}`,
        hash: response.result?.hash || `hash-${Date.now()}`,
        sourceAccount: wallet.publicKey,
        amount: "0",
        assetCode: assetCode,
        type: "trustline",
        status: "completed",
        createdAt: response.result?.created_at || new Date().toISOString(),
      }

      const updatedTransactions = [newTransaction, ...transactions]
      saveTransactionsLocally(updatedTransactions)
      await refreshWallet()
    } catch (err: any) {
      console.error("Error establishing trustline:", err)
      setError(
        err.message ||
          `Failed to establish ${assetCode} trustline. Please ensure your account has enough XLM to cover transaction fees (0.5 XLM per trustline).`,
      )
    } finally {
      setIsLoading(false)
    }
  }, [wallet, setIsLoading, setError, refreshWallet, saveTransactionsLocally, transactions])

  // Admin-specific function to send BLUD
  const sendBlud = useCallback(async (receiverPublicKey: string, amount: string, memo?: string) => {
    if (!user || user.role !== 'admin') {
      setError("Permission denied. Only admins can send BLUD this way.");
      return;
    }

    if (!wallet || !wallet.secretKey) {
        setError("Admin wallet not loaded or secret key missing.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const BLUD_ASSET_CODE = "BLUD"; // Assuming BLUD is the asset admin will issue

      const response = await stellarApi.sendCurrency({
        issuerSecret: wallet.secretKey, // Admin's secret key is the issuer's secret
        receiverPublicKey: receiverPublicKey,
        assetCode: BLUD_ASSET_CODE,
        amount: amount,
        memo: memo || BLUD_ASSET_CODE
      });

      const newTransaction: Transaction = {
        id: response.result?.id || `sendblud-${Date.now()}`,
        hash: response.result?.hash || `hash-${Date.now()}`,
        sourceAccount: wallet.publicKey, // Admin's public key
        destinationAccount: receiverPublicKey,
        amount: amount,
        assetCode: BLUD_ASSET_CODE,
        type: "payment",
        status: "completed",
        createdAt: response.result?.created_at || new Date().toISOString(),
      };

      const updatedTransactions = [newTransaction, ...transactions];
      saveTransactionsLocally(updatedTransactions);
      await refreshWallet();
    } catch (err: any) {
      console.error("Error sending BLUD:", err);
      // General error message, no balance validation specific message
      setError(err.message || "Failed to send BLUD. Please ensure the recipient has a BLUD trustline and the Stellar network conditions are met.");
    } finally {
      setIsLoading(false);
    }
  }, [user, wallet, setIsLoading, setError, refreshWallet, saveTransactionsLocally, transactions]);


  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        isLoading,
        error,
        createWallet,
        sendLumens,
        establishBludTrustline,
        refreshWallet,
        clearError,
        sendBlud: user?.role === 'admin' ? sendBlud : undefined, // Conditionally provide sendBlud
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