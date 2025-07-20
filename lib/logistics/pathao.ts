import type { IOrder } from "@/lib/models/order"

export interface PathaoConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  username: string
  password: string
  accessToken?: string
}

export interface PathaoOrderRequest {
  store_id: number
  merchant_order_id: string
  sender_name: string
  sender_phone: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  recipient_city: number
  recipient_zone: number
  delivery_type: number
  item_type: number
  special_instruction?: string
  item_quantity: number
  item_weight: number
  amount_to_collect: number
  item_description: string
}

export interface PathaoOrderResponse {
  type: string
  message: string
  data: {
    consignment_id: string
    merchant_order_id: string
    order_status: string
    delivery_fee: number
  }
}

export class PathaoService {
  private config: PathaoConfig

  constructor(config: PathaoConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://courier-api.pathao.com/api/v1",
    }
  }

  private async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/issue-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          username: this.config.username,
          password: this.config.password,
          grant_type: "password",
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.config.accessToken = data.access_token
      return data.access_token
    } catch (error) {
      console.error("Pathao authentication error:", error)
      throw new Error("Failed to authenticate with Pathao API")
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.config.accessToken) {
      return await this.authenticate()
    }
    return this.config.accessToken
  }

  async getCities(): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.baseUrl}/cities`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`)
    }

    return response.json()
  }

  async getZones(cityId: number): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.baseUrl}/cities/${cityId}/zone-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch zones: ${response.statusText}`)
    }

    return response.json()
  }

  async getStores(): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.baseUrl}/stores`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.statusText}`)
    }

    return response.json()
  }

  private mapCityNameToId(cityName: string): number {
    // Common Bangladesh cities mapping - you should get this from getCities() API
    const cityMapping: { [key: string]: number } = {
      dhaka: 1,
      chittagong: 2,
      sylhet: 3,
      rajshahi: 4,
      barisal: 5,
      khulna: 6,
      rangpur: 7,
      mymensingh: 8,
    }

    const normalizedCity = cityName.toLowerCase().trim()
    return cityMapping[normalizedCity] || 1 // Default to Dhaka
  }

  private mapDistrictToZoneId(district: string, cityId: number): number {
    // This is a simplified mapping - in production, use the getZones() API
    // Default zone IDs for major areas
    const zoneMapping: { [key: string]: number } = {
      // Dhaka zones
      dhanmondi: 1,
      gulshan: 2,
      uttara: 3,
      motijheel: 4,
      olddhaka: 5,
      // Add more mappings as needed
    }

    const normalizedDistrict = district.toLowerCase().trim()
    return zoneMapping[normalizedDistrict] || 1 // Default zone
  }

  async createOrder(order: IOrder, storeId: number): Promise<PathaoOrderResponse> {
    const token = await this.getAccessToken()

    const cityId = this.mapCityNameToId(order.shippingAddress.city || "Dhaka")
    const zoneId = this.mapDistrictToZoneId(order.shippingAddress.district, cityId)
    // If you have area_id, map it here, else leave undefined
    const areaId = order.shippingAddress.areaId || undefined

    const payload: any = {
      store_id: storeId,
      merchant_order_id: order._id.toString(),
      recipient_name: order.shippingAddress.fullName,
      recipient_phone: order.shippingAddress.phone || "01700000000",
      recipient_address: order.shippingAddress.address,
      recipient_city: cityId,
      recipient_zone: zoneId,
      delivery_type: 48, // 48 hours delivery
      item_type: 2, // Parcel
      special_instruction: `Order #${order._id.toString().slice(-8)} - E-commerce delivery`,
      item_quantity: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      item_weight: 0.5, // Default weight in kg
      amount_to_collect: order.isPaid ? 0 : order.totalPrice,
      item_description: order.orderItems
        .map((item) => `${item.name} x${item.quantity}`)
        .join(", ")
        .substring(0, 250), // Limit description length
    }
    if (areaId) payload.recipient_area = areaId

    const response = await fetch(`${this.config.baseUrl}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorJson = JSON.parse(error)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {}
      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  }

  async getOrderStatus(consignmentId: string): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.baseUrl}/orders/${consignmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.statusText}`)
    }

    return response.json()
  }

  async cancelOrder(consignmentId: string): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.config.baseUrl}/orders/${consignmentId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`)
    }

    return response.json()
  }
}

export function createPathaoService(): PathaoService {
  const config: PathaoConfig = {
    baseUrl: process.env.PATHAO_API_URL || "https://courier-api.pathao.com/api/v1",
    clientId: process.env.PATHAO_CLIENT_ID!,
    clientSecret: process.env.PATHAO_CLIENT_SECRET!,
    username: process.env.PATHAO_USERNAME!,
    password: process.env.PATHAO_PASSWORD!,
  }

  // Validate required environment variables
  if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
    throw new Error("Missing required Pathao API configuration")
  }

  return new PathaoService(config)
}