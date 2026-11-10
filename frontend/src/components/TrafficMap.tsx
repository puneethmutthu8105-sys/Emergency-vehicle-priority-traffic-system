import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const riskColors: Record<string, string> = {
  LOW: '#16a34a',
  MEDIUM: '#d97706',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
}

const congestionColors: Record<string, string> = {
  LOW: '#16a34a',
  MEDIUM: '#ca8a04',
  HIGH: '#ea580c',
  SEVERE: '#dc2626',
}

interface TrafficSegment {
  segment_id: string
  road_name: string
  latitude: number
  longitude: number
  density: number
  speed_kmh: number
  congestion_level: string
}

interface Hotspot {
  id: string
  latitude: number
  longitude: number
  accident_count: number
  avg_severity_score: number
  zone_label: string
}

interface EmergencyLocation {
  id: string
  latitude: number
  longitude: number
  severity: string
  status: string
}

interface Props {
  segments?: TrafficSegment[]
  hotspots?: Hotspot[]
  emergencies?: EmergencyLocation[]
  heatmapData?: [number, number, number][]
  center?: [number, number]
  showHeatmap?: boolean
  showTraffic?: boolean
  showHotspots?: boolean
}

function HeatmapLayer({ data }: { data: [number, number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (!data || data.length === 0) return
    // Dynamic import of leaflet.heat
    import('leaflet.heat' as any).then(() => {
      const heat = (L as any).heatLayer(data, {
        radius: 35,
        blur: 20,
        maxZoom: 17,
        gradient: { 0.2: '#00ff00', 0.5: '#ffff00', 0.8: '#ff8800', 1.0: '#ff0000' }
      })
      heat.addTo(map)
      return () => { map.removeLayer(heat) }
    }).catch(() => {})
  }, [data, map])
  return null
}

export default function TrafficMap({ segments = [], hotspots = [], emergencies = [],
  heatmapData = [], center = [12.9716, 77.5946], showHeatmap = false,
  showTraffic = true, showHotspots = true }: Props) {
  return (
    <MapContainer center={center} zoom={12} className="map-container" style={{ height: '100%', minHeight: '400px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showHeatmap && heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}

      {showTraffic && segments.map(seg => (
        <CircleMarker
          key={seg.segment_id}
          center={[seg.latitude, seg.longitude]}
          radius={8}
          fillColor={congestionColors[seg.congestion_level] || '#999'}
          color="#fff"
          weight={1}
          fillOpacity={0.85}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{seg.road_name}</p>
              <p>Congestion: <span className="font-semibold">{seg.congestion_level}</span></p>
              <p>Speed: {seg.speed_kmh.toFixed(1)} km/h</p>
              <p>Density: {seg.density.toFixed(1)} veh/km</p>
              <p className="text-xs text-gray-400 mt-1">⚠ Simulated data</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {showHotspots && hotspots.map(h => (
        <CircleMarker
          key={h.id}
          center={[h.latitude, h.longitude]}
          radius={14}
          fillColor={riskColors[h.zone_label] || '#dc2626'}
          color="#fff"
          weight={2}
          fillOpacity={0.7}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">🔴 Accident Hotspot</p>
              <p>Accidents: {h.accident_count}</p>
              <p>Severity: {h.avg_severity_score?.toFixed(2)}</p>
              <p>Zone: {h.zone_label}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {emergencies.map(em => (
        <Marker key={em.id} position={[em.latitude, em.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">🚨 Emergency</p>
              <p>Severity: {em.severity}</p>
              <p>Status: {em.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
