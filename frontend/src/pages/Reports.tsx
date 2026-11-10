import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#16a34a', '#d97706', '#ea580c', '#dc2626']

export default function Reports() {
  const { data: summary } = useQuery({ queryKey: ['reports-summary'], queryFn: () => reportsApi.getSummary().then(r => r.data) })
  const { data: severityDist } = useQuery({ queryKey: ['severity-distribution'], queryFn: () => reportsApi.getSeverityDistribution().then(r => r.data) })
  const { data: agentPerf } = useQuery({ queryKey: ['agent-performance'], queryFn: () => reportsApi.getAgentPerformance().then(r => r.data) })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 text-sm">Accident history, AI agent performance, and system analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Accidents</p>
          <p className="text-3xl font-bold text-blue-600">{summary?.accidents?.total ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Fatal Cases</p>
          <p className="text-3xl font-bold text-red-600">{summary?.accidents?.fatal ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">AI Tokens Used</p>
          <p className="text-3xl font-bold text-purple-600">{(summary?.ai_agents?.total_tokens ?? 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total AI Cost</p>
          <p className="text-3xl font-bold text-green-600">${summary?.ai_agents?.total_cost_usd?.toFixed(4) ?? '0.00'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Accident Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityDist?.distribution || []}
                dataKey="count"
                nameKey="severity"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ severity, count }) => `${severity}: ${count}`}
              >
                {(severityDist?.distribution || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Agent Performance (Runs)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={agentPerf?.agents || []}
              layout="vertical"
              margin={{ left: 30, right: 20 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
              <Tooltip formatter={(v, n) => n === 'runs' ? [`${v} runs`] : [v]} />
              <Bar dataKey="runs" fill="#3b82f6" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Cost Table */}
      {agentPerf?.agents && agentPerf.agents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Agent Cost & Latency</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Agent</th>
                  <th className="pb-2">Runs</th>
                  <th className="pb-2">Avg Latency</th>
                  <th className="pb-2">Total Tokens</th>
                  <th className="pb-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {agentPerf.agents.map((a: any) => (
                  <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs">{a.name}</td>
                    <td className="py-2">{a.runs}</td>
                    <td className="py-2">{a.avg_latency_ms?.toFixed(0)} ms</td>
                    <td className="py-2">{a.total_tokens?.toLocaleString()}</td>
                    <td className="py-2">${a.total_cost_usd?.toFixed(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
