import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/productos', label: 'Productos', icon: '📦' },
  { path: '/pedidos', label: 'Pedidos', icon: '🛒' },
  { path: '/ventas', label: 'Ventas', icon: '💰' },
  { path: '/stock-insumos', label: 'Stock Insumos', icon: '📋' },
]

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <aside className="w-full md:w-64 bg-white shadow-lg md:h-screen md:fixed md:left-0 md:top-0 border-b md:border-b-0 md:border-r border-gray-200 z-20">
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-primary-600 mb-4 md:mb-8">Khalessi Gestor</h1>
        
        <nav className="flex md:block gap-2 md:space-y-2 overflow-x-auto pb-2 md:pb-0">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg md:text-xl">{item.icon}</span>
                <span className="font-medium whitespace-nowrap text-sm md:text-base">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="px-4 pb-4 md:absolute md:bottom-0 md:w-full md:p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <span className="text-lg md:text-xl">🚪</span>
          <span className="font-medium text-sm md:text-base">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
