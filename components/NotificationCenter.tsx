'use client'

import React, { useState } from 'react'
import { X, Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { NotificationPayload } from '@/lib/websocket'

interface NotificationCenterProps {
  notifications: NotificationPayload[]
  onRemove: (id: string) => void
  onMarkRead: (id: string) => void
}

export function NotificationCenter({
  notifications,
  onRemove,
  onMarkRead,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'license_activated':
      case 'payment_received':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'license_revoked':
      case 'payment_failed':
      case 'security_alert':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'license_activated':
      case 'payment_received':
        return 'bg-green-500/20'
      case 'license_revoked':
      case 'payment_failed':
      case 'security_alert':
        return 'bg-red-500/20'
      default:
        return 'bg-blue-500/20'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto rounded-lg bg-[#0f1629]/95 border border-blue-500/20 shadow-xl z-50">
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-white/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      onMarkRead(notification.id!)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 p-2 rounded ${getIconBg(
                      notification.type
                    )}`}>
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.created_at &&
                          new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(notification.id!)
                      }}
                      className="flex-shrink-0 text-gray-500 hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Toast notifications component for active notifications
export function NotificationToasts({
  notifications,
  onRemove,
}: Omit<NotificationCenterProps, 'onMarkRead'>) {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 pointer-events-none">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="bg-[#0f1629]/95 border border-blue-500/20 rounded-lg p-4 shadow-xl pointer-events-auto max-w-md"
        >
          <div className="flex gap-3">
            <div className={`flex-shrink-0 p-2 rounded ${getIconBg(
              notification.type
            )}`}>
              {getIcon(notification.type)}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {notification.title}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => onRemove(notification.id!)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function getIcon(type: string) {
  switch (type) {
    case 'license_activated':
    case 'payment_received':
      return <CheckCircle className="h-5 w-5 text-green-400" />
    case 'license_revoked':
    case 'payment_failed':
    case 'security_alert':
      return <AlertTriangle className="h-5 w-5 text-red-400" />
    default:
      return <Info className="h-5 w-5 text-blue-400" />
  }
}

function getIconBg(type: string) {
  switch (type) {
    case 'license_activated':
    case 'payment_received':
      return 'bg-green-500/20'
    case 'license_revoked':
    case 'payment_failed':
    case 'security_alert':
      return 'bg-red-500/20'
    default:
      return 'bg-blue-500/20'
  }
}
