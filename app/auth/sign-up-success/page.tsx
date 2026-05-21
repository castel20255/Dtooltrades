'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle>Account Created</CardTitle>
          <CardDescription>Welcome to D-Tool Trades License Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please check your email to confirm your account. Click the link in the email to complete your registration.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Return to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
