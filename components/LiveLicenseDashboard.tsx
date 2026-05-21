'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Clock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Key,
  AlertTriangle,
} from 'lucide-react'

interface LicenseStatus {
  id: string
  key_prefix: string
  status: string
  expires_at: string
  active_devices: number
  max_devices: number
  last_activity: string
  isExpiringSoon: boolean
}

interface LiveDashboardProps {
  licenses?: LicenseStatus[]
  isConnected: boolean
  onRefresh?: () => void
}

export function LiveLicenseDashboard({
  licenses = [],
  isConnected,
  onRefresh,
}: LiveDashboardProps) {
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [activityFeed, setActivityFeed] = useState<any[]>([])

  const toggleKeyReveal = (id: string) => {
    const newRevealed = new Set(revealedKeys)
    if (newRevealed.has(id)) {
      newRevealed.delete(id)
    } else {
      newRevealed.add(id)
    }
    setRevealedKeys(newRevealed)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'revoked':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry =
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(0, daysUntilExpiry)
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-sm text-green-400">Live • Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Offline • Connecting...</span>
          </>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-auto text-xs px-2 py-1 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Active Licenses */}
      {licenses.length > 0 && (
        <Card className="bg-[#0f1629]/80 border-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Active Licenses ({licenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenses.map((license) => {
              const daysLeft = getDaysUntilExpiry(license.expires_at)
              const expiringSoon = isExpiringSoon(license.expires_at)

              return (
                <div
                  key={license.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-cyan-400">
                          {revealedKeys.has(license.id)
                            ? license.key_prefix + '...'
                            : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleKeyReveal(license.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {revealedKeys.has(license.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">License Key</p>
                    </div>

                    <div
                      className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(
                        license.status
                      )}`}
                    >
                      {license.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-xs text-gray-400 mb-1">Devices</p>
                      <p className="text-sm font-medium text-white">
                        {license.active_devices}/{license.max_devices}
                      </p>
                    </div>

                    <div
                      className={`p-2 rounded ${
                        expiringSoon ? 'bg-red-500/10' : 'bg-white/5'
                      }`}
                    >
                      <p className="text-xs text-gray-400 mb-1">Expires in</p>
                      <p
                        className={`text-sm font-medium ${
                          expiringSoon ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {daysLeft} days
                      </p>
                    </div>
                  </div>

                  {expiringSoon && (
                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      Your license is expiring soon. Consider renewing.
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Last activity:{' '}
                        {new Date(license.last_activity).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* No Licenses State */}
      {licenses.length === 0 && (
        <Card className="bg-[#0f1629]/80 border-blue-500/20">
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-2">No active licenses</p>
            <p className="text-sm text-gray-500">
              Purchase a license to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed */}
      {activityFeed.length > 0 && (
        <Card className="bg-[#0f1629]/80 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activityFeed.map((activity, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400 p-2 rounded bg-white/5"
                >
                  <p className="text-gray-300">{activity.message}</p>
                  <p className="text-gray-600 mt-1">{activity.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
