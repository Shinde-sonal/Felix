// services/stellarApi.ts

const API_BASE_URL = "https://be0a7c624813.ngrok-free.app/api/stellar" // Keeping your ngrok URL

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

// NOTE: This interface for 'TrustlineRequest' is used by your 'createTrustline' function
// which hits the /trustline endpoint. If that endpoint is meant for a generic trustline
// (not asset-specific), then this is fine.
export interface TrustlineRequest {
    accountSecret: string
    limit: string
}

// Updated based on your latest curl command for currency create
export interface CreateCurrencyRequest {
    issuerSecret: string
    assetCode: string
    // distributorPublicKey and amount are no longer in the curl, so removed from required fields
}

// New interface for sending custom currency
export interface SendCurrencyRequest {
    issuerSecret: string
    receiverPublicKey: string
    assetCode: string
    amount: string,
    memo?: string // Made memo optional as it's optional in the sendBlud context
}

// UPDATED: SellServiceRequest to include assetCode and issuerPublicKey
export interface SellServiceRequest {
    sellerSecret: string
    serviceName: string
    description: string
    bludAmount: string
    assetCode: string // Added based on curl
    issuerPublicKey: string // Added based on curl
}

export interface BuyServiceRequest {
    buyerSecret: string
    serviceId: string
}

export interface AccountBalanceResponse {
    publicKey: string;
    result: Array<{
        asset_code?: string;
        asset_type: string;
        balance: string;
        asset_issuer?: string;
    }>;
}

// Define the structure of a single service item as returned by the API
export interface ApiServiceItem {
    id: string;
    seller_public_key: string; // Note the snake_case here
    name: string;
    description: string;
    blud_price: string; // Note the snake_case here
    status: string;
    created_at: string; // Note the snake_case here
}

// Define the full response structure for getSellServices
export interface GetSellServicesResponse {
    success: boolean;
    message: string;
    data: ApiServiceItem[]; // The array of service items is inside 'data'
}

// Updated to match your latest curl command for trustline change (limit is optional)
export interface ChangeTrustlineRequest {
    accountSecret: string;
    assetCode: string;
    issuerPublicKey: string;
    limit?: string; // Made optional as per your latest curl
}

export const stellarApi = {
    createAccount: async (): Promise<CreateAccountResponse> => {
        const response = await fetch(`${API_BASE_URL}/account/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to create account")
        }
        return response.json()
    },

    getAccountBalance: async (publicKey: string): Promise<AccountBalanceResponse> => {
        const response = await fetch(`${API_BASE_URL}/account/balance/${publicKey}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", 'ngrok-skip-browser-warning': 'true' },
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to fetch account balance")
        }
        return response.json()
    },

    sendLumens: async (data: SendLumensRequest) => {
        const response = await fetch(`${API_BASE_URL}/transaction/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to send lumens")
        }
        return response.json()
    },

    // This 'createTrustline' function remains as it was, hitting the /trustline endpoint.
    // If this endpoint is for a generic trustline without asset/issuer, it's correct.
    createTrustline: async (data: TrustlineRequest) => {
        const response = await fetch(`${API_BASE_URL}/trustline`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // Assuming JSON for this endpoint
            body: JSON.stringify({ accountSecret: data.accountSecret, limit: data.limit }),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to create trustline")
        }
        return response.json()
    },

    // This 'changeTrustline' function is updated to match your latest curl command
    changeTrustline: async (data: ChangeTrustlineRequest) => {
        const params = new URLSearchParams({
            accountSecret: data.accountSecret,
            assetCode: data.assetCode,
            issuerPublicKey: data.issuerPublicKey,
        });
        // Only add limit if it's provided
        if (data.limit !== undefined) {
            params.append('limit', data.limit);
        }

        const response = await fetch(`${API_BASE_URL}/trustline/change`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to change trustline")
        }
        return response.json()
    },

    // This 'createCurrency' function is updated to match your latest curl command
    createCurrency: async (data: CreateCurrencyRequest) => {
        const response = await fetch(`${API_BASE_URL}/currency/create`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                issuerSecret: data.issuerSecret,
                assetCode: data.assetCode,
                // distributorPublicKey and amount are no longer sent as per new curl
            }),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to create currency")
        }
        return response.json()
    },

    // New function to send custom currency
    sendCurrency: async (data: SendCurrencyRequest) => {
        const params = new URLSearchParams({
            issuerSecret: data.issuerSecret,
            receiverPublicKey: data.receiverPublicKey,
            assetCode: data.assetCode,
            amount: data.amount,
        });
        if (data.memo) { // Only append memo if it's provided
            params.append('memo', data.memo);
        }

        const response = await fetch(`${API_BASE_URL}/currency/send`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to send currency")
        }
        return response.json()
    },

    // UPDATED: sellService to correctly send all parameters from SellServiceRequest
    sellService: async (data: SellServiceRequest) => {
        const response = await fetch(`${API_BASE_URL}/service/sell`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            // Directly use new URLSearchParams(data as any) if data exactly matches the keys expected by URLSearchParams,
            // otherwise, explicitly define the parameters to avoid issues with extra fields.
            body: new URLSearchParams({
                sellerSecret: data.sellerSecret,
                serviceName: data.serviceName,
                description: data.description,
                bludAmount: data.bludAmount,
                assetCode: data.assetCode, // Added
                issuerPublicKey: data.issuerPublicKey, // Added
            }),
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to list service for sale");
        }
        return response.json();
    },

    getSellServices: async (): Promise<GetSellServicesResponse> => {
        const response = await fetch(`${API_BASE_URL}/service`, {
            method: "GET",
            headers: { "Content-Type": "application/json", 'ngrok-skip-browser-warning': 'true' },
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to fetch available services")
        }
        return response.json()
    },

    buyService: async (data: BuyServiceRequest) => {
        const response = await fetch(`${API_BASE_URL}/service/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(Object.fromEntries(Object.entries(data))),
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to purchase service");
        }
        return response.json();
    }
}