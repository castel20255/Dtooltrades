'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Copy, Trash2, Plus, LogOut } from 'lucide-react'
import Link from 'next/link'

interface License {
  id: string
  keyPrefix: string
  status: string
  expiresAt: string
  createdAt: string
  lastUsedAt: string | null
  maxDevices: number
  devicesInUse: number
  isExpired: boolean
  daysUntilExpiry: number
}

export default function DashboardPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      fetchLicenses()
    }

    checkAuth()
  }, [])

  const fetchLicenses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/licenses/list')
      
      if (!response.ok) {
        throw new Error('Failed to fetch licenses')
      }

      const data = await response.json()
      setLicenses(data.licenses || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch licenses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLicense = async () => {
    try {
      setError(null)
      const response = await fetch('/api/licenses/create', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create license')
      }

      const data = await response.json()
      
      if (data.key) {
        // Show the full key to the user
        alert(`Your new license key:\n\n${data.key}\n\nSave it securely - it will not be shown again!`)
      }

      // Refresh the list
      fetchLicenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create license')
    }
  }

  const handleRevokeLicense = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this license?')) {
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      })

      if (!response.ok) {
        throw new Error('Failed to revoke license')
      }

      // Refresh the list
      fetchLicenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke license')
    }
  }

  const handleCopyPrefix = (prefix: string, id: string) => {
    navigator.clipboard.writeText(prefix)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">License Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Create License Button */}
        <div className="mb-8">
          <Button onClick={handleCreateLicense} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Create New License
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && licenses.length === 0 && (
          <Card>
            <CardContent className="pt-12 text-center">
              <p className="text-muted-foreground mb-4">No licenses yet</p>
              <Button onClick={handleCreateLicense}>
                Create Your First License
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Licenses Grid */}
        {!isLoading && licenses.length > 0 && (
          <div className="grid gap-4">
            {licenses.map((license) => (
              <Card key={license.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-mono text-sm">
                        {license.keyPrefix}****
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(license.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyPrefix(license.keyPrefix, license.id)}
                      >
                        <Copy className="h-4 w-4" />
                        {copiedId === license.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeLicense(license.id)}
                        disabled={license.status === 'revoked'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium capitalize">{license.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days Until Expiry</p>
                      <p className={`text-sm font-medium ${
                        license.daysUntilExpiry < 7 ? 'text-red-600' : ''
                      }`}>
                        {license.daysUntilExpiry}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Devices</p>
                      <p className="text-sm font-medium">
                        {license.devicesInUse}/{license.maxDevices}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Used</p>
                      <p className="text-sm font-medium">
                        {license.lastUsedAt
                          ? new Date(license.lastUsedAt).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
