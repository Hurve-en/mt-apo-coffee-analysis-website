/**
 * CUSTOMERS BULK IMPORT API - FIXED
 * 
 * POST /api/customers/import
 * 
 * Accepts CSV data and bulk creates customers WITH historical data
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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
        // Check if email already exists
        const existing = await prisma.customer.findUnique({
          where: { email: customer.email }
        })

        if (existing) {
          results.failed++
          results.errors.push(`${customer.email}: Email already exists`)
          continue
        }

        // Parse historical data from CSV (if provided)
        const totalSpent = customer.totalSpent ? parseFloat(customer.totalSpent) : 0
        const loyaltyPoints = customer.loyaltyPoints ? parseInt(customer.loyaltyPoints) : Math.floor(totalSpent)
        const visitCount = customer.visitCount ? parseInt(customer.visitCount) : 0
        
        // Parse lastVisit date (if provided)
        let lastVisit = null
        if (customer.lastVisit && customer.lastVisit.toLowerCase() !== 'never') {
          lastVisit = new Date(customer.lastVisit)
        }

        // Create customer with historical data
        await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            totalSpent: totalSpent,
            visitCount: visitCount,
            loyaltyPoints: loyaltyPoints,
            lastVisit: lastVisit
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