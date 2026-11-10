import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, Map, AlertTriangle, Ambulance,
  FileText, Settings, LogOut, Radio
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accident-map', label: 'Accident Map', icon: Map },
  { to: '/risk-analysis', label: 'Risk Analysis', icon: AlertTriangle },
  { to: '/emergency', label: 'Emergency', icon: Radio },
  { to: '/ambulance', label: 'Ambulance', icon: Ambulance },
  { to: '/reports', label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-5 border-b border-blue-800">
        <div className="text-2xl font-bold">🚦 RoadSafe AI</div>
        <div className="text-xs text-blue-300 mt-1">IBM Bob Agentic Platform</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-blue-700 text-white font-semibold' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              isActive ? 'bg-blue-700 text-white font-semibold' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            }`
          }>
            <Settings className="w-4 h-4" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-blue-800">
        <div className="text-xs text-blue-300 mb-2">{user?.name} ({user?.role})</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-blue-200 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
