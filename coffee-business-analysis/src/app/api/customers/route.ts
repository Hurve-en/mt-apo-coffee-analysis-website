/**
 * CUSTOMERS API ROUTE
 * 
 * CUSTOMERS API - WITH MULTI-TENANT AUTH
 * 
 * Each user only sees/modifies their own customers
 * 
 * Handles all CRUD operations for customers
 * 
 * Endpoints:
 * - GET: Fetch all customers
 * - POST: Create new customer
 * - PUT: Update existing customer
 * - DELETE: Delete customer
 */


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's customers only
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      where: { userId: session.user.id }, // FILTER BY USER!
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST - Create customer for current user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email exists for THIS USER
    const existing = await prisma.customer.findFirst({
      where: { 
        email: body.email,
        userId: session.user.id // Only check current user's customers
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        userId: session.user.id, // ASSIGN TO USER!
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        totalSpent: 0,
        visitCount: 0,
        loyaltyPoints: 0,
        lastVisit: null
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

// PUT - Update customer (only if owned by user)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.customer.findFirst({
      where: { 
        id: body.id,
        userId: session.user.id // Only update if owned by user
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      )
    }

    // Check email uniqueness for this user
    if (body.email !== existing.email) {
      const emailExists = await prisma.customer.findFirst({
        where: {
          email: body.email,
          userId: session.user.id,
          id: { not: body.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 400 }
        )
      }
    }

    const customer = await prisma.customer.update({
      where: { id: body.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        userId: session.user.id // Only delete if owned by user
      },
      include: {
        _count: { select: { orders: true } }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      )
    }

    if (customer._count.orders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing orders' },
        { status: 400 }
      )
    }

    await prisma.customer.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}