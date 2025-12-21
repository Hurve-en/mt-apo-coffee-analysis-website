/**
 * CLEAR ALL PRODUCTS API
 * 
 * DELETE /api/products/clear
 * 
 * Deletes ALL order items and orders first, then all products
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    // Step 1: Delete all order items first
    await prisma.orderItem.deleteMany({})
    
    // Step 2: Delete all orders (since they have no items now)
    await prisma.order.deleteMany({})
    
    // Step 3: Delete all products
    const result = await prisma.product.deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted all orders and ${result.count} products`,
      count: result.count 
    })

  } catch (error) {
    console.error('Error clearing products:', error)
    return NextResponse.json(
      { error: 'Failed to clear products' },
      { status: 500 }
    )
  }
}