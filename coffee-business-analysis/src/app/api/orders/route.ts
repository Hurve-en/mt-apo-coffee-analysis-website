/**
 * ORDERS API - WITH MULTI-TENANT AUTH
 * 
 * Handles all CRUD operations for orders
 * Can be used by external apps in the future!
 * 
 * Endpoints:
 * - GET: Fetch all orders (with filters)
 * - POST: Create new order
 * - PUT: Update order status
 * - DELETE: Delete order
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    
    const where: any = { userId: session.user.id }
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      orderBy: { orderDate: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.customerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and items are required' },
        { status: 400 }
      )
    }

    // Verify customer belongs to user
    const customer = await prisma.customer.findFirst({
      where: { 
        id: body.customerId,
        userId: session.user.id
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let total = 0
    const itemsData = []

    for (const item of body.items) {
      // Verify product belongs to user
      const product = await prisma.product.findFirst({
        where: { 
          id: item.productId,
          userId: session.user.id
        }
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      })
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        customerId: body.customerId,
        total,
        status: body.status || 'pending',
        paymentMethod: body.paymentMethod || 'cash',
        orderDate: new Date(),
        items: {
          create: itemsData
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of body.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // Update customer stats
    await prisma.customer.update({
      where: { id: body.customerId },
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
        lastVisit: new Date()
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const existing = await prisma.order.findFirst({
      where: { 
        id: body.id,
        userId: session.user.id
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id: body.id },
      data: {
        status: body.status
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId: session.user.id
      },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }

    // Update customer stats
    await prisma.customer.update({
      where: { id: order.customerId },
      data: {
        totalSpent: {
          decrement: order.total
        },
        visitCount: {
          decrement: 1
        },
        loyaltyPoints: {
          decrement: Math.floor(order.total)
        }
      }
    })

    await prisma.order.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}