/**
 * ORDER FORM MODAL
 * 
 * Modal component for creating orders
 * 
 * FEATURES:
 * - Select customer
 * - Add multiple products
 * - Choose quantities
 * - Auto-calculate totals
 * - Payment method selection
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

interface OrderItem {
  productId: string
  quantity: number
  price: number
  productName?: string
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (orderData: any) => void
  customers: Customer[]
  products: Product[]
}

export function OrderModal({ isOpen, onClose, onSave, customers, products }: OrderModalProps) {
  const [customerId, setCustomerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [items, setItems] = useState<OrderItem[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCustomerId('')
      setPaymentMethod('cash')
      setItems([])
      setErrors({})
    }
  }, [isOpen])

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].productId = value
        newItems[index].price = product.price
        newItems[index].productName = product.name
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 1
    }
    
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!customerId) {
      newErrors.customer = 'Please select a customer'
    }

    if (items.length === 0) {
      newErrors.items = 'Please add at least one product'
    }

    items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item-${index}`] = 'Please select a product'
      }
      if (item.quantity < 1) {
        newErrors[`quantity-${index}`] = 'Quantity must be at least 1'
      }
      
      const product = products.find(p => p.id === item.productId)
      if (product && item.quantity > product.stock) {
        newErrors[`stock-${index}`] = `Only ${product.stock} available`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      const orderData = {
        customerId,
        paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }
      onSave(orderData)
    }
  }

  if (!isOpen) return null

  const total = calculateTotal()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 animate-fadeIn">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                  errors.customer ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
              </select>
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Order Items *
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {items.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No products added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Add Product" to start</p>
                </div>
              )}

              <div className="space-y-3">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId)
                  
                  return (
                    <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-xl">
                      
                      {/* Product Select */}
                      <div className="flex-1">
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                            errors[`item-${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.stock === 0}>
                              {p.name} - {formatCurrency(p.price)} ({p.stock} in stock)
                            </option>
                          ))}
                        </select>
                        {errors[`item-${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`item-${index}`]}</p>
                        )}
                        {errors[`stock-${index}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`stock-${index}`]}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                            errors[`quantity-${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Qty"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="w-28 px-3 py-2 bg-white border border-gray-200 rounded-lg text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Order Total:</span>
                  <span className="text-2xl font-bold text-slate-700">{formatCurrency(total)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {items.length} item{items.length !== 1 ? 's' : ''} • {paymentMethod}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-950 transition-all"
              >
                Create Order
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  )
}