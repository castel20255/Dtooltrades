"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Trash2, Eye, Lock, Unlock, Download, Filter } from "lucide-react"

interface License {
  id: string
  user_id: string
  key_prefix: string
  status: string
  expires_at: string
  created_at: string
  last_used_at: string | null
  max_devices: number
  device_count: number
}

interface User {
  id: string
  email: string
  full_name: string
}

export default function LicensesManagementPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // In a real app, fetch from /api/admin/licenses and /api/admin/users
      setLicenses([])
      setUsers([])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeLicense = async (licenseId: string) => {
    if (!confirm("Are you sure you want to revoke this license?")) return

    try {
      // Call API to revoke
      // await fetch(`/api/admin/licenses/${licenseId}/revoke`, { method: 'POST' })
      fetchData()
    } catch (error) {
      console.error("Error revoking license:", error)
    }
  }

  const handleBlockDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to block this device?")) return

    try {
      // Call API to block device
      // await fetch(`/api/admin/devices/${deviceId}/block`, { method: 'POST' })
      fetchData()
    } catch (error) {
      console.error("Error blocking device:", error)
    }
  }

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.key_prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || license.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">License Management</h1>
        <p className="text-gray-400">Monitor and manage all user licenses and access keys</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1629]/80 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{licenses.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {licenses.filter((l) => l.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {licenses.filter(
                (l) =>
                  new Date(l.expires_at).getTime() - new Date().getTime() <
                  7 * 24 * 60 * 60 * 1000
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {licenses.filter((l) => l.status === "revoked").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-[#0f1629]/80 border-blue-500/20">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by key prefix or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className="border-green-500/30 text-green-400"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "revoked" ? "default" : "outline"}
                onClick={() => setFilterStatus("revoked")}
                className="border-red-500/30 text-red-400"
              >
                Revoked
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card className="bg-[#0f1629]/80 border-blue-500/20">
        <CardHeader>
          <CardTitle>All Licenses ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No licenses found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Key</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Devices</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Expires</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Used</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((license) => (
                    <tr
                      key={license.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-cyan-400">{license.key_prefix}****</td>
                      <td className="py-3 px-4 text-white">{license.user_id.substring(0, 8)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            license.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {license.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {license.device_count}/{license.max_devices}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(license.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {license.last_used_at
                          ? new Date(license.last_used_at).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedLicense(license)}
                            className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {license.status === "active" && (
                            <button
                              onClick={() => handleRevokeLicense(license.id)}
                              className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-400"
                              title="Revoke License"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRevokeLicense(license.id)}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-400"
                            title="Delete License"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Details Modal would go here */}
    </div>
  )
}
