// /lib/logistics/index.ts
import type { IOrder } from "@/lib/models/order"
import { createPathaoService, PathaoService } from "./pathao"
import { createSteadfastService, SteadfastService } from "./steadfast"
import { createRedxService, RedxService } from "./redx"

export type LogisticsProvider = "pathao" | "steadfast" | "redx"

export interface LogisticsResponse {
  success: boolean
  trackingId: string
  provider: LogisticsProvider
  providerResponse: any
  message: string
}

export interface LogisticsStatusResponse {
  success: boolean
  trackingId: string
  status: string
  provider: LogisticsProvider
  details: any
}

export class LogisticsManager {
  private pathaoService: PathaoService | null = null
  private steadfastService: SteadfastService | null = null
  private redxService: RedxService | null = null

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    try {
      // Initialize Pathao if configured
      if (this.isPathaoConfigured()) {
        this.pathaoService = createPathaoService()
      }
    } catch (error) {
      console.warn(
        "Pathao service not initialized:",
        error instanceof Error ? error.message : String(error)
      )
    }

    try {
      // Initialize Steadfast if configured
      if (this.isSteadfastConfigured()) {
        this.steadfastService = createSteadfastService()
      }
    } catch (error) {
      console.warn(
        "Steadfast service not initialized:",
        error instanceof Error ? error.message : String(error)
      )
    }

    try {
      // Initialize Redx if configured
      if (this.isRedxConfigured()) {
        this.redxService = createRedxService()
      }
    } catch (error) {
      console.warn(
        "Redx service not initialized:",
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  private isPathaoConfigured(): boolean {
    return !!(
      process.env.PATHAO_CLIENT_ID &&
      process.env.PATHAO_CLIENT_SECRET &&
      process.env.PATHAO_USERNAME &&
      process.env.PATHAO_PASSWORD
    )
  }

  private isSteadfastConfigured(): boolean {
    return !!(process.env.STEADFAST_API_KEY && process.env.STEADFAST_SECRET_KEY)
  }

  private isRedxConfigured(): boolean {
    return !!process.env.REDX_API_KEY
  }

  async sendOrderToProvider(order: IOrder, provider: LogisticsProvider): Promise<LogisticsResponse> {
    try {
      switch (provider) {
        case "pathao":
          if (!this.pathaoService) {
            throw new Error("Pathao service is not configured")
          }
          return await this.sendToPathao(order)

        case "steadfast":
          if (!this.steadfastService) {
            throw new Error("Steadfast service is not configured")
          }
          return await this.sendToSteadfast(order)

        case "redx":
          if (!this.redxService) {
            throw new Error("Redx service is not configured")
          }
          return await this.sendToRedx(order)

        default:
          throw new Error(`Unsupported logistics provider: ${provider}`)
      }
    } catch (error) {
      console.error(`Error sending order to ${provider}:`, error)
      return {
        success: false,
        trackingId: "",
        provider,
        providerResponse: null,
        message: (error instanceof Error ? error.message : `Failed to send order to ${provider}`),
      }
    }
  }

  private async sendToPathao(order: IOrder): Promise<LogisticsResponse> {
    const storeId = parseInt(process.env.PATHAO_STORE_ID || "1")
    const response = await this.pathaoService!.createOrder(order, storeId)

    return {
      success: true,
      trackingId: response.data.consignment_id,
      provider: "pathao",
      providerResponse: response,
      message: response.message || "Order successfully sent to Pathao",
    }
  }

  private async sendToSteadfast(order: IOrder): Promise<LogisticsResponse> {
    const response = await this.steadfastService!.createOrder(order)

    return {
      success: true,
      trackingId: response.consignment.tracking_code,
      provider: "steadfast",
      providerResponse: response,
      message: response.message || "Order successfully sent to Steadfast",
    }
  }

  private async sendToRedx(order: IOrder): Promise<LogisticsResponse> {
    const response = await this.redxService!.createOrder(order)

    return {
      success: true,
      trackingId: response.tracking_id,
      provider: "redx",
      providerResponse: response,
      message: response.message || "Order successfully sent to Redx",
    }
  }

  async getOrderStatus(trackingId: string, provider: LogisticsProvider): Promise<LogisticsStatusResponse> {
    try {
      switch (provider) {
        case "pathao":
          if (!this.pathaoService) {
            throw new Error("Pathao service is not configured")
          }
          const pathaoStatus = await this.pathaoService.getOrderStatus(trackingId)
          return {
            success: true,
            trackingId,
            status: pathaoStatus.data?.order_status || "unknown",
            provider: "pathao",
            details: pathaoStatus,
          }

        case "steadfast":
          if (!this.steadfastService) {
            throw new Error("Steadfast service is not configured")
          }
          const steadfastStatus = await this.steadfastService.getOrderStatus(trackingId)
          return {
            success: true,
            trackingId,
            status: steadfastStatus.current_status || "unknown",
            provider: "steadfast",
            details: steadfastStatus,
          }

        case "redx":
          if (!this.redxService) {
            throw new Error("Redx service is not configured")
          }
          const redxStatus = await this.redxService.getOrderStatus(trackingId)
          return {
            success: true,
            trackingId,
            status: redxStatus.tracking_info?.current_status || "unknown",
            provider: "redx",
            details: redxStatus,
          }

        default:
          throw new Error(`Unsupported logistics provider: ${provider}`)
      }
    } catch (error) {
      return {
        success: false,
        trackingId,
        status: "unknown",
        provider,
        details: error instanceof Error ? error.message : error,
      }
    }
  }
}