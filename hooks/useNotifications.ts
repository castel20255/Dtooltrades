'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  WebSocketManager,
  WebSocketEventType,
  NotificationPayload,
} from '@/lib/websocket'

export function useNotifications(userId: string, authToken?: string) {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const unsubscribeRef = useRef<(() => void)[]>([])

  // Initialize WebSocket connection
  useEffect(() => {
    if (!authToken || !userId) return

    const wsManager = new WebSocketManager(userId)
    wsManagerRef.current = wsManager

    wsManager.connect(authToken).catch((error) => {
      console.error('WebSocket connection failed:', error)
    })

    // Listen for connection state changes
    const unsubscribeConnection = wsManager.onConnectionStateChange((connected) => {
      setIsConnected(connected)
    })

    // Subscribe to notification events
    const subscriptions = [
      wsManager.subscribe(
        WebSocketEventType.LICENSE_ACTIVATED,
        (data) => {
          addNotification({
            type: 'license_activated',
            title: 'License Activated',
            message: `Your license for ${data.licenseType} has been activated`,
            data,
          })
        }
      ),
      wsManager.subscribe(
        WebSocketEventType.LICENSE_REVOKED,
        (data) => {
          addNotification({
            type: 'license_revoked',
            title: 'License Revoked',
            message: 'Your license has been revoked. Please contact support.',
            data,
          })
        }
      ),
      wsManager.subscribe(
        WebSocketEventType.LICENSE_EXPIRING,
        (data) => {
          addNotification({
            type: 'license_expiring',
            title: 'License Expiring Soon',
            message: `Your license will expire in ${data.daysRemaining} days`,
            data,
          })
        }
      ),
      wsManager.subscribe(
        WebSocketEventType.PAYMENT_RECEIVED,
        (data) => {
          addNotification({
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of ${data.amount} ${data.currency} has been processed`,
            data,
          })
        }
      ),
      wsManager.subscribe(
        WebSocketEventType.PAYMENT_FAILED,
        (data) => {
          addNotification({
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Payment failed: ${data.reason}. Please try again.`,
            data,
          })
        }
      ),
      wsManager.subscribe(
        WebSocketEventType.SECURITY_ALERT,
        (data) => {
          addNotification({
            type: 'security_alert',
            title: 'Security Alert',
            message: data.message,
            data,
          })
        }
      ),
    ]

    unsubscribeRef.current = [unsubscribeConnection, ...subscriptions]

    return () => {
      unsubscribeRef.current.forEach((unsub) => unsub())
      wsManager.disconnect()
      wsManagerRef.current = null
    }
  }, [userId, authToken])

  const addNotification = useCallback(
    (notification: NotificationPayload) => {
      const id = notification.id || `notif-${Date.now()}`
      const newNotification: NotificationPayload = {
        ...notification,
        id,
        read: false,
        created_at: new Date().toISOString(),
      }

      setNotifications((prev) => [newNotification, ...prev])

      // Auto-remove after 10 seconds
      const timer = setTimeout(() => {
        removeNotification(id)
      }, 10000)

      return () => clearTimeout(timer)
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    isConnected,
    addNotification,
    removeNotification,
    markAsRead,
    clearAllNotifications,
  }
}
