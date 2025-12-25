'use client'

/**
 * MONITORING DASHBOARD - FULLY FIXED
 * 
 * Replace: src/components/monitoring-dashboard.tsx
 */

import { useState, useEffect } from 'react'
import { performanceMonitor } from '@/lib/performance-monitor'
import { errorLogger } from '@/lib/error-logger'
import { analytics } from '@/lib/analytics'
import { Activity, AlertCircle, BarChart3, X } from 'lucide-react'

export function MonitoringDashboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'performance' | 'errors' | 'analytics'>('performance')
  const [stats, setStats] = useState<any>(null)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  useEffect(() => {
    if (isOpen) {
      refreshStats()
    }
  }, [isOpen, activeTab])

  const refreshStats = () => {
    try {
      if (activeTab === 'performance') {
        setStats(performanceMonitor.getStats())
      } else if (activeTab === 'errors') {
        setStats(errorLogger.getStats())
      } else if (activeTab === 'analytics') {
        setStats(analytics.getStats())
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-4 z-40 p-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg shadow-lg hover:from-slate-800 hover:to-slate-950 transition-all hover:scale-105"
        title="Monitoring Dashboard (Dev Only)"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-slate-700 to-slate-900 text-white">
              <div>
                <h2 className="text-2xl font-bold">📊 Monitoring Dashboard</h2>
                <p className="text-sm text-slate-200 mt-1">Development Mode Only</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'performance'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Performance
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Errors
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                Analytics
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'performance' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                  {!stats || Object.keys(stats).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⚡</div>
                      <div>No performance data yet.</div>
                      <div className="text-sm mt-1">Navigate around the app to collect metrics.</div>
                    </div>
                  ) : (
                    Object.entries(stats).map(([name, data]: [string, any]) => {
                      // Ensure data has valid properties
                      const avg = typeof data?.avg === 'number' ? data.avg : 0
                      const min = typeof data?.min === 'number' ? data.min : 0
                      const max = typeof data?.max === 'number' ? data.max : 0
                      const count = typeof data?.count === 'number' ? data.count : 0

                      return (
                        <div key={name} className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{name}</span>
                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">{count} samples</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Average</div>
                              <div className="font-bold text-blue-600">{avg.toFixed(0)}ms</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Min</div>
                              <div className="font-bold text-green-600">{min.toFixed(0)}ms</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Max</div>
                              <div className="font-bold text-red-600">{max.toFixed(0)}ms</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'errors' && (
                <div className="space-y-4">
                  {stats && stats.bySeverity ? (
                    <>
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-yellow-700 text-sm font-medium">Low</div>
                          <div className="text-2xl font-bold text-yellow-900">{stats.bySeverity.low || 0}</div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-orange-700 text-sm font-medium">Medium</div>
                          <div className="text-2xl font-bold text-orange-900">{stats.bySeverity.medium || 0}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-red-700 text-sm font-medium">High</div>
                          <div className="text-2xl font-bold text-red-900">{stats.bySeverity.high || 0}</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-slate-700 text-sm font-medium">Critical</div>
                          <div className="text-2xl font-bold text-slate-900">{stats.bySeverity.critical || 0}</div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Errors</h3>
                      {!stats.recent || stats.recent.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">🎉</div>
                          <div className="font-semibold">No errors logged yet!</div>
                          <div className="text-sm mt-1">Your app is running smoothly.</div>
                        </div>
                      ) : (
                        stats.recent.map((error: any, i: number) => (
                          <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-red-900">{error.message || 'Unknown error'}</span>
                              <span className="text-xs px-2 py-1 bg-red-200 text-red-900 rounded font-medium">{error.severity || 'unknown'}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {error.timestamp ? new Date(error.timestamp).toLocaleTimeString() : 'Unknown time'}
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <div>No error data available.</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  {stats ? (
                    <>
                      <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200 mb-6">
                        <div className="text-slate-700 text-sm font-medium">Total Events Tracked</div>
                        <div className="text-4xl font-bold text-slate-900 mt-2">{stats.total || 0}</div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-4">Event Breakdown</h3>
                      {!stats.byName || Object.keys(stats.byName).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📈</div>
                          <div>No analytics events yet.</div>
                          <div className="text-sm mt-1">Use the app to generate events.</div>
                        </div>
                      ) : (
                        Object.entries(stats.byName).map(([name, count]: [string, any]) => (
                          <div key={name} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                            <span className="font-medium text-gray-900">{name}</span>
                            <span className="px-3 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-full text-sm font-bold shadow-sm">
                              {count}
                            </span>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <div>No analytics data available.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Development Mode
              </span>
              <button
                onClick={refreshStats}
                className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-slate-950 transition-all shadow-md hover:shadow-lg"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}