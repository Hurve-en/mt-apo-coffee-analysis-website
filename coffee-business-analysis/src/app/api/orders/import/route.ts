/**
 * ORDERS IMPORT API - WITH AUTH
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
    const { orders } = body

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'No order data provided' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const orderData of orders) {
      try {
        // Find customer for THIS USER
        const customer = await prisma.customer.findFirst({
          where: { 
            email: orderData.customerEmail,
            userId: session.user.id
          }
        })

        if (!customer) {
          results.failed++
          results.errors.push(`${orderData.customerEmail}: Customer not found`)
          continue
        }

        // Find product for THIS USER
        const product = await prisma.product.findFirst({
          where: { 
            name: orderData.productName,
            userId: session.user.id
          }
        })

        if (!product) {
          results.failed++
          results.errors.push(`${orderData.productName}: Product not found`)
          continue
        }

        const quantity = parseInt(orderData.quantity)
        const total = product.price * quantity

        let orderDate = new Date()
        if (orderData.orderDate) {
          orderDate = new Date(orderData.orderDate)
        }

        // Create order for THIS USER
        await prisma.order.create({
          data: {
            userId: session.user.id,
            customerId: customer.id,
            total: total,
            status: orderData.status || 'completed',
            paymentMethod: orderData.paymentMethod || 'cash',
            orderDate: orderDate,
            items: {
              create: [{
                productId: product.id,
                quantity: quantity,
                price: product.price
              }]
            }
          }
        })

        // Update product stock
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: quantity
            }
          }
        })

        // Update customer stats
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalSpent: {
              increment: total
            },
            visitCount: {
              increment: 1
            },
            loyaltyPoints: {
              increment: Math.floor(total)
            },
            lastVisit: orderDate
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Order error: ${error}`)
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success} orders. ${results.failed} failed.`,
      ...results
    })

  } catch (error) {
    console.error('Error importing orders:', error)
    return NextResponse.json(
      { error: 'Failed to import orders' },
      { status: 500 }
    )
  }
}