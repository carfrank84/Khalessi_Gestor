import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import FormCard from '../components/FormCard'
import DataTable from '../components/DataTable'
import { Pedido, Cliente, Producto, PedidoProducto } from '../types'
import { useClientes } from '../hooks/useClientes'
import { useProductos } from '../hooks/useProductos'
import { usePedidos } from '../hooks/usePedidos'

export default function Pedidos() {
  const { clientes } = useClientes()
  const { productos } = useProductos()
  const { pedidos, loading, error, addPedido, updatePedido, deletePedido } = usePedidos()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedProductos, setSelectedProductos] = useState<PedidoProducto[]>([])
  const [searchCliente, setSearchCliente] = useState('')
  const [searchProducto, setSearchProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)

  const filteredClientes = useMemo(() => {
    if (!searchCliente) return []
    return clientes
      .filter((c) =>
        String(c.id_cliente).includes(searchCliente.toLowerCase()) ||
        c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
        c.apellido.toLowerCase().includes(searchCliente.toLowerCase())
      )
      .slice(0, 5)
  }, [searchCliente, clientes])

  const filteredProductos = useMemo(() => {
    if (!searchProducto) return []
    return productos
      .filter((p) =>
        String(p.id_producto).includes(searchProducto.toLowerCase()) ||
        p.nombre_producto.toLowerCase().includes(searchProducto.toLowerCase())
      )
      .slice(0, 5)
  }, [searchProducto, productos])

  const seleccionarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setSearchCliente('')
  }

  const seleccionarProducto = (producto: Producto) => {
    setSelectedProductos([...selectedProductos, { producto, cantidad }])
    setSearchProducto('')
    setCantidad(1)
  }

  const removerProducto = (index: number) => {
    setSelectedProductos(selectedProductos.filter((_, i) => i !== index))
  }

  const finalizarPedido = () => {
    if (!selectedCliente || selectedProductos.length === 0) {
      alert('Debe seleccionar un cliente y al menos un producto')
      return
    }

    const total_costo = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_costo * item.cantidad,
      0
    )
    const total_venta = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_venta * item.cantidad,
      0
    )

    const newPedido: Omit<Pedido, 'id_pedido'> = {
      id_cliente: selectedCliente.id_cliente,
      productos: selectedProductos,
      fecha: new Date().toISOString().split('T')[0],
      total_costo,
      total_venta,
      estado: 'Pendiente',
      pago: 'Debe',
    }

    addPedido(newPedido as any)
    setSelectedCliente(null)
    setSelectedProductos([])
    setSearchCliente('')
  }

  const handleEstadoChange = async (id: string, newEstado: 'Pendiente' | 'Entregado') => {
    const pedido = pedidos.find((p) => p.id_pedido === id)
    if (!pedido) return

    try {
      await updatePedido(id, { ...pedido, estado: newEstado })
    } catch (err) {
      console.error('Error al modificar estado del pedido:', err)
      window.alert('No se pudo modificar el estado del pedido')
    }
  }

  const handlePagoChange = async (id: string, newPago: 'Debe' | 'Pagado') => {
    const pedido = pedidos.find((p) => p.id_pedido === id)
    if (!pedido) return

    try {
      await updatePedido(id, { ...pedido, pago: newPago })
    } catch (err) {
      console.error('Error al modificar pago del pedido:', err)
      window.alert('No se pudo modificar el estado de pago del pedido')
    }
  }

  const handleDeletePedido = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido?')) return

    try {
      await deletePedido(id)
    } catch (err) {
      console.error('Error al eliminar pedido:', err)
      window.alert('No se pudo eliminar el pedido')
    }
  }

  const columns = [
    { key: 'id_pedido', label: 'ID' },
    { key: 'fecha', label: 'Fecha' },
    {
      key: 'id_cliente',
      label: 'Cliente ID',
      render: (id_cliente: number) => `Cliente #${id_cliente}`,
    },
    {
      key: 'productos',
      label: 'Productos',
      render: (productos: PedidoProducto[]) => productos?.length || 0,
    },
    {
      key: 'total_venta',
      label: 'Total',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (estado: 'Pendiente' | 'Entregado', row: Pedido) => (
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
      render: (pago: 'Debe' | 'Pagado', row: Pedido) => (
        <select
          value={pago}
          onChange={(e) => handlePagoChange(row.id_pedido, e.target.value as 'Debe' | 'Pagado')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            pago === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <option value="Debe">Debe</option>
          <option value="Pagado">Pagado</option>
        </select>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, row: Pedido) => (
        <button
          onClick={() => handleDeletePedido(row.id_pedido)}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          🗑️ Eliminar
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Pedidos</h1>
          
          {loading && <p className="text-gray-600">Cargando...</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <FormCard title="Nuevo Pedido" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Cliente (ID o Nombre)
                </label>
                <input
                  type="text"
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="input-field"
                  placeholder="Buscar por ID o nombre..."
                />
                {filteredClientes.length > 0 && !selectedCliente && (
                  <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.id_cliente}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-0"
                      >
                        <span className="font-semibold">{cliente.id_cliente}</span> - {cliente.nombre} {cliente.apellido}
                      </button>
                    ))}
                  </div>
                )}
                {selectedCliente && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center">
                    <span>
                      Cliente: {selectedCliente.nombre} {selectedCliente.apellido}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCliente(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Producto
                  </label>
                  <input
                    type="text"
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="input-field"
                    placeholder="Buscar por ID o nombre..."
                  />
                  {filteredProductos.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                      {filteredProductos.map((producto) => (
                        <button
                          key={producto.id_producto}
                          type="button"
                          onClick={() => seleccionarProducto(producto)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                            <span>
                              <span className="font-semibold">{producto.id_producto}</span> - {producto.nombre_producto}
                            </span>
                            <span className="text-green-600 font-semibold">
                              ${producto.precio_venta.toFixed(2)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              {selectedProductos.length > 0 && (
                <div className="card p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Productos en el Pedido:</h3>
                  {selectedProductos.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center p-2 bg-white rounded mb-2"
                    >
                      <span>
                        {item.producto.nombre_producto} x {item.cantidad}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ${(item.producto.precio_venta * item.cantidad).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removerProducto(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="flex justify-between font-bold text-base md:text-lg">
                      <span>Total:</span>
                      <span>
                        ${selectedProductos
                          .reduce(
                            (sum, item) =>
                              sum + item.producto.precio_venta * item.cantidad,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={finalizarPedido}
                  className="btn-primary"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </FormCard>

          <DataTable
            columns={columns}
            data={pedidos}
            searchable
            searchPlaceholder="Buscar pedido..."
          />
        </div>
      </main>
    </div>
  )
}
