import Sidebar from '../components/Sidebar'
import DataTable from '../components/DataTable'
import SummaryCard from '../components/SummaryCard'
import { Pedido, VentaSummary } from '../types'
import { usePedidos } from '../hooks/usePedidos'

export default function Ventas() {
  const { pedidos: ventas, loading, error, updatePedido } = usePedidos()

  const handleEstadoChange = (id: string, newEstado: 'Pendiente' | 'Entregado') => {
    const venta = ventas.find(v => v.id_pedido === id)
    if (venta) {
      updatePedido(id, { ...venta, estado: newEstado })
    }
  }

  const handlePagoChange = (id: string, newPago: 'Debe' | 'Pagado') => {
    const venta = ventas.find(v => v.id_pedido === id)
    if (venta) {
      updatePedido(id, { ...venta, pago: newPago })
    }
  }

  const summary: VentaSummary = {
    total_costo: ventas.reduce((sum, v) => sum + v.total_costo, 0),
    ganancia: ventas.reduce((sum, v) => sum + (v.total_venta - v.total_costo), 0),
    caja: ventas
      .filter(v => v.pago === 'Pagado' && v.estado === 'Entregado')
      .reduce((sum, v) => sum + v.total_venta, 0),
  }

  const columns = [
    { key: 'id_pedido', label: 'ID' },
    { key: 'fecha', label: 'Fecha' },
    { 
      key: 'id_cliente', 
      label: 'Cliente ID',
      render: (value: number) => `Cliente #${value}`
    },
    { 
      key: 'total_costo', 
      label: 'Costo',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'total_venta', 
      label: 'Venta',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'ganancia', 
      label: 'Ganancia',
      render: (_: any, row: Pedido) => {
        const ganancia = row.total_venta - row.total_costo
        return `$${ganancia.toFixed(2)}`
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (estado: string, row: Pedido) => (
        <select
          value={estado}
          onChange={(e) => handleEstadoChange(row.id_pedido, e.target.value as 'Pendiente' | 'Entregado')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            estado === 'Entregado'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Entregado">Entregado</option>
        </select>
      ),
    },
    {
      key: 'pago',
      label: 'Pago',
      render: (pago: string, row: Pedido) => (
        <select
          value={pago}
          onChange={(e) => handlePagoChange(row.id_pedido, e.target.value as 'Debe' | 'Pagado')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            pago === 'Pagado'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <option value="Debe">Debe</option>
          <option value="Pagado">Pagado</option>
        </select>
      ),
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Ventas</h1>
          
          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Costo"
              value={`$${summary.total_costo.toFixed(2)}`}
              icon="💸"
              color="red"
            />
            <SummaryCard
              title="Ganancia"
              value={`$${summary.ganancia.toFixed(2)}`}
              icon="📈"
              color="green"
            />
            <SummaryCard
              title="Caja (Efectivo)"
              value={`$${summary.caja.toFixed(2)}`}
              icon="💰"
              color="blue"
            />
          </div>

          <DataTable
            columns={columns}
            data={ventas}
            searchable
            searchPlaceholder="Buscar venta..."
          />
        </div>
      </main>
    </div>
  )
}
