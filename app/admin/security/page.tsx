"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  Lock,
  Smartphone,
  Globe,
  Trash2,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
} from "lucide-react"

interface BruteForceSuspect {
  ip: string
  attempts: number
  lastAttempt: string
  attemptType: string
}

interface BlockedDevice {
  id: string
  deviceName: string
  fingerprint: string
  blockedAt: string
  reason: string
}

interface BlockedIP {
  ip: string
  blockedAt: string
  reason: string
  attempts: number
}

export default function SecurityPage() {
  const [bruteForceAttempts, setBruteForceAttempts] = useState<BruteForceSuspect[]>([])
  const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([])
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true)
      // In production: fetch from /api/admin/security
      setBruteForceAttempts([])
      setBlockedDevices([])
      setBlockedIPs([])
    } catch (error) {
      console.error("Error fetching security data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Unblock IP address ${ip}?`)) return

    try {
      // await fetch(`/api/admin/security/unblock-ip`, { 
      //   method: 'POST',
      //   body: JSON.stringify({ ip })
      // })
      fetchSecurityData()
    } catch (error) {
      console.error("Error unblocking IP:", error)
    }
  }

  const handleUnblockDevice = async (deviceId: string) => {
    if (!confirm("Unblock this device?")) return

    try {
      // await fetch(`/api/admin/security/unblock-device`, { 
      //   method: 'POST',
      //   body: JSON.stringify({ deviceId })
      // })
      fetchSecurityData()
    } catch (error) {
      console.error("Error unblocking device:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Management</h1>
        <p className="text-gray-400">Monitor threats, manage blocked devices and IPs, and maintain platform security</p>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f1629]/80 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              Overall Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">Secure</div>
            <p className="text-xs text-gray-500 mt-1">No active threats detected</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Suspicious Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{bruteForceAttempts.length}</div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-400" />
              Blocked Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {blockedDevices.length + blockedIPs.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Devices & IPs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="brute-force" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[#0f1629]/50 border border-blue-500/20">
          <TabsTrigger value="brute-force" className="data-[state=active]:text-cyan-400">
            Brute Force Attempts
          </TabsTrigger>
          <TabsTrigger value="blocked-devices" className="data-[state=active]:text-cyan-400">
            Blocked Devices
          </TabsTrigger>
          <TabsTrigger value="blocked-ips" className="data-[state=active]:text-cyan-400">
            Blocked IPs
          </TabsTrigger>
        </TabsList>

        {/* Brute Force Attempts */}
        <TabsContent value="brute-force">
          <Card className="bg-[#0f1629]/80 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Brute Force Attempts (24h)</CardTitle>
                <Button onClick={fetchSecurityData} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : bruteForceAttempts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No brute force attempts detected</p>
              ) : (
                <div className="space-y-3">
                  {bruteForceAttempts.map((attempt) => (
                    <div key={attempt.ip} className="p-4 bg-white/5 rounded-lg border border-yellow-500/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-yellow-400" />
                            <span className="font-mono text-yellow-400">{attempt.ip}</span>
                            <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                              {attempt.attempts} attempts
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            Type: <span className="text-gray-300">{attempt.attemptType}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Last: {new Date(attempt.lastAttempt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleUnblockIP(attempt.ip)}
                        >
                          Block IP
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Devices */}
        <TabsContent value="blocked-devices">
          <Card className="bg-[#0f1629]/80 border-blue-500/20">
            <CardHeader>
              <CardTitle>Blocked Devices ({blockedDevices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : blockedDevices.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No blocked devices</p>
              ) : (
                <div className="space-y-3">
                  {blockedDevices.map((device) => (
                    <div key={device.id} className="p-4 bg-white/5 rounded-lg border border-red-500/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone className="h-4 w-4 text-red-400" />
                            <span className="font-medium text-white">{device.deviceName}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1 font-mono">
                            Fingerprint: {device.fingerprint.substring(0, 16)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            Reason: {device.reason}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Blocked: {new Date(device.blockedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-400"
                          onClick={() => handleUnblockDevice(device.id)}
                        >
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs */}
        <TabsContent value="blocked-ips">
          <Card className="bg-[#0f1629]/80 border-blue-500/20">
            <CardHeader>
              <CardTitle>Blocked IP Addresses ({blockedIPs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : blockedIPs.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No blocked IP addresses</p>
              ) : (
                <div className="space-y-3">
                  {blockedIPs.map((ipEntry) => (
                    <div key={ipEntry.ip} className="p-4 bg-white/5 rounded-lg border border-red-500/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-red-400" />
                            <span className="font-mono text-red-400">{ipEntry.ip}</span>
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                              {ipEntry.attempts} failed attempts
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">
                            Reason: <span className="text-gray-300">{ipEntry.reason}</span>
                          </p>
                          <p className="text-xs text-gray-600">
                            Blocked: {new Date(ipEntry.blockedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-400"
                          onClick={() => handleUnblockIP(ipEntry.ip)}
                        >
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
