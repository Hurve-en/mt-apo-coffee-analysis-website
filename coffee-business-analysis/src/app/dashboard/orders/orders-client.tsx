'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingCart, Package, Clock, CheckCircle, Plus, Trash2, Calendar, Download, Upload } from 'lucide-react'
import { OrderModal } from '@/components/modals/order-modal'
import { ImportModal } from '@/components/modals/import-modal'
import { convertToCSV, downloadCSV, validateOrderCSV } from '@/lib/csv-utils'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    category: string
  }
}

interface Order {
  id: string
  orderDate: Date
  total: number
  status: string
  paymentMethod: string
  customer: {
    id: string
    name: string
    email: string
  }
  items: OrderItem[]
}

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

interface OrdersPageProps {
  initialOrders: Order[]
  customers: Customer[]
  products: Product[]
  stats: {
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
  }
}

export default function OrdersPageClient({ initialOrders, customers, products, stats }: OrdersPageProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async (orderData: any) => {
    setLoading(true)
    
    const loadingToast = toast.loading('Creating order...')
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      toast.success('✅ Order created successfully!', {
        id: loadingToast,
      })
      
      setTimeout(() => window.location.reload(), 800)
      
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(`❌ ${error.message || 'Failed to create order'}`, {
        id: loadingToast,
      })
      setLoading(false)
    }
  }

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}? This will restore product stock and adjust customer stats.`)) {
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Deleting order...')

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order')
      }

      toast.success('✅ Order deleted successfully!', {
        id: loadingToast,
      })
      
      setTimeout(() => window.location.reload(), 800)
      
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast.error(`❌ ${error.message || 'Failed to delete order'}`, {
        id: loadingToast,
      })
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true)
    const loadingToast = toast.loading('Updating status...')

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order')
      }

      toast.success('✅ Status updated!', {
        id: loadingToast,
      })
      
      setTimeout(() => window.location.reload(), 800)
      
    } catch (error: any) {
      console.error('Error updating order:', error)
      toast.error(`❌ ${error.message || 'Failed to update order'}`, {
        id: loadingToast,
      })
      setLoading(false)
    }
  }

  // EXPORT TO CSV
  const handleExport = () => {
    const exportData = orders.flatMap(order => 
      order.items.map(item => ({
        orderDate: formatDate(order.orderDate, 'short'),
        customerEmail: order.customer.email,
        customerName: order.customer.name,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        paymentMethod: order.paymentMethod,
        status: order.status
      }))
    )

    const headers = ['orderDate', 'customerEmail', 'customerName', 'productName', 'quantity', 'price', 'total', 'paymentMethod', 'status']
    const csv = convertToCSV(exportData, headers)
    downloadCSV(csv, `orders-${new Date().toISOString().split('T')[0]}.csv`)
    
    toast.success('✅ Orders exported successfully!')
  }

  // IMPORT FROM CSV
  const handleImport = async (data: any[]) => {
    const response = await fetch('/api/orders/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: data })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Import failed')
    }

    return response.json()
  }

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-gray-600">Manage customer orders and track fulfillment.</p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={loading || orders.length === 0}
            className="flex items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Create Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} icon={<ShoppingCart className="w-6 h-6" />} iconColor="bg-blue-500" />
        <StatCard title="Pending" value={stats.pendingOrders.toString()} icon={<Clock className="w-6 h-6" />} iconColor="bg-yellow-500" />
        <StatCard title="Completed" value={stats.completedOrders.toString()} icon={<CheckCircle className="w-6 h-6" />} iconColor="bg-green-500" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<Package className="w-6 h-6" />} iconColor="bg-purple-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-sm text-gray-500">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="text-gray-900">
                          {item.quantity}x {item.product.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-gray-500 text-xs">+{order.items.length - 2} more</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(order.orderDate, 'short')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(order.id, order.id.slice(0, 8))}
                      disabled={loading}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first order to get started</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        customers={customers}
        products={products}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Orders"
        templateHeaders={['customerEmail', 'productName', 'quantity', 'orderDate', 'paymentMethod', 'status']}
        validateFn={validateOrderCSV}
        importFn={handleImport}
        exampleRow="keziah@email.com,Espresso,2,2025-12-26,cash,completed"
      />

    </div>
  )
}

function StatCard({ title, value, icon, iconColor }: { title: string, value: string, icon: React.ReactNode, iconColor: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconColor} text-white mb-4`}>{icon}</div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}