import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trafficApi, accidentApi, emergencyApi, reportsApi } from '../api/client'
import TrafficMap from '../components/TrafficMap'
import RiskGauge from '../components/RiskGauge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

const SEVERITY_COLORS = ['#16a34a', '#d97706', '#ea580c', '#dc2626']
const CONGESTION_COLORS = { LOW: '#16a34a', MEDIUM: '#d97706', HIGH: '#ea580c', SEVERE: '#dc2626' }

function StatCard({ label, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold mt-1" style={{ color: color || '#1d4ed8' }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [riskResult, setRiskResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const { data: trafficData, refetch: refetchTraffic } = useQuery({
    queryKey: ['traffic-snapshot'],
    queryFn: () => trafficApi.getSnapshot().then(r => r.data),
    refetchInterval: 60000,
  })

  const { data: summary } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => reportsApi.getSummary().then(r => r.data),
  })

  const { data: hotspotData } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => accidentApi.getHotspots().then(r => r.data),
  })

  const { data: alertData } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => emergencyApi.getAlerts().then(r => r.data),
    refetchInterval: 30000,
  })

  const runRiskAnalysis = async () => {
    setAnalyzing(true)
    try {
      const res = await accidentApi.predictRisk(12.9716, 77.5946)
      setRiskResult(res.data)
      if (res.data.risk_level === 'CRITICAL' || res.data.risk_level === 'HIGH') {
        toast.error(`⚠ ${res.data.risk_level} risk detected!`)
      }
    } catch {
      toast.error('Risk analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  // Congestion distribution for chart
  const segments = trafficData?.segments || []
  const congestionDist = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'].map(level => ({
    name: level,
    count: segments.filter((s: any) => s.congestion_level === level).length,
  }))

  const alerts = alertData?.alerts || []
  const hotspots = hotspotData?.hotspots || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Traffic Dashboard</h1>
          <p className="text-gray-500 text-sm">AI-powered real-time road safety monitoring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetchTraffic()} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition">
            🔄 Refresh Traffic
          </button>
          <button onClick={runRiskAnalysis} disabled={analyzing}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
            {analyzing ? 'Analyzing...' : '🤖 Run Risk Analysis'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Accidents" value={summary?.accidents?.total ?? '—'} sub="Historical records" />
        <StatCard label="Fatal Accidents" value={summary?.accidents?.fatal ?? '—'} sub="Highest severity" color="#dc2626" />
        <StatCard label="Open Emergencies" value={summary?.emergencies?.open ?? '—'} sub="Requires attention" color="#ea580c" />
        <StatCard label="AI Agent Runs" value={summary?.ai_agents?.total_runs ?? '—'} sub={`$${summary?.ai_agents?.total_cost_usd?.toFixed(4) ?? '0.00'} total cost`} color="#7c5cd8" />
      </div>

      {/* Map + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Live Traffic Map</h2>
            <p className="text-xs text-gray-400">⚠ Simulated traffic data</p>
          </div>
          <div style={{ height: 380 }}>
            <TrafficMap
              segments={segments}
              hotspots={hotspots}
              showTraffic={true}
              showHotspots={true}
            />
          </div>
        </div>

        <div className="space-y-4">
          {riskResult ? (
            <RiskGauge score={riskResult.risk_score} level={riskResult.risk_level} />
          ) : (
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <p className="text-gray-400 text-sm">Click "Run Risk Analysis" to get AI prediction</p>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Congestion Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={congestionDist} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[3,3,0,0]}>
                  {congestionDist.map((entry) => (
                    <Cell key={entry.name} fill={CONGESTION_COLORS[entry.name as keyof typeof CONGESTION_COLORS] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Risk Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert: any) => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                alert.risk_level === 'CRITICAL' ? 'bg-red-50 border border-red-200' :
                alert.risk_level === 'HIGH' ? 'bg-orange-50 border border-orange-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <span className="text-lg">{alert.risk_level === 'CRITICAL' ? '🚨' : alert.risk_level === 'HIGH' ? '⚠️' : '⚡'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {riskResult?.analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-2">🤖 AI Risk Analysis Report</h2>
          <p className="text-xs text-blue-600 mb-2">Provider: {riskResult.provider} | Tokens: {riskResult.tokens_used} | Cost: ${riskResult.cost_usd}</p>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            {riskResult.analysis}
          </pre>
        </div>
      )}
    </div>
  )
}
