'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { Users, Star, TrendingUp, Mail, Phone, ShoppingBag, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { CustomerModal } from '@/components/modals/customer-modal'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  totalSpent: number
  visitCount: number
  loyaltyPoints: number
  lastVisit: Date | null
  _count: {
    orders: number
  }
}

interface CustomersPageProps {
  initialCustomers: Customer[]
  stats: {
    totalCustomers: number
    activeCustomers: number
    vipCustomers: number
    averageSpending: number
  }
}

export default function CustomersPageClient({ initialCustomers, stats }: CustomersPageProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setCustomers(initialCustomers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = initialCustomers.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.toLowerCase().includes(query))
      )
      setCustomers(filtered)
    }
  }, [searchQuery, initialCustomers])

  // Handle create/update
  const handleSave = async (customerData: any) => {
    setLoading(true)
    
    try {
      const isEditing = !!customerData.id
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch('/api/customers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save customer')
      }

      alert(isEditing ? 'Customer updated successfully!' : 'Customer added successfully!')
      
      // Reload the page to refresh all data
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error saving customer:', error)
      alert(error.message || 'Failed to save customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (customerId: string, customerName: string, orderCount: number) => {
    if (orderCount > 0) {
      alert(`Cannot delete ${customerName}. This customer has ${orderCount} existing orders. Delete the orders first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${customerName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/customers?id=${customerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete customer')
      }

      alert('Customer deleted successfully!')
      
      // Reload the page
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error deleting customer:', error)
      alert(error.message || 'Failed to delete customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Open modal for editing
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  // Open modal for adding
  const handleAdd = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            Manage your customer relationships and track loyalty.
          </p>
        </div>
        
        {/* ADD CUSTOMER BUTTON */}
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon={<Users className="w-6 h-6" />} iconColor="bg-blue-500" />
        <StatCard title="Active Customers" value={stats.activeCustomers.toString()} icon={<TrendingUp className="w-6 h-6" />} iconColor="bg-green-500" />
        <StatCard title="VIP Customers" value={stats.vipCustomers.toString()} icon={<Star className="w-6 h-6" />} iconColor="bg-yellow-500" />
        <StatCard title="Avg. Spending" value={formatCurrency(stats.averageSpending)} icon={<ShoppingBag className="w-6 h-6" />} iconColor="bg-purple-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
          
          {/* SEARCH BAR */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <div className="px-6 py-2 bg-slate-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{customers.length}</span> customer{customers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => {
                const isVIP = customer.totalSpent > 50
                const isActive = customer.visitCount > 0

                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white font-semibold text-sm">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{customer._count.orders}</span>
                      <span className="text-sm text-gray-500"> orders</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{customer.loyaltyPoints}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.lastVisit ? formatDate(customer.lastVisit, 'relative') : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isVIP ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3" />
                          VIP
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          New
                        </span>
                      )}
                    </td>
                    
                    {/* ACTION BUTTONS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          disabled={loading}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.name, customer._count.orders)}
                          disabled={loading}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {customers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

      </div>

      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Customer Insights</h2>
        <p className="text-slate-300 mb-6">Key metrics about your customer base</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-1">Top Spender</p>
            <p className="text-2xl font-bold">{initialCustomers[0]?.name || 'N/A'}</p>
            <p className="text-slate-300 text-sm mt-1">{formatCurrency(initialCustomers[0]?.totalSpent || 0)} total</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-1">Most Loyal</p>
            <p className="text-2xl font-bold">
              {[...initialCustomers].sort((a, b) => b.visitCount - a.visitCount)[0]?.name || 'N/A'}
            </p>
            <p className="text-slate-300 text-sm mt-1">
              {[...initialCustomers].sort((a, b) => b.visitCount - a.visitCount)[0]?.visitCount || 0} visits
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-slate-300 text-sm mb-1">Most Points</p>
            <p className="text-2xl font-bold">
              {[...initialCustomers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)[0]?.name || 'N/A'}
            </p>
            <p className="text-slate-300 text-sm mt-1">
              {[...initialCustomers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)[0]?.loyaltyPoints || 0} points
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOMER MODAL */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCustomer(null)
        }}
        onSave={handleSave}
        customer={editingCustomer}
      />

    </div>
  )
}

function StatCard({ title, value, icon, iconColor }: { title: string, value: string, icon: React.ReactNode, iconColor: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconColor} text-white mb-4`}>{icon}</div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}