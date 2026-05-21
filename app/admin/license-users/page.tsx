"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, Ban, Mail, Phone, MapPin, Clock, TrendingUp } from "lucide-react"

interface LicenseUser {
  id: string
  email: string
  full_name: string
  phone: string | null
  country: string | null
  created_at: string
  license_count: number
  active_licenses: number
  total_spent: number
  last_payment: string | null
  status: string
}

export default function LicenseUsersPage() {
  const [users, setUsers] = useState<LicenseUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"created" | "licenses" | "spent">("created")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // In a real app: const response = await fetch('/api/admin/users')
      // const data = await response.json()
      // setUsers(data.users)
      setUsers([])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    if (!confirm("Block this user? They will not be able to use their licenses.")) return

    try {
      // await fetch(`/api/admin/users/${userId}/block`, { method: 'POST' })
      fetchUsers()
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "licenses":
        return b.active_licenses - a.active_licenses
      case "spent":
        return b.total_spent - a.total_spent
      case "created":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage license platform users and their access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1629]/80 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Active Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {users.reduce((sum, u) => sum + u.active_licenses, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Revenue (KES)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {users.reduce((sum, u) => sum + u.total_spent, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1629]/80 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Avg per User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {users.length > 0
                ? Math.round(
                    users.reduce((sum, u) => sum + u.total_spent, 0) / users.length
                  ).toLocaleString()
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <Card className="bg-[#0f1629]/80 border-blue-500/20">
        <CardHeader>
          <CardTitle>Search & Sort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "created" ? "default" : "outline"}
                onClick={() => setSortBy("created")}
                size="sm"
              >
                Newest
              </Button>
              <Button
                variant={sortBy === "licenses" ? "default" : "outline"}
                onClick={() => setSortBy("licenses")}
                size="sm"
              >
                Most Licenses
              </Button>
              <Button
                variant={sortBy === "spent" ? "default" : "outline"}
                onClick={() => setSortBy("spent")}
                size="sm"
              >
                Top Spenders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-[#0f1629]/80 border-blue-500/20">
        <CardHeader>
          <CardTitle>All Users ({sortedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedUsers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {sortedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all hover:bg-white/10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Info */}
                    <div>
                      <h3 className="font-medium text-white mb-2">
                        {user.full_name || "Unknown User"}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </div>
                        )}
                        {user.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {user.country}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col justify-between">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-500/10 rounded p-3 text-center border border-blue-500/30">
                          <div className="text-lg font-bold text-blue-400">
                            {user.active_licenses}
                          </div>
                          <div className="text-xs text-gray-400">Active Licenses</div>
                        </div>
                        <div className="bg-emerald-500/10 rounded p-3 text-center border border-emerald-500/30">
                          <div className="text-lg font-bold text-emerald-400">
                            {user.license_count}
                          </div>
                          <div className="text-xs text-gray-400">Total Created</div>
                        </div>
                        <div className="bg-orange-500/10 rounded p-3 text-center border border-orange-500/30">
                          <div className="text-lg font-bold text-orange-400">
                            {user.total_spent}
                          </div>
                          <div className="text-xs text-gray-400">Spent (KES)</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-400 border-blue-500/30"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/30"
                          onClick={() => handleBlockUser(user.id)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
