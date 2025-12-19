/**
 * CUSTOMERS API ROUTE
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
import { prisma } from '@/lib/prisma'

// GET - Fetch all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { totalSpent: 'desc' },
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

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: body.email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
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

// PUT - Update existing customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Check if email is being changed and already exists
    if (body.email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          email: body.email,
          NOT: { id: body.id }
        }
      })

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Update customer
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

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Check if customer has orders
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } }
    })

    if (customer && customer._count.orders > 0) {
      return NextResponse.json(
        { error: `Cannot delete customer with ${customer._count.orders} existing orders. Delete orders first.` },
        { status: 400 }
      )
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}