import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ambulanceApi } from '../api/client'
import TrafficMap from '../components/TrafficMap'
import toast from 'react-hot-toast'

export default function AmbulanceDashboard() {
  const [coordinating, setCoordinating] = useState(false)
  const [coordResult, setCoordResult] = useState<any>(null)
  const [emergencyLat, setEmergencyLat] = useState('12.9716')
  const [emergencyLng, setEmergencyLng] = useState('77.5946')

  const { data: fleetData, isLoading } = useQuery({
    queryKey: ['ambulance-fleet'],
    queryFn: () => ambulanceApi.getFleet().then(r => r.data),
    refetchInterval: 60000,
  })

  const handleCoordinate = async () => {
    setCoordinating(true)
    try {
      const res = await ambulanceApi.coordinate({
        emergency_lat: parseFloat(emergencyLat),
        emergency_lng: parseFloat(emergencyLng),
        emergency_severity: 'SEVERE',
      })
      setCoordResult(res.data)
      toast.success('Ambulance coordination complete')
    } catch {
      toast.error('Coordination failed')
    } finally {
      setCoordinating(false)
    }
  }

  const fleet = fleetData?.fleet || []
  const available = fleet.filter((a: any) => a.status === 'AVAILABLE')
  const enroute = fleet.filter((a: any) => a.status === 'ENROUTE')
  const busy = fleet.filter((a: any) => a.status === 'BUSY')

  // Convert ambulances to map segments format
  const ambulanceMarkers = fleet.map((a: any) => ({
    segment_id: a.id,
    road_name: `${a.registration_no} — ${a.hospital_name}`,
    latitude: a.latitude,
    longitude: a.longitude,
    density: 0,
    speed_kmh: a.status === 'AVAILABLE' ? 0 : 60,
    congestion_level: a.status === 'AVAILABLE' ? 'LOW' : a.status === 'ENROUTE' ? 'MEDIUM' : 'HIGH',
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ambulance Coordination</h1>
        <p className="text-gray-500 text-sm">⚠ SIMULATED ambulance fleet — not real emergency services</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-orange-50 border border-orange-300 rounded-xl p-3 text-sm text-orange-800">
        <strong>⚠ Simulation Notice:</strong> This dashboard shows a <strong>simulated</strong> ambulance fleet for demonstration purposes only.
        In real emergencies, always contact official emergency services (112 / 108).
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: fleet.length, color: '#1d4ed8' },
          { label: 'Available', value: available.length, color: '#16a34a' },
          { label: 'En Route', value: enroute.length, color: '#d97706' },
          { label: 'Busy', value: busy.length, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 border-b">
            <h2 className="font-semibold text-gray-800">Fleet Location Map (Simulated)</h2>
            <p className="text-xs text-gray-400">🟢 Available &nbsp; 🟡 En Route &nbsp; 🔴 Busy</p>
          </div>
          <div style={{ height: 380 }}>
            <TrafficMap segments={ambulanceMarkers} showTraffic={true} showHotspots={false} />
          </div>
        </div>

        {/* Coordination Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Find Nearest Ambulance</h3>
            <div className="flex gap-2 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Emergency Lat</label>
                <input type="number" step="0.0001" value={emergencyLat}
                  onChange={e => setEmergencyLat(e.target.value)}
                  className="w-32 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Emergency Lng</label>
                <input type="number" step="0.0001" value={emergencyLng}
                  onChange={e => setEmergencyLng(e.target.value)}
                  className="w-32 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button onClick={handleCoordinate} disabled={coordinating}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {coordinating ? 'Coordinating...' : '🚑 Coordinate'}
                </button>
              </div>
            </div>

            {coordResult?.primary_ambulance && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-green-700 mb-1">PRIMARY AMBULANCE</p>
                  <p className="text-sm font-semibold">{coordResult.primary_ambulance.registration_no}</p>
                  <p className="text-sm">📍 {coordResult.primary_ambulance.distance_km} km away</p>
                  <p className="text-sm">⏱ ETA: {coordResult.primary_ambulance.eta_minutes} min</p>
                  <p className="text-sm">🏥 {coordResult.primary_ambulance.hospital}</p>
                </div>
                {coordResult.backup_ambulance && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1">BACKUP AMBULANCE</p>
                    <p className="text-sm font-semibold">{coordResult.backup_ambulance.registration_no}</p>
                    <p className="text-sm">ETA: {coordResult.backup_ambulance.eta_minutes} min</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {coordResult?.recommendation && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">🤖 AI Dispatch Recommendation</h3>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-48 overflow-y-auto">
                {coordResult.recommendation}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
