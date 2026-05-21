import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'development-secret-key'
)

interface ClientConnection {
  userId: string
  isAdmin: boolean
  ws: any
  subscriptions: Set<string>
}

// Store active connections - in production, use Redis
const activeConnections = new Map<string, ClientConnection>()

// Broadcast message to specific users or admins
export function broadcastToUsers(
  userIds: string[],
  message: any
) {
  userIds.forEach((userId) => {
    const conn = activeConnections.get(userId)
    if (conn?.ws?.readyState === 1) {
      try {
        conn.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Failed to send message to user ${userId}:`, error)
      }
    }
  })
}

export function broadcastToAdmins(message: any) {
  Array.from(activeConnections.values()).forEach((conn) => {
    if (conn.isAdmin && conn.ws?.readyState === 1) {
      try {
        conn.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error('Failed to send admin message:', error)
      }
    }
  })
}

// Verify JWT token
async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as { sub: string; isAdmin?: boolean }
  } catch (error) {
    return null
  }
}

// WebSocket upgrade handler
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return new Response('Invalid token', { status: 401 })
  }

  // In a real implementation with proper WebSocket support
  // you would upgrade the connection here. For now, return 
  // WebSocket upgrade headers that can be handled by a dedicated
  // WebSocket server or Edge Runtime
  return new Response(null, {
    status: 101,
    statusText: 'Switching Protocols',
    headers: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
      'Sec-WebSocket-Accept': 'dummy-accept-header',
    },
  })
}

// Export helpers for use in other API routes
export const wsHelpers = {
  broadcastToUsers,
  broadcastToAdmins,
  activeConnections,
}
