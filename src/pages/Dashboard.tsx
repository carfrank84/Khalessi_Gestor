import { Link } from 'react-router-dom'
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

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    if (Number.isNaN(date.getTime())) return fecha
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()
    return `${dia}/${mes}/${anio}`
  }

  const pedidosPendientesListado = useMemo(() => {
    return pedidos
      .filter((p) => p.estado === 'Pendiente')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 8)
      .map((pedido) => {
        const cliente = clientes.find((c) => String(c.id_cliente) === String(pedido.id_cliente))
        const nombreCliente = cliente
          ? `${cliente.nombre} ${cliente.apellido}`.trim()
          : `Cliente #${pedido.id_cliente}`

        return {
          id: String(pedido.id_pedido),
          cliente: nombreCliente,
          fecha: formatearFecha(pedido.fecha),
          total: pedido.total_venta || 0,
        }
      })
  }, [pedidos, clientes])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-zinc-100 via-violet-100/60 to-amber-100/70">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8 rounded-2xl p-[1px] bg-gradient-to-r from-black via-violet-700 to-amber-500 shadow-md">
            <div className="rounded-2xl bg-gradient-to-r from-zinc-950 via-violet-950 to-zinc-900 p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-300 mt-2">Resumen general de tu operación diaria.</p>
            </div>
          </div>

          {isLoading && <p className="text-violet-900 mb-4">Cargando indicadores...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Clientes"
              value={String(clientes.length)}
              icon="👥"
              color="brand"
            />
            <SummaryCard
              title="Productos Activos"
              value={String(productos.length)}
              icon="📦"
              color="accent"
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
              color="gold"
            />
          </div>

          <div className="max-w-3xl mx-auto rounded-xl border border-violet-200 bg-white/90 backdrop-blur-sm p-6 shadow-sm text-center mb-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Bienvenido a Khalessi Gestor
            </h2>
            <p className="text-zinc-700">
              Seleccione un módulo del menú lateral para comenzar a gestionar su negocio.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-xl border border-violet-200 bg-white/90 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Pedidos pendientes (acceso rápido)</h3>
              <Link
                to="/pedidos?estado=Pendiente"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 transition-colors"
              >
                Ver todos los pendientes
              </Link>
            </div>

            {pedidosPendientesListado.length === 0 ? (
              <p className="text-zinc-600">No hay pedidos pendientes por preparar.</p>
            ) : (
              <div className="space-y-2">
                {pedidosPendientesListado.map((pedido) => (
                  <Link
                    key={pedido.id}
                    to={`/pedidos?estado=Pendiente&id=${encodeURIComponent(pedido.id)}`}
                    className="block rounded-lg border border-violet-100 bg-zinc-50 hover:bg-violet-50 transition-colors px-4 py-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold text-zinc-900">Pedido #{pedido.id} · {pedido.cliente}</p>
                      <p className="text-sm text-zinc-700">{pedido.fecha} · ${pedido.total.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
