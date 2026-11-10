import React from 'react'
import { X } from 'lucide-react'

interface Props {
  review: {
    id: string
    review_type: string
    context_data: any
    created_at: string
  }
  onDecide: (decision: string, notes?: string) => void
  onClose: () => void
}

export default function HITLReviewModal({ review, onDecide, onClose }: Props) {
  const [notes, setNotes] = React.useState('')
  const ctx = review.context_data || {}
  const emergency = ctx.emergency_response || {}
  const ambulance = ctx.ambulance_coordination || {}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">🔍 Human Review Required</h2>
            <p className="text-sm text-gray-500">{review.review_type} — {new Date(review.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-800">⚠ AI-Generated Recommendation — Requires Human Approval</p>
            <p className="text-xs text-red-600 mt-1">
              Severity: <strong>{emergency.severity || 'UNKNOWN'}</strong> |
              Confidence: <strong>{((emergency.confidence || 0) * 100).toFixed(0)}%</strong>
            </p>
          </div>

          {emergency.recommendation && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Emergency Response Recommendation</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {emergency.recommendation}
              </div>
            </div>
          )}

          {ambulance.primary_ambulance && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Ambulance Dispatch Recommendation</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p>🚑 <strong>{ambulance.primary_ambulance.registration_no}</strong></p>
                <p>Distance: {ambulance.primary_ambulance.distance_km} km | ETA: {ambulance.primary_ambulance.eta_minutes} min</p>
                <p>Hospital: {ambulance.primary_ambulance.hospital}</p>
                <p className="text-xs text-orange-600 mt-1">⚠ SIMULATED ambulance — not a real dispatch</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (optional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3} placeholder="Add any notes about your decision..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onDecide('APPROVED', notes)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => onDecide('MODIFIED', notes)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition"
            >
              ✏ Modify
            </button>
            <button
              onClick={() => onDecide('REJECTED', notes)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
