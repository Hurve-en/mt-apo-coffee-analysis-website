/**
 * CUSTOMERS IMPORT API - WITH AUTH
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customers } = body

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'No customer data provided' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const customer of customers) {
      try {
        // Check if email exists for THIS USER
        const existing = await prisma.customer.findFirst({
          where: { 
            email: customer.email,
            userId: session.user.id
          }
        })

        if (existing) {
          results.failed++
          results.errors.push(`${customer.email}: Email already exists`)
          continue
        }

        // Create customer for THIS USER
        await prisma.customer.create({
          data: {
            userId: session.user.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            totalSpent: 0,
            visitCount: 0,
            loyaltyPoints: 0,
            lastVisit: null
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${customer.name}: ${error}`)
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success} customers. ${results.failed} failed.`,
      ...results
    })

  } catch (error) {
    console.error('Error importing customers:', error)
    return NextResponse.json(
      { error: 'Failed to import customers' },
      { status: 500 }
    )
  }
}