import { useState, useMemo } from 'react'
import { jsPDF } from 'jspdf'
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
  const [bonificacion, setBonificacion] = useState('0')
  const [observaciones, setObservaciones] = useState('')
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [editarDetalle, setEditarDetalle] = useState(false)
  const [detalleProductos, setDetalleProductos] = useState<PedidoProducto[]>([])
  const [detalleObservaciones, setDetalleObservaciones] = useState('')
  const [detalleBonificacion, setDetalleBonificacion] = useState('0')

  const obtenerCantidadValida = (valor: number) => {
    if (!Number.isFinite(valor) || valor < 1) return 1
    return Math.floor(valor)
  }

  const enriquecerProducto = (item: PedidoProducto): PedidoProducto => {
    const catalogo = productos.find(
      (p) => String(p.id_producto) === String(item.producto.id_producto)
    )

    return {
      ...item,
      producto: {
        ...item.producto,
        nombre_producto: catalogo?.nombre_producto || item.producto.nombre_producto,
        precio_costo: catalogo?.precio_costo ?? item.producto.precio_costo,
        precio_venta: item.producto.precio_venta || catalogo?.precio_venta || 0,
      },
      cantidad: obtenerCantidadValida(item.cantidad),
    }
  }

  const subtotalVenta = selectedProductos.reduce(
    (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
    0
  )
  const bonificacionNumero = Math.max(0, parseFloat(bonificacion) || 0)
  const bonificacionAplicada = Math.min(bonificacionNumero, subtotalVenta)
  const totalFinalVenta = Math.max(0, subtotalVenta - bonificacionAplicada)

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
    const cantidadValida = 1

    setSelectedProductos((prev) => {
      const indexExistente = prev.findIndex(
        (item) => item.producto.id_producto === producto.id_producto
      )

      if (indexExistente === -1) {
        return [...prev, { producto, cantidad: cantidadValida }]
      }

      return prev.map((item, index) =>
        index === indexExistente
          ? { ...item, cantidad: obtenerCantidadValida(item.cantidad) + cantidadValida }
          : item
      )
    })

    setSearchProducto('')
  }

  const removerProducto = (index: number) => {
    setSelectedProductos(selectedProductos.filter((_, i) => i !== index))
  }

  const actualizarCantidadProducto = (index: number, nuevaCantidad: number) => {
    const cantidadValida = obtenerCantidadValida(nuevaCantidad)
    setSelectedProductos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: cantidadValida } : item
      )
    )
  }

  const actualizarCantidadDetalle = (index: number, nuevaCantidad: number) => {
    const cantidadValida = obtenerCantidadValida(nuevaCantidad)
    setDetalleProductos((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, cantidad: cantidadValida } : item
      )
    )
  }

  const removerProductoDetalle = (index: number) => {
    setDetalleProductos((prev) => prev.filter((_, i) => i !== index))
  }

  const finalizarPedido = () => {
    if (!selectedCliente || selectedProductos.length === 0) {
      alert('Debe seleccionar un cliente y al menos un producto')
      return
    }

    const total_costo = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_costo * obtenerCantidadValida(item.cantidad),
      0
    )
    const total_venta = selectedProductos.reduce(
      (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
      0
    )

    const newPedido: Omit<Pedido, 'id_pedido'> = {
      id_cliente: selectedCliente.id_cliente,
      productos: selectedProductos,
      fecha: new Date().toISOString().split('T')[0],
      total_costo,
      total_venta: Math.max(0, total_venta - bonificacionAplicada),
      observaciones,
      bonificacion: bonificacionAplicada,
      estado: 'Pendiente',
      pago: 'Debe',
    }

    addPedido(newPedido as any)
    setSelectedCliente(null)
    setSelectedProductos([])
    setSearchCliente('')
    setBonificacion('0')
    setObservaciones('')
  }

  const abrirDetallePedido = (pedido: Pedido) => {
    const productosDetalle = (pedido.productos || []).map((item) => enriquecerProducto(item))
    setPedidoDetalle({ ...pedido, productos: productosDetalle })
    setDetalleProductos(productosDetalle)
    setDetalleObservaciones(pedido.observaciones || '')
    setDetalleBonificacion(String(pedido.bonificacion || 0))
    setEditarDetalle(false)
    setMostrarDetalle(true)
  }

  const cerrarDetallePedido = () => {
    setMostrarDetalle(false)
    setEditarDetalle(false)
    setPedidoDetalle(null)
    setDetalleProductos([])
    setDetalleObservaciones('')
    setDetalleBonificacion('0')
  }

  const detalleSubtotal = detalleProductos.reduce(
    (sum, item) => sum + item.producto.precio_venta * obtenerCantidadValida(item.cantidad),
    0
  )
  const detalleBonificacionNumero = Math.max(0, parseFloat(detalleBonificacion) || 0)
  const detalleBonificacionAplicada = Math.min(detalleBonificacionNumero, detalleSubtotal)
  const detalleTotalFinal = Math.max(0, detalleSubtotal - detalleBonificacionAplicada)
  const detalleTotalCosto = detalleProductos.reduce(
    (sum, item) => sum + item.producto.precio_costo * obtenerCantidadValida(item.cantidad),
    0
  )

  const guardarCambiosPedido = async () => {
    if (!pedidoDetalle) return

    try {
      await updatePedido(String(pedidoDetalle.id_pedido), {
        ...pedidoDetalle,
        productos: detalleProductos,
        total_costo: detalleTotalCosto,
        total_venta: detalleTotalFinal,
        observaciones: detalleObservaciones,
        bonificacion: detalleBonificacionAplicada,
      })

      setPedidoDetalle({
        ...pedidoDetalle,
        productos: detalleProductos,
        total_costo: detalleTotalCosto,
        total_venta: detalleTotalFinal,
        observaciones: detalleObservaciones,
        bonificacion: detalleBonificacionAplicada,
      })
      setEditarDetalle(false)
    } catch (err) {
      console.error('Error al guardar cambios del pedido:', err)
      window.alert('No se pudo actualizar el pedido')
    }
  }

  const construirHtmlRemito = () => {
    if (!pedidoDetalle) return ''

    const cliente = clientes.find(
      (c) => String(c.id_cliente) === String(pedidoDetalle.id_cliente)
    )
    const nombreCliente = cliente
      ? `${cliente.nombre} ${cliente.apellido}`.trim()
      : `Cliente #${pedidoDetalle.id_cliente}`
    const telefonoCliente = cliente?.telefono?.trim()

    const filas = detalleProductos
      .map((item) => {
        const cantidadItem = obtenerCantidadValida(item.cantidad)
        const parcial = item.producto.precio_venta * cantidadItem
        return `<tr><td>${item.producto.nombre_producto}</td><td style="text-align:center">${cantidadItem}</td><td style="text-align:right">$${item.producto.precio_venta.toFixed(2)}</td><td style="text-align:right">$${parcial.toFixed(2)}</td></tr>`
      })
      .join('')

    return `
      <html>
        <head>
          <title>Remito Pedido #${pedidoDetalle.id_pedido}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            .meta { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f5f5f5; }
            .totales { margin-top: 16px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Remito</h1>
          <div class="meta">
            <div><strong>Pedido:</strong> #${pedidoDetalle.id_pedido}</div>
            <div><strong>Fecha:</strong> ${pedidoDetalle.fecha}</div>
            <div><strong>Cliente:</strong> ${nombreCliente}</div>
            <div><strong>Cliente ID:</strong> ${pedidoDetalle.id_cliente}</div>
            ${telefonoCliente ? `<div><strong>Teléfono:</strong> ${telefonoCliente}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Importe Parcial</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
          <div class="totales">
            <div>Subtotal: $${detalleSubtotal.toFixed(2)}</div>
            <div>Bonificación: -$${detalleBonificacionAplicada.toFixed(2)}</div>
            <div><strong>Total Final: $${detalleTotalFinal.toFixed(2)}</strong></div>
          </div>
        </body>
      </html>
    `
  }

  const imprimirRemito = () => {
    const html = construirHtmlRemito()
    if (!html) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.alert('No se pudo abrir la ventana de impresión')
      return
    }

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const exportarRemitoPDF = () => {
    if (!pedidoDetalle) return

    const cliente = clientes.find(
      (c) => String(c.id_cliente) === String(pedidoDetalle.id_cliente)
    )
    const nombreCliente = cliente
      ? `${cliente.nombre} ${cliente.apellido}`.trim()
      : `Cliente #${pedidoDetalle.id_cliente}`
    const telefonoCliente = cliente?.telefono?.trim()

    const pdf = new jsPDF()
    let y = 15

    pdf.setFontSize(16)
    pdf.text(`Remito - Pedido #${pedidoDetalle.id_pedido}`, 14, y)
    y += 8

    pdf.setFontSize(11)
    pdf.text(`Fecha: ${pedidoDetalle.fecha}`, 14, y)
    y += 6
    pdf.text(`Cliente: ${nombreCliente}`, 14, y)
    y += 6
    pdf.text(`Cliente ID: ${pedidoDetalle.id_cliente}`, 14, y)
    if (telefonoCliente) {
      y += 6
      pdf.text(`Teléfono: ${telefonoCliente}`, 14, y)
    }
    y += 10

    pdf.text('Producto', 14, y)
    pdf.text('Cant.', 105, y)
    pdf.text('P. Unitario', 130, y)
    pdf.text('Parcial', 170, y)
    y += 4
    pdf.line(14, y, 196, y)
    y += 6

    detalleProductos.forEach((item) => {
      const cantidadItem = obtenerCantidadValida(item.cantidad)
      const parcial = item.producto.precio_venta * cantidadItem

      if (y > 270) {
        pdf.addPage()
        y = 15
      }

      pdf.text(item.producto.nombre_producto.substring(0, 45), 14, y)
      pdf.text(String(cantidadItem), 107, y)
      pdf.text(`$${item.producto.precio_venta.toFixed(2)}`, 130, y)
      pdf.text(`$${parcial.toFixed(2)}`, 170, y)
      y += 6
    })

    y += 4
    pdf.line(14, y, 196, y)
    y += 8
    pdf.text(`Subtotal: $${detalleSubtotal.toFixed(2)}`, 140, y)
    y += 6
    pdf.text(`Bonificación: -$${detalleBonificacionAplicada.toFixed(2)}`, 140, y)
    y += 6
    pdf.text(`Total Final: $${detalleTotalFinal.toFixed(2)}`, 140, y)

    pdf.save(`remito-pedido-${pedidoDetalle.id_pedido}.pdf`)
  }

  const handleEstadoChange = async (id: string, newEstado: 'Pendiente' | 'Terminado' | 'Entregado') => {
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
      label: 'Cliente',
      render: (id_cliente: number | string) => {
        const cliente = clientes.find(
          (c) => String(c.id_cliente) === String(id_cliente)
        )

        if (!cliente) return `Cliente #${id_cliente}`

        return `${cliente.nombre} ${cliente.apellido}`.trim()
      },
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
      render: (estado: 'Pendiente' | 'Terminado' | 'Entregado', row: Pedido) => (
        <select
          value={estado}
          onChange={(e) => handleEstadoChange(row.id_pedido, e.target.value as 'Pendiente' | 'Terminado' | 'Entregado')}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            estado === 'Entregado'
              ? 'bg-green-100 text-green-800'
              : estado === 'Terminado'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Terminado">Terminado</option>
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => abrirDetallePedido(row)}
            className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
          >
            Ver detalle
          </button>
          <button
            onClick={() => handleDeletePedido(row.id_pedido)}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            🗑️ Eliminar
          </button>
        </div>
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
                <div className="md:col-span-3 relative">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonificación ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bonificacion}
                  onChange={(e) => setBonificacion(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones del Pedido
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="input-field min-h-[90px]"
                  placeholder="Ejemplo: Diseño A4 de flores, colores pastel, tipografía serif..."
                />
              </div>

              {selectedProductos.length > 0 && (
                <div className="card p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3">Productos en el Pedido:</h3>
                  {selectedProductos.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center p-2 bg-white rounded mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span>{item.producto.nombre_producto}</span>
                        <input
                          type="number"
                          min="1"
                          value={obtenerCantidadValida(item.cantidad)}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              actualizarCantidadProducto(index, 1)
                              return
                            }

                            const parsed = parseInt(value, 10)
                            actualizarCantidadProducto(index, parsed)
                          }}
                          className="input-field w-20"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          ${(item.producto.precio_venta * obtenerCantidadValida(item.cantidad)).toFixed(2)}
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
                    <div className="flex justify-between text-sm md:text-base mb-1">
                      <span>Subtotal:</span>
                      <span>${subtotalVenta.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base mb-1">
                      <span>Bonificación:</span>
                      <span>-${bonificacionAplicada.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base md:text-lg">
                      <span>Total:</span>
                      <span>${totalFinalVenta.toFixed(2)}</span>
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

          {mostrarDetalle && pedidoDetalle && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Detalle Pedido #{pedidoDetalle.id_pedido}</h2>
                  <button
                    type="button"
                    onClick={cerrarDetallePedido}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold">{pedidoDetalle.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente ID</p>
                    <p className="font-semibold">{pedidoDetalle.id_cliente}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Observaciones</p>
                  {editarDetalle ? (
                    <textarea
                      value={detalleObservaciones}
                      onChange={(e) => setDetalleObservaciones(e.target.value)}
                      className="input-field min-h-[90px]"
                    />
                  ) : (
                    <p className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {detalleObservaciones || '-'}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Productos</h3>
                  <div className="space-y-2">
                    {detalleProductos.length === 0 && (
                      <p className="text-sm text-gray-500">No hay productos cargados en este pedido.</p>
                    )}
                    {detalleProductos.map((item, index) => {
                      const cantidadItem = obtenerCantidadValida(item.cantidad)
                      const parcial = item.producto.precio_venta * cantidadItem

                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between sm:items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span>{item.producto.nombre_producto}</span>
                            {editarDetalle ? (
                              <input
                                type="number"
                                min="1"
                                value={cantidadItem}
                                onChange={(e) => {
                                  const parsed = parseInt(e.target.value || '1', 10)
                                  actualizarCantidadDetalle(index, parsed)
                                }}
                                className="input-field w-20"
                              />
                            ) : (
                              <span className="font-medium">x {cantidadItem}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold">${parcial.toFixed(2)}</span>
                            {editarDetalle && (
                              <button
                                type="button"
                                onClick={() => removerProductoDetalle(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-500 mb-2">Bonificación ($)</label>
                  {editarDetalle ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalleBonificacion}
                      onChange={(e) => setDetalleBonificacion(e.target.value)}
                      className="input-field max-w-xs"
                    />
                  ) : (
                    <p className="font-semibold">${detalleBonificacionAplicada.toFixed(2)}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal</span>
                    <span>${detalleSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bonificación</span>
                    <span>-${detalleBonificacionAplicada.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${detalleTotalFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={imprimirRemito}
                    className="btn-secondary"
                  >
                    Imprimir Remito
                  </button>
                  <button
                    type="button"
                    onClick={exportarRemitoPDF}
                    className="btn-secondary"
                  >
                    Exportar PDF
                  </button>
                  {editarDetalle ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditarDetalle(false)}
                        className="btn-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={guardarCambiosPedido}
                        className="btn-primary"
                      >
                        Guardar cambios
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditarDetalle(true)}
                      className="btn-primary"
                    >
                      Editar Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
