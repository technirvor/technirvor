import type { IOrder } from "@/lib/models/order"

export interface RedxConfig {
  baseUrl: string
  apiKey: string
}

export interface RedxOrderRequest {
  customer_name: string
  customer_phone: string
  delivery_area: string
  delivery_area_id: number
  customer_address: string
  merchant_invoice_id: string
  cash_collection_amount: number
  parcel_weight: number
  instruction: string
  value: number
}

export interface RedxOrderResponse {
  success: boolean
  message: string
  tracking_id: string
  errors?: any
}

export interface RedxStatusResponse {
  success: boolean
  tracking_info: {
    tracking_id: string
    current_status: string
    delivered_at: string | null
    parcel_details: {
      customer_name: string
      customer_phone: string
      customer_address: string
      cash_collection_amount: number
      parcel_weight: number
    }
  }
}

export class RedxService {
  private config: RedxConfig

  constructor(config: RedxConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://openapi.redx.com.bd/v1.0.0-beta",
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    }
  }

  async getAreas(): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/areas`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch areas: ${response.statusText}`)
    }

    return response.json()
  }

  private mapCityToAreaId(city: string): number {
    // Common area IDs for major Bangladesh cities
    // In production, fetch this from getAreas() API
    const areaMapping: { [key: string]: number } = {
      dhaka: 1,
      chittagong: 2,
      sylhet: 58,
      rajshahi: 46,
      khulna: 30,
      barisal: 6,
      rangpur: 48,
      mymensingh: 38,
      cumilla: 15,
      gazipur: 23,
      narayanganj: 39,
      // Add more mappings as needed
    }

    const normalizedCity = city.toLowerCase().trim()
    return areaMapping[normalizedCity] || 1 // Default to Dhaka
  }

  async createOrder(order: IOrder): Promise<RedxOrderResponse> {
    const areaId = this.mapCityToAreaId(order.shippingAddress.city || "Dhaka")
    
    const payload: RedxOrderRequest = {
      customer_name: order.shippingAddress.fullName,
      customer_phone: order.shippingAddress.phone || "01700000000",
      delivery_area: order.shippingAddress.city || "Dhaka",
      delivery_area_id: areaId,
      customer_address: `${order.shippingAddress.address}, ${order.shippingAddress.district} - ${order.shippingAddress.postalCode}`,
      merchant_invoice_id: order._id.toString(),
      cash_collection_amount: order.isPaid ? 0 : Math.round(order.totalPrice),
      parcel_weight: 500, // Default weight in grams
      instruction: `E-commerce Order #${order._id.toString().slice(-8)} - Handle with care. Items: ${order.orderItems
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", ")
        .substring(0, 150)}`,
      value: Math.round(order.totalPrice),
    }

    const response = await fetch(`${this.config.baseUrl}/parcel`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      
      throw new Error(`Failed to create Redx parcel: ${errorMessage}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || "Failed to create Redx parcel")
    }

    return result
  }

  async getOrderStatus(trackingId: string): Promise<RedxStatusResponse> {
    const response = await fetch(`${this.config.baseUrl}/parcel/track?tracking_id=${trackingId}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to get parcel status: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || "Failed to get parcel status")
    }

    return result
  }

  async getBulkStatus(trackingIds: string[]): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/parcel/track/bulk`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        tracking_ids: trackingIds,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get bulk status: ${response.statusText}`)
    }

    return response.json()
  }

  async cancelOrder(trackingId: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/parcel/cancel`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        tracking_id: trackingId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel parcel: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || "Failed to cancel parcel")
    }

    return result
  }

  async getDeliveryCharge(areaId: number, weight: number, codAmount: number = 0): Promise<any> {
    const response = await fetch(
      `${this.config.baseUrl}/delivery-charge?area_id=${areaId}&weight=${weight}&cod_amount=${codAmount}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get delivery charge: ${response.statusText}`)
    }

    return response.json()
  }
}

export function createRedxService(): RedxService {
  const config: RedxConfig = {
    baseUrl: process.env.REDX_API_URL || "https://openapi.redx.com.bd/v1.0.0-beta",
    apiKey: process.env.REDX_API_KEY!,
  }

  // Validate required environment variables
  if (!config.apiKey) {
    throw new Error("Missing required Redx API configuration")
  }

  return new RedxService(config)
}