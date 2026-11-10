import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { accidentApi } from '../api/client'
import TrafficMap from '../components/TrafficMap'
import toast from 'react-hot-toast'

export default function AccidentMap() {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [detecting, setDetecting] = useState(false)

  const { data: hotspotsData, refetch } = useQuery({
    queryKey: ['hotspots'],
    queryFn: () => accidentApi.getHotspots().then(r => r.data),
  })

  const { data: historyData } = useQuery({
    queryKey: ['accident-history'],
    queryFn: () => accidentApi.getHistory(500).then(r => r.data),
  })

  const runDetection = async () => {
    setDetecting(true)
    try {
      await accidentApi.detectHotspots()
      await refetch()
      toast.success('Hotspot detection complete!')
    } catch {
      toast.error('Hotspot detection failed')
    } finally {
      setDetecting(false)
    }
  }

  const hotspots = hotspotsData?.hotspots || []
  const accidents = historyData?.accidents || []

  // Build heatmap data from accidents
  const heatmapData: [number, number, number][] = accidents.map((a: any) => {
    const intensity = a.severity === 'fatal' ? 1.0 : a.severity === 'severe' ? 0.75 : a.severity === 'moderate' ? 0.5 : 0.25
    return [a.latitude, a.longitude, intensity]
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accident Hotspot Map</h1>
          <p className="text-gray-500 text-sm">Geographical heatmap of accident-prone locations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHeatmap(v => !v)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            {showHeatmap ? '🗺 Hide Heatmap' : '🔥 Show Heatmap'}
          </button>
          <button onClick={runDetection} disabled={detecting}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
            {detecting ? 'Detecting...' : '🤖 Detect Hotspots'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Accidents</p>
          <p className="text-2xl font-bold text-blue-600">{accidents.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Hotspots Identified</p>
          <p className="text-2xl font-bold text-orange-600">{hotspots.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Critical Zones</p>
          <p className="text-2xl font-bold text-red-600">
            {hotspots.filter((h: any) => h.zone_label === 'CRITICAL').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Accident Heatmap</h2>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Low Risk</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" />Critical</span>
          </div>
        </div>
        <div style={{ height: 500 }}>
          <TrafficMap
            hotspots={hotspots}
            heatmapData={heatmapData}
            showHeatmap={showHeatmap}
            showTraffic={false}
            showHotspots={true}
          />
        </div>
      </div>

      {/* Hotspot Table */}
      {hotspots.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Top Accident Hotspots</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Accidents</th>
                  <th className="pb-2">Avg Severity</th>
                  <th className="pb-2">Risk Level</th>
                  <th className="pb-2">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.slice(0, 10).map((h: any) => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2">{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</td>
                    <td className="py-2 font-semibold">{h.accident_count}</td>
                    <td className="py-2">{h.avg_severity_score?.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        h.zone_label === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        h.zone_label === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{h.zone_label}</span>
                    </td>
                    <td className="py-2 text-gray-400">{new Date(h.last_computed_at).toLocaleDateString()}</td>
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
