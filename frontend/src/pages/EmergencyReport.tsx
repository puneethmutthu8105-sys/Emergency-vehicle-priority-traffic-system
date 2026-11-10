import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { emergencyApi } from '../api/client'
import HITLReviewModal from '../components/HITLReviewModal'
import toast from 'react-hot-toast'

export default function EmergencyReport() {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    latitude: '12.9716',
    longitude: '77.5946',
    description: '',
    severity: 'moderate',
    injuries_count: '0',
    vehicles_involved: '1',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedReview, setSelectedReview] = useState<any>(null)

  const { data: reportsData, refetch } = useQuery({
    queryKey: ['emergency-reports'],
    queryFn: () => emergencyApi.listReports().then(r => r.data),
  })

  const { data: hitlData, refetch: refetchHITL } = useQuery({
    queryKey: ['hitl-queue'],
    queryFn: () => emergencyApi.getHITLQueue().then(r => r.data),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await emergencyApi.createReport({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        injuries_count: parseInt(form.injuries_count),
        vehicles_involved: parseInt(form.vehicles_involved),
      })
      setResult(res.data)
      toast.success('Emergency report submitted!')
      refetch()
      refetchHITL()
    } catch {
      toast.error('Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHITLDecision = async (decision: string, notes?: string) => {
    try {
      await emergencyApi.submitHITLDecision(selectedReview.id, decision, notes)
      toast.success(`Decision recorded: ${decision}`)
      setSelectedReview(null)
      refetchHITL()
    } catch {
      toast.error('Failed to record decision')
    }
  }

  const reports = reportsData?.reports || []
  const hitlQueue = hitlData?.pending_reviews || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emergency Reporting</h1>
        <p className="text-gray-500 text-sm">Submit accident reports and get AI-powered response recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">🚨 Report Emergency</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input type="number" step="0.0001" value={form.latitude}
                  onChange={e => setForm({...form, latitude: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input type="number" step="0.0001" value={form.longitude}
                  onChange={e => setForm({...form, longitude: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3} placeholder="Describe the accident..." required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}
                  className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="fatal">Fatal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Injuries</label>
                <input type="number" min="0" value={form.injuries_count}
                  onChange={e => setForm({...form, injuries_count: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Vehicles</label>
                <input type="number" min="1" value={form.vehicles_involved}
                  onChange={e => setForm({...form, vehicles_involved: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50">
              {submitting ? 'Submitting & Running AI Analysis...' : '🚨 Submit Emergency Report'}
            </button>
          </form>
        </div>

        {/* AI Response */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🤖 AI Emergency Response</h3>
              {result.pipeline_result?.emergency_response && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      result.pipeline_result.emergency_response.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      result.pipeline_result.emergency_response.severity === 'SEVERE' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {result.pipeline_result.emergency_response.severity}
                    </span>
                    {result.pipeline_result.hitl_required && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                        🔍 HITL Review Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Resources needed: {result.pipeline_result.emergency_response.resources_needed?.join(', ')}
                  </p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-48 overflow-y-auto">
                    {result.pipeline_result.emergency_response.recommendation}
                  </pre>
                </div>
              )}
            </div>
            {result.pipeline_result?.ambulance_coordination?.primary_ambulance && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-1">🚑 Ambulance Dispatch (SIMULATED)</h3>
                <p className="text-xs text-orange-600 mb-2">⚠ This is a simulated fleet — contact real emergency services</p>
                <p className="text-sm"><strong>{result.pipeline_result.ambulance_coordination.primary_ambulance.registration_no}</strong></p>
                <p className="text-sm">ETA: {result.pipeline_result.ambulance_coordination.primary_ambulance.eta_minutes} min | {result.pipeline_result.ambulance_coordination.primary_ambulance.distance_km} km</p>
                <p className="text-sm">Hospital: {result.pipeline_result.ambulance_coordination.primary_ambulance.hospital}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* HITL Queue */}
      {hitlQueue.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">🔍 Human Review Queue ({hitlQueue.length} pending)</h2>
          <div className="space-y-2">
            {hitlQueue.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{item.review_type}</p>
                  <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedReview(item)}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Emergency Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-400 text-sm">No reports yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Injuries</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">HITL</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</td>
                    <td className="py-2 capitalize">{r.severity}</td>
                    <td className="py-2">{r.injuries_count}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                        r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-2">{r.hitl_required ? '🔍 Required' : '—'}</td>
                    <td className="py-2 text-gray-400">{new Date(r.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReview && (
        <HITLReviewModal
          review={selectedReview}
          onDecide={handleHITLDecision}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  )
}
