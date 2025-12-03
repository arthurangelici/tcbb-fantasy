import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Type for the session with user data
type SessionWithUser = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
  }
  expires: string
}

// Generate a random 8-character alphanumeric password
function generateRandomPassword(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }
  return password
}

// Reset user password
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a new random password
    const newPassword = generateRandomPassword()

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: newPassword
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
