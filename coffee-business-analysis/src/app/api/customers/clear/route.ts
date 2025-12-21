/**
 * CLEAR ALL CUSTOMERS API
 * 
 * DELETE /api/customers/clear
 * 
 * Deletes ALL orders first, then all customers
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    // Step 1: Delete all order items first (related to orders)
    await prisma.orderItem.deleteMany({})
    
    // Step 2: Delete all orders
    await prisma.order.deleteMany({})
    
    // Step 3: Delete all customers
    const result = await prisma.customer.deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted all orders and ${result.count} customers`,
      count: result.count 
    })

  } catch (error) {
    console.error('Error clearing customers:', error)
    return NextResponse.json(
      { error: 'Failed to clear customers' },
      { status: 500 }
    )
  }
}