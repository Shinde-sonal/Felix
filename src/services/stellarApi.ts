const API_BASE_URL = "https://be0a7c624813.ngrok-free.app/api/stellar"

export interface CreateAccountResponse {
    publicKey: string
    secretKey: string
    message: string
}

export interface SendLumensRequest {
    sourceSecret: string
    destinationPublic: string
    amount: string
}

export interface TrustlineRequest {
    accountSecret: string
    limit: string
}

export interface ChangeTrustlineRequest {
    accountSecret: string
    assetCode: string
    issuerPublicKey: string
    limit: string
}

export interface CreateCurrencyRequest {
    issuerSecret: string
    distributorPublicKey: string
    assetCode: string
    amount: string
}

export interface SellServiceRequest {
    sellerSecret: string
    serviceName: string
    description: string
    bludAmount: string
}

export interface BuyServiceRequest {
    buyerSecret: string
    serviceId: string
}

export const stellarApi = {
    // Create new Stellar account
    createAccount: async (): Promise<CreateAccountResponse> => {
        const response = await fetch(`${API_BASE_URL}/account/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })

        if (!response.ok) {
            throw new Error("Failed to create account")
        }

        return response.json()
    },

    // Send Lumens (XLM)
    sendLumens: async (data: SendLumensRequest) => {
        const response = await fetch(`${API_BASE_URL}/transaction/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error("Failed to send lumens")
        }

        return response.json()
    },

    // Create trustline for BLUD
    createTrustline: async (data: TrustlineRequest) => {
        const response = await fetch(`${API_BASE_URL}/trustline`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error("Failed to create trustline")
        }

        return response.json()
    },

    // Change trustline limit
    changeTrustline: async (data: ChangeTrustlineRequest) => {
        const response = await fetch(`${API_BASE_URL}/trustline/change`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(Object.fromEntries(Object.entries(data))),
        })

        if (!response.ok) {
            throw new Error("Failed to change trustline")
        }

        return response.json()
    },


    // Create/Issue currency (BLUD tokens)
    createCurrency: async (data: CreateCurrencyRequest) => {
        const response = await fetch(`${API_BASE_URL}/currency/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                issuerSecret: data.issuerSecret,
                distributorPublicKey: data.distributorPublicKey,
                assetCode: data.assetCode,
                amount: data.amount,
            }),
        })

        if (!response.ok) {
            throw new Error("Failed to create currency")
        }

        return response.json()
    },


    // Sell service
    sellService: async (data: SellServiceRequest) => {
        const response = await fetch(`${API_BASE_URL}/service/sell`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(Object.fromEntries(Object.entries(data))),
        })

        if (!response.ok) {
            throw new Error("Failed to list service for sale")
        }

        return response.json()
    },


    // Buy service
    buyService: async (data: BuyServiceRequest) => {
        const response = await fetch(`${API_BASE_URL}/service/buy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(Object.fromEntries(Object.entries(data))),
        })

        if (!response.ok) {
            throw new Error("Failed to purchase service")
        }

        return response.json()
    }
    ,
}
