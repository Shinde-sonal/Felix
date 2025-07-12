export interface WalletAccount {
    publicKey: string
    secretKey: string
    balance: {
        xlm: string
        blud: string
    }
    trustlines: Trustline[]
}

export interface Trustline {
    assetCode: string
    assetIssuer: string
    limit: string
    balance: string
}

export interface Transaction {
    id: string
    hash: string
    sourceAccount: string
    destinationAccount?: string
    amount: string
    assetCode: string
    type: "payment" | "trustline" | "offer" | "service"
    status: "pending" | "completed" | "failed"
    createdAt: string
    memo?: string
}

export interface Service {
    id: string
    sellerPublicKey: string
    name: string
    description: string
    bludPrice: string
    status: "available" | "sold" | "pending"
    createdAt: string
}

export interface ServiceTransaction {
    id: string
    serviceId: string
    buyerPublicKey: string
    sellerPublicKey: string
    bludAmount: string
    transactionHash: string
    createdAt: string
}
