import type { IOrder } from "@/lib/models/order"

export interface SteadfastConfig {
  baseUrl: string
  apiKey: string
  secretKey: string
}

export interface SteadfastOrderRequest {
  invoice: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  cod_amount: number
  note?: string
}

export interface SteadfastOrderResponse {
  status: number
  message: string
  consignment: {
    consignment_id: string
    tracking_code: string
    status: string
    invoice: string
    recipient_name: string
    recipient_phone: string
    recipient_address: string
    cod_amount: number
    delivery_fee: number
  }
}

export interface SteadfastStatusResponse {
  status: number
  message: string
  delivery_status: string
  consignment_id: string
  tracking_code: string
  invoice: string
  recipient_name: string
  recipient_phone: string
  cod_amount: number
  current_status: string
  delivery_fee: number
  created_at: string
  updated_at: string
}

export class SteadfastService {
  private config: SteadfastConfig

  constructor(config: SteadfastConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://portal.steadfast.com.bd/api/v1",
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "Api-Key": this.config.apiKey,
      "Secret-Key": this.config.secretKey,
    }
  }

  async checkBalance(): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/check_balance`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to check balance: ${response.statusText}`)
    }

    return response.json()
  }

  async createOrder(order: IOrder): Promise<SteadfastOrderResponse> {
    const payload: SteadfastOrderRequest = {
      invoice: order._id.toString().slice(-8).toUpperCase(),
      recipient_name: order.shippingAddress.fullName,
      recipient_phone: order.shippingAddress.phone || "01700000000",
      recipient_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.district} - ${order.shippingAddress.postalCode}`,
      cod_amount: order.isPaid ? 0 : Math.round(order.totalPrice),
      note: `E-commerce Order #${order._id.toString().slice(-8)} - ${order.orderItems.length} item(s) - ${order.orderItems
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", ")
        .substring(0, 200)}`,
    }

    const response = await fetch(`${this.config.baseUrl}/create_order`, {
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
      
      throw new Error(`Failed to create Steadfast order: ${errorMessage}`)
    }

    const result = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || "Failed to create Steadfast order")
    }

    return result
  }

  async getOrderStatus(trackingCode: string): Promise<SteadfastStatusResponse> {
    const response = await fetch(`${this.config.baseUrl}/status_by_trackingcode/${trackingCode}`, {
      method: "GET",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || "Failed to get order status")
    }

    return result
  }

  async getBulkStatus(trackingCodes: string[]): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/bulk_status_by_trackingcode`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        tracking_code: trackingCodes.join(","),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get bulk status: ${response.statusText}`)
    }

    return response.json()
  }

  async cancelOrder(consignmentId: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/cancel_order_by_consignment`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        consignment_id: consignmentId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`)
    }

    return response.json()
  }

  async getDeliveryCharge(recipientAddress: string, codAmount: number = 0): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/get_delivery_charge`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        recipient_address: recipientAddress,
        cod_amount: codAmount,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get delivery charge: ${response.statusText}`)
    }

    return response.json()
  }
}

export function createSteadfastService(): SteadfastService {
  const config: SteadfastConfig = {
    baseUrl: process.env.STEADFAST_API_URL || "https://portal.steadfast.com.bd/api/v1",
    apiKey: process.env.STEADFAST_API_KEY!,
    secretKey: process.env.STEADFAST_SECRET_KEY!,
  }

  // Validate required environment variables
  if (!config.apiKey || !config.secretKey) {
    throw new Error("Missing required Steadfast API configuration")
  }

  return new SteadfastService(config)
}