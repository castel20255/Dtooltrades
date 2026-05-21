// WebSocket events for real-time updates
export enum WebSocketEventType {
  LICENSE_ACTIVATED = 'license:activated',
  LICENSE_REVOKED = 'license:revoked',
  LICENSE_EXPIRING = 'license:expiring',
  PAYMENT_RECEIVED = 'payment:received',
  PAYMENT_FAILED = 'payment:failed',
  ADMIN_NOTIFICATION = 'admin:notification',
  USER_DEACTIVATED = 'user:deactivated',
  DEVICE_BLOCKED = 'device:blocked',
  IP_BLOCKED = 'ip:blocked',
  SECURITY_ALERT = 'security:alert',
}

export interface WebSocketMessage {
  type: WebSocketEventType
  data: Record<string, any>
  timestamp: string
  userId?: string
  adminOnly?: boolean
}

export interface NotificationPayload {
  id?: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  read?: boolean
  created_at?: string
}

// Client-side WebSocket manager for real-time updates
export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers = new Map<WebSocketEventType, Set<(data: any) => void>>()
  private connectionStateHandlers = new Set<(connected: boolean) => void>()

  constructor(private userId: string) {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const url = `${protocol}//${window.location.host}/api/websocket?token=${encodeURIComponent(token)}`

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected')
          this.reconnectAttempts = 0
          this.notifyConnectionState(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected')
          this.notifyConnectionState(false)
          this.attemptReconnect(token)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(
      `[WebSocket] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
    )

    setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('[WebSocket] Reconnection failed:', error)
      })
    }, delay)
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data)
        } catch (error) {
          console.error('[WebSocket] Handler error:', error)
        }
      })
    }
  }

  subscribe(eventType: WebSocketEventType, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }

    this.messageHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  onConnectionStateChange(handler: (connected: boolean) => void): () => void {
    this.connectionStateHandlers.add(handler)
    return () => {
      this.connectionStateHandlers.delete(handler)
    }
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionStateHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (error) {
        console.error('[WebSocket] Connection state handler error:', error)
      }
    })
  }

  send(type: WebSocketEventType, data: Record<string, any>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Not connected, cannot send message')
      return
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
    }

    this.ws.send(JSON.stringify(message))
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.connectionStateHandlers.clear()
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}
