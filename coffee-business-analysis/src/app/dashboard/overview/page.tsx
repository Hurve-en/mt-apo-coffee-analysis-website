import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react'
import { RevenueChart } from '@/components/charts/revenue-chart'

async function getOverviewData(userId: string) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    todayRevenue,
    monthRevenue,
    recentOrders,
    dailyRevenue
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { userId, status: 'completed' },
      _sum: { total: true }
    }),
    prisma.order.count({
      where: { userId }
    }),
    prisma.customer.count({
      where: { userId }
    }),
    prisma.order.aggregate({
      where: { 
        userId, 
        status: 'completed',
        orderDate: { gte: startOfToday }
      },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { 
        userId,
        status: 'completed',
        orderDate: { gte: startOfMonth }
      },
      _sum: { total: true }
    }),
    prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true
      }
    }),
    prisma.$queryRaw`
      SELECT 
        DATE("orderDate") as date,
        SUM(total)::float as revenue
      FROM "Order"
      WHERE "userId" = ${userId}
        AND "status" = 'completed'
        AND "orderDate" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("orderDate")
      ORDER BY date DESC
      LIMIT 30
    `
  ])

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalCustomers,
    todayRevenue: todayRevenue._sum.total || 0,
    monthRevenue: monthRevenue._sum.total || 0,
    recentOrders,
    dailyRevenue: (dailyRevenue as any[]).reverse()
  }
}

export default async function OverviewPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const data = await getOverviewData(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session.user.name}! Here's your business summary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconColor="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={data.totalCustomers.toString()}
          icon={<Users className="w-6 h-6" />}
          iconColor="bg-purple-500"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(data.todayRevenue)}
          icon={<TrendingUp className="w-6 h-6" />}
          iconColor="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h2>
        <RevenueChart data={data.dailyRevenue} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, iconColor }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconColor} text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}