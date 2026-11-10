import React, { useState } from 'react'
import { accidentApi, roadConditionApi } from '../api/client'
import RiskGauge from '../components/RiskGauge'
import TrafficMap from '../components/TrafficMap'
import toast from 'react-hot-toast'

export default function RiskAnalysis() {
  const [lat, setLat] = useState('12.9716')
  const [lng, setLng] = useState('77.5946')
  const [riskResult, setRiskResult] = useState<any>(null)
  const [roadResult, setRoadResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [roadLoading, setRoadLoading] = useState(false)

  const runRisk = async () => {
    setLoading(true)
    try {
      const res = await accidentApi.predictRisk(parseFloat(lat), parseFloat(lng))
      setRiskResult(res.data)
      toast.success('Risk analysis complete')
    } catch {
      toast.error('Risk analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const runRoadAnalysis = async () => {
    setRoadLoading(true)
    try {
      const res = await roadConditionApi.analyze()
      setRoadResult(res.data)
      toast.success('Road condition analysis complete')
    } catch {
      toast.error('Road condition analysis failed')
    } finally {
      setRoadLoading(false)
    }
  }

  const markerPos = riskResult ? [riskResult.location.lat, riskResult.location.lng] : null

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Risk Analysis</h1>
        <p className="text-gray-500 text-sm">Predict accident risk for any location using AI agents</p>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Analyze Location</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Latitude</label>
            <input type="number" value={lat} onChange={e => setLat(e.target.value)} step="0.0001"
              className="border rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longitude</label>
            <input type="number" value={lng} onChange={e => setLng(e.target.value)} step="0.0001"
              className="border rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={runRisk} disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Predicting...' : '🤖 Predict Risk'}
          </button>
          <button onClick={runRoadAnalysis} disabled={roadLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50">
            {roadLoading ? 'Analyzing...' : '🛣 Road Conditions'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Result */}
        {riskResult && (
          <div className="space-y-4">
            <RiskGauge score={riskResult.risk_score} level={riskResult.risk_level} />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
              <p className="font-semibold text-blue-800">⚠ This is a PREDICTED risk — not a confirmed accident</p>
              <p className="text-blue-600 mt-1">Provider: {riskResult.provider} | Tokens: {riskResult.tokens_used} | Cost: ${riskResult.cost_usd}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Risk Factors</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Traffic Congestion</span>
                  <span className="font-medium">{riskResult.factors?.traffic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weather</span>
                  <span className="font-medium capitalize">{riskResult.factors?.weather}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Road Hazard Score</span>
                  <span className="font-medium">{riskResult.factors?.road_hazards?.toFixed(1)}/10</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                {riskResult.analysis}
              </pre>
            </div>
          </div>
        )}

        {/* Road Conditions */}
        {roadResult && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Road Condition Report</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Safety Rating</p>
                  <p className="text-2xl font-bold text-green-700">{roadResult.safety_rating}/10</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Critical Hazards</p>
                  <p className="text-2xl font-bold text-orange-700">{roadResult.critical_hazards_count}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">Hazard Types: {roadResult.hazard_types?.join(', ')}</p>
              <p className="text-xs text-gray-500">Weather: {roadResult.weather_condition}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Road Condition Analysis</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                {roadResult.report}
              </pre>
            </div>
          </div>
        )}

        {!riskResult && !roadResult && (
          <div className="lg:col-span-2 bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-400 text-lg">🤖 Enter coordinates and run analysis</p>
            <p className="text-gray-300 text-sm mt-2">Default: Bangalore City Center</p>
          </div>
        )}
      </div>
    </div>
  )
}
