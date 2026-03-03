import { useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import SummaryCard from '../components/SummaryCard'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'
import { usePedidos } from '../hooks/usePedidos'

export default function Dashboard() {
  const { clientes, loading: loadingClientes } = useClientes()
  const { productos, loading: loadingProductos } = useProductos()
  const { pedidos, loading: loadingPedidos } = usePedidos()

  const isLoading = loadingClientes || loadingProductos || loadingPedidos

  const ventasDelMes = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    return pedidos.reduce((sum, pedido) => {
      const fecha = new Date(pedido.fecha)
      const mismoMes = fecha.getMonth() === month && fecha.getFullYear() === year
      return mismoMes ? sum + (pedido.total_venta || 0) : sum
    }, 0)
  }, [pedidos])

  const pedidosPendientes = useMemo(
    () => pedidos.filter((p) => p.estado === 'Pendiente').length,
    [pedidos]
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Dashboard</h1>

          {isLoading && <p className="text-gray-600 mb-4">Cargando indicadores...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Clientes"
              value={String(clientes.length)}
              icon="👥"
              color="blue"
            />
            <SummaryCard
              title="Productos Activos"
              value={String(productos.length)}
              icon="📦"
              color="green"
            />
            <SummaryCard
              title="Pedidos Pendientes"
              value={String(pedidosPendientes)}
              icon="🛒"
              color="purple"
            />
            <SummaryCard
              title="Ventas del Mes"
              value={`$${ventasDelMes.toFixed(2)}`}
              icon="💰"
              color="green"
            />
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bienvenido a Khalessi Gestor
            </h2>
            <p className="text-gray-600">
              Seleccione un módulo del menú lateral para comenzar a gestionar su negocio.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
