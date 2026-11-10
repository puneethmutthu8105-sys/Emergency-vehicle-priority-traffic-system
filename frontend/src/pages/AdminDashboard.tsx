import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 font-semibold">Access denied — Admin only</p>
        <button onClick={() => navigate('/dashboard')} className="mt-2 text-blue-600 hover:underline text-sm">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const { data: dashboard } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.getDashboard().then(r => r.data) })
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.listUsers().then(r => r.data) })
  const { data: runs } = useQuery({ queryKey: ['admin-runs'], queryFn: () => adminApi.listAgentRuns().then(r => r.data) })

  const agentRunsData = (runs?.runs || []).slice(0, 20).map((r: any) => ({
    name: r.agent_name.replace('_agent', '').substring(0, 8),
    tokens: r.tokens_used,
    latency: r.latency_ms,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Traffic authority control panel</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: dashboard?.users, color: '#1d4ed8' },
          { label: 'Total Accidents', value: dashboard?.accidents, color: '#dc2626' },
          { label: 'Open Emergencies', value: dashboard?.emergencies?.open, color: '#ea580c' },
          { label: 'HITL Pending', value: dashboard?.hitl_pending, color: '#7c5cd8' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Cost and Runs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total AI Cost</p>
          <p className="text-3xl font-bold text-green-600">${dashboard?.total_ai_cost_usd?.toFixed(4) ?? '0.00'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Agent Runs Total</p>
          <p className="text-3xl font-bold text-purple-600">{dashboard?.agent_runs ?? '—'}</p>
        </div>
      </div>

      {/* Recent Alerts */}
      {dashboard?.recent_alerts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Alerts</h2>
          <div className="space-y-2">
            {dashboard.recent_alerts.map((a: any) => (
              <div key={a.id} className="flex items-start justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${
                    a.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    a.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{a.risk_level}</span>
                  {a.message}
                </div>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{new Date(a.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Runs Chart */}
      {agentRunsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Agent Runs — Token Usage</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentRunsData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="tokens" fill="#7c5cd8" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Registered Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users?.users || []).map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">{u.name}</td>
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'officer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-2">
                    <span className={`text-xs ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="py-2 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
