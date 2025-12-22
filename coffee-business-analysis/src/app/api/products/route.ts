/**
 * PRODUCTS API - WITH MULTI-TENANT AUTH
 * 
 * Handles all CRUD operations for products
 * 
 * Endpoints:
 * - GET: Fetch all products
 * - POST: Create new product
 * - PUT: Update existing product
 * - DELETE: Delete product
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

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name || !body.category || body.price === undefined || body.cost === undefined) {
      return NextResponse.json(
        { error: 'Name, category, price, and cost are required' },
        { status: 400 }
      )
    }

    if (body.price <= 0 || body.cost < 0) {
      return NextResponse.json(
        { error: 'Invalid price or cost' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description || null,
        category: body.category,
        price: parseFloat(body.price),
        cost: parseFloat(body.cost),
        stock: parseInt(body.stock) || 0,
        imageUrl: null,
        isActive: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const existing = await prisma.product.findFirst({
      where: { 
        id: body.id,
        userId: session.user.id
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category,
        price: parseFloat(body.price),
        cost: parseFloat(body.cost),
        stock: parseInt(body.stock)
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await prisma.product.findFirst({
      where: { 
        id,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}