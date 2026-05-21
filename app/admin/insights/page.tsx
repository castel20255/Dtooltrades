"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Key, CreditCard, Activity, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  activeLicenses: number
  revenue30Days: number
  currency: string
  activeSessions24h: number
  avgLicensesPerUser: number
}

interface ChartData {
  label: string
  value: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeLicenses: 0,
    revenue30Days: 0,
    currency: "KES",
    activeSessions24h: 0,
    avgLicensesPerUser: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      // In production: const response = await fetch('/api/admin/analytics')
      // const data = await response.json()
      // setAnalytics(data.analytics)
      
      setAnalytics({
        totalUsers: 0,
        activeLicenses: 0,
        revenue30Days: 0,
        currency: "KES",
        activeSessions24h: 0,
        avgLicensesPerUser: 0,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    unit = "",
    trend,
    color = "blue",
  }: {
    title: string
    value: string | number
    icon: React.ReactNode
    unit?: string
    trend?: { value: number; positive: boolean }
    color?: "blue" | "green" | "orange" | "purple" | "red"
  }) => {
    const colorClasses = {
      blue: "border-blue-500/20 bg-blue-500/5",
      green: "border-emerald-500/20 bg-emerald-500/5",
      orange: "border-orange-500/20 bg-orange-500/5",
      purple: "border-purple-500/20 bg-purple-500/5",
      red: "border-red-500/20 bg-red-500/5",
    }

    const iconColorClasses = {
      blue: "text-blue-400",
      green: "text-emerald-400",
      orange: "text-orange-400",
      purple: "text-purple-400",
      red: "text-red-400",
    }

    return (
      <Card className={`${colorClasses[color]} border`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-white">{value}</div>
                {unit && <span className="text-gray-500 text-sm">{unit}</span>}
              </div>
              {trend && (
                <p
                  className={`text-xs mt-2 ${
                    trend.positive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last period
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-white/5 ${iconColorClasses[color]}`}>
              {Icon}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Analytics</h1>
        <p className="text-gray-400">Real-time insights into platform performance</p>
      </div>

      {/* Main Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={analytics.totalUsers}
              icon={<Users className="h-6 w-6" />}
              color="blue"
              trend={{ value: 12, positive: true }}
            />

            <StatCard
              title="Active Licenses"
              value={analytics.activeLicenses}
              icon={<Key className="h-6 w-6" />}
              color="emerald"
            />

            <StatCard
              title="30-Day Revenue"
              value={analytics.revenue30Days.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
              unit={analytics.currency}
              icon={<CreditCard className="h-6 w-6" />}
              color="orange"
              trend={{ value: 23, positive: true }}
            />

            <StatCard
              title="Active Sessions (24h)"
              value={analytics.activeSessions24h}
              icon={<Activity className="h-6 w-6" />}
              color="purple"
            />

            <StatCard
              title="Avg Licenses/User"
              value={analytics.avgLicensesPerUser.toFixed(2)}
              icon={<TrendingUp className="h-6 w-6" />}
              color="green"
            />

            <StatCard
              title="System Health"
              value="99.9%"
              unit="uptime"
              icon={<AlertTriangle className="h-6 w-6" />}
              color="blue"
            />
          </div>

          {/* Charts and Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="bg-[#0f1629]/80 border-blue-500/20">
              <CardHeader>
                <CardTitle>Revenue Trend (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Chart placeholder - integrate with your charting library</p>
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card className="bg-[#0f1629]/80 border-blue-500/20">
              <CardHeader>
                <CardTitle>User Growth (30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Chart placeholder - integrate with your charting library</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card className="bg-[#0f1629]/80 border-blue-500/20">
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { country: "Kenya", users: 245, percentage: 45 },
                    { country: "Uganda", users: 180, percentage: 33 },
                    { country: "Tanzania", users: 90, percentage: 17 },
                    { country: "Other", users: 25, percentage: 5 },
                  ].map((item) => (
                    <div key={item.country}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">{item.country}</span>
                        <span className="text-sm font-medium text-white">{item.users}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-[#0f1629]/80 border-blue-500/20">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { method: "MPESA", count: 380, percentage: 70 },
                    { method: "Card", count: 120, percentage: 22 },
                    { method: "Bank Transfer", count: 40, percentage: 8 },
                  ].map((item) => (
                    <div key={item.method}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">{item.method}</span>
                        <span className="text-sm font-medium text-white">{item.count}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card className="bg-[#0f1629]/80 border-blue-500/20">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">API Response Time</p>
                  <p className="text-2xl font-bold text-green-400">45ms</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Database Load</p>
                  <p className="text-2xl font-bold text-green-400">32%</p>
                  <p className="text-xs text-gray-500 mt-1">Normal</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-blue-400">78%</p>
                  <p className="text-xs text-gray-500 mt-1">Good</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">Error Rate</p>
                  <p className="text-2xl font-bold text-green-400">0.1%</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
